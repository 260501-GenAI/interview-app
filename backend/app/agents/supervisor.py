"""
LangGraph StateGraph Supervisor for Interview Preparation.

Uses StateGraph pattern from LangGraph v1.0 with:
- Explicit nodes: gather_context, generate_question, assess_answer, route_followup
- TypedDict state for interview tracking
- HITL (Human-in-the-Loop) for assessment approval
- Conditional edges for follow-up routing
"""
from typing import TypedDict, Annotated, Literal
from operator import add
from functools import lru_cache

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import interrupt
from langchain.chat_models import init_chat_model
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

from app.config import Settings


# ============ State Definition ============

class InterviewState(TypedDict):
    """State for the interview workflow using TypedDict."""
    
    # Message history (accumulates with reducer)
    messages: Annotated[list, add]
    
    # Session configuration
    topic: str
    context: str  # RAG context from materials
    max_followups: int
    
    # Question tracking
    current_question: str
    question_count: int
    followup_count: int
    
    # Answer and assessment
    current_answer: str
    last_assessment: dict | None
    needs_followup: bool
    
    # HITL flags
    awaiting_approval: bool
    approved: bool


# ============ Node Functions ============

def gather_context_node(state: InterviewState) -> dict:
    """
    Gather context from materials and/or research the topic.
    This prepares the context for question generation.
    """
    model = init_chat_model("openai:gpt-4o-mini")
    
    messages = [
        SystemMessage(content="""You are a Document Analyst. Analyze the provided 
context and topic to identify key concepts, definitions, and areas suitable 
for interview questions. Summarize the most important points."""),
        HumanMessage(content=f"""Topic: {state['topic']}

Available Context:
{state.get('context', 'No materials provided. Use general knowledge.')}

Identify 3-5 key areas that should be assessed in an interview about this topic.""")
    ]
    
    response = model.invoke(messages)
    
    return {
        "messages": [AIMessage(content=f"[Context Analysis] {response.content}")],
        "context": response.content  # Overwrite with enriched context
    }


def generate_question_node(state: InterviewState) -> dict:
    """
    Generate the next interview question based on context.
    Returns ONE question at a time to simulate real interview.
    """
    model = init_chat_model("openai:gpt-4o-mini")
    
    # Determine if this is a follow-up or new question
    is_followup = state.get("needs_followup", False) and state["followup_count"] < state["max_followups"]
    
    if is_followup:
        prompt = f"""Generate a follow-up question to clarify the candidate's 
previous answer. The answer was: "{state.get('current_answer', '')}"

Topic: {state['topic']}
Context: {state['context']}

Generate ONE specific follow-up question that probes deeper into their understanding."""
    else:
        prompt = f"""Generate an interview question for the following topic.

Topic: {state['topic']}
Context: {state['context']}
Questions asked so far: {state['question_count']}

Generate ONE clear, focused question. Mix difficulty levels across questions.
Return ONLY the question, no preamble."""

    messages = [
        SystemMessage(content="""You are a Mock Interviewer conducting professional 
interview practice. Generate clear, focused questions that test understanding, 
not just recall. Be encouraging but maintain professionalism."""),
        HumanMessage(content=prompt)
    ]
    
    response = model.invoke(messages)
    question = response.content.strip()
    
    # Update counts based on question type
    new_question_count = state["question_count"]
    new_followup_count = state["followup_count"]
    
    if is_followup:
        new_followup_count += 1
    else:
        new_question_count += 1
        # Reset followup count for new question
        new_followup_count = 0
    
    return {
        "messages": [AIMessage(content=f"[Question] {question}")],
        "current_question": question,
        "question_count": new_question_count,
        "followup_count": new_followup_count,
        "needs_followup": False,  # Reset after generating
        "awaiting_approval": False
    }


def assess_answer_node(state: InterviewState) -> dict:
    """
    Assess the candidate's answer and determine if follow-up is needed.
    Uses structured output for consistent assessment format.
    """
    model = init_chat_model("openai:gpt-4o-mini")
    
    messages = [
        SystemMessage(content="""You are a Performance Critic assessing interview answers.
Evaluate for: accuracy, completeness, clarity, and practical understanding.

Provide your assessment in this exact format:
SCORE: [0-100]
FEEDBACK: [Detailed constructive feedback]
STRENGTHS: [Key strengths, comma-separated]
WEAKNESSES: [Areas for improvement, comma-separated]
NEEDS_FOLLOWUP: [YES or NO - only YES if answer was incomplete or unclear]"""),
        HumanMessage(content=f"""Question: {state['current_question']}

Candidate's Answer: {state['current_answer']}

Topic Context: {state['topic']}

Assess this answer:""")
    ]
    
    response = model.invoke(messages)
    assessment_text = response.content
    
    # Parse assessment (simple parsing - production would use structured output)
    assessment = _parse_assessment(assessment_text)
    
    # Determine if follow-up is needed and allowed
    needs_followup = (
        assessment.get("needs_followup", False) and 
        state["followup_count"] < state["max_followups"]
    )
    
    return {
        "messages": [AIMessage(content=f"[Assessment] {assessment_text}")],
        "last_assessment": assessment,
        "needs_followup": needs_followup,
        "awaiting_approval": True  # Trigger HITL
    }


def _parse_assessment(text: str) -> dict:
    """Parse structured assessment from model response."""
    assessment = {
        "score": 70,
        "feedback": "",
        "strengths": [],
        "weaknesses": [],
        "needs_followup": False
    }
    
    lines = text.strip().split("\n")
    for line in lines:
        line = line.strip()
        if line.startswith("SCORE:"):
            try:
                score_str = line.replace("SCORE:", "").strip()
                assessment["score"] = int(score_str.split()[0])
            except (ValueError, IndexError):
                pass
        elif line.startswith("FEEDBACK:"):
            assessment["feedback"] = line.replace("FEEDBACK:", "").strip()
        elif line.startswith("STRENGTHS:"):
            strengths = line.replace("STRENGTHS:", "").strip()
            assessment["strengths"] = [s.strip() for s in strengths.split(",") if s.strip()]
        elif line.startswith("WEAKNESSES:"):
            weaknesses = line.replace("WEAKNESSES:", "").strip()
            assessment["weaknesses"] = [w.strip() for w in weaknesses.split(",") if w.strip()]
        elif line.startswith("NEEDS_FOLLOWUP:"):
            value = line.replace("NEEDS_FOLLOWUP:", "").strip().upper()
            assessment["needs_followup"] = value == "YES"
    
    return assessment


def hitl_approval_node(state: InterviewState) -> dict:
    """
    Human-in-the-Loop node for reviewing assessment before proceeding.
    Uses LangGraph's interrupt() for pausing execution.
    """
    assessment = state.get("last_assessment", {})
    
    # Interrupt and wait for human approval
    approval = interrupt({
        "type": "assessment_review",
        "question": state["current_question"],
        "answer": state["current_answer"],
        "assessment": assessment,
        "message": "Review the assessment. Approve to continue or reject to regenerate.",
        "options": ["approve", "reject", "end_interview"]
    })
    
    if approval == "reject":
        return {
            "approved": False,
            "awaiting_approval": False
        }
    elif approval == "end_interview":
        return {
            "approved": True,
            "awaiting_approval": False,
            "needs_followup": False  # Force end
        }
    else:  # approve
        return {
            "approved": True,
            "awaiting_approval": False
        }


# ============ Routing Functions ============

def route_after_answer(state: InterviewState) -> Literal["assess", "end"]:
    """Route after receiving an answer."""
    if not state.get("current_answer"):
        return "end"
    return "assess"


def route_after_assessment(state: InterviewState) -> Literal["hitl_approval", "generate_question"]:
    """Route after assessment - always go to HITL."""
    return "hitl_approval"


def route_after_approval(state: InterviewState) -> Literal["generate_question", "assess", "end"]:
    """Route after HITL approval based on approval status and follow-up needs."""
    if not state.get("approved", True):
        # Rejected - reassess
        return "assess"
    
    if state.get("needs_followup", False) and state["followup_count"] < state["max_followups"]:
        # Generate follow-up question
        return "generate_question"
    
    # Check if we should continue or end
    # For now, allow continuous questioning until manually ended
    return "generate_question"


# ============ Graph Construction ============

def build_interview_graph(checkpointer=None):
    """
    Build the interview StateGraph with nodes, edges, and HITL.
    
    Workflow:
    1. gather_context - Analyze topic and materials
    2. generate_question - Create interview question
    3. [External: User provides answer]
    4. assess - Evaluate the answer
    5. hitl_approval - Human reviews assessment
    6. Route: follow-up → generate_question, or continue → generate_question
    """
    graph = StateGraph(InterviewState)
    
    # Add nodes
    graph.add_node("gather_context", gather_context_node)
    graph.add_node("generate_question", generate_question_node)
    graph.add_node("assess", assess_answer_node)
    graph.add_node("hitl_approval", hitl_approval_node)
    
    # Add edges
    graph.add_edge(START, "gather_context")
    graph.add_edge("gather_context", "generate_question")
    
    # After question generation, we pause for user answer
    # The answer is provided externally via state update
    graph.add_edge("generate_question", END)  # Pause for answer
    
    # Assessment flow (triggered separately with answer)
    graph.add_conditional_edges(
        "assess",
        route_after_assessment,
        {
            "hitl_approval": "hitl_approval",
            "generate_question": "generate_question"
        }
    )
    
    # After HITL approval
    graph.add_conditional_edges(
        "hitl_approval",
        route_after_approval,
        {
            "generate_question": "generate_question",
            "assess": "assess",
            "end": END
        }
    )
    
    # Compile with checkpointer for persistence
    if checkpointer:
        return graph.compile(checkpointer=checkpointer)
    return graph.compile(checkpointer=InMemorySaver())


# ============ Graph Factory ============

@lru_cache(maxsize=1)
def get_interview_graph():
    """Get the compiled interview graph (cached)."""
    return build_interview_graph()


def create_interview_session(settings: Settings) -> dict:
    """Create initial state for a new interview session."""
    return {
        "messages": [],
        "topic": "",
        "context": "",
        "max_followups": settings.max_follow_ups,
        "current_question": "",
        "question_count": 0,
        "followup_count": 0,
        "current_answer": "",
        "last_assessment": None,
        "needs_followup": False,
        "awaiting_approval": False,
        "approved": True
    }


# ============ Convenience Functions for API ============

async def start_interview(topic: str, context: str, settings: Settings, thread_id: str):
    """
    Start an interview session and generate the first question.
    
    Returns the first question after gathering context.
    """
    graph = get_interview_graph()
    
    initial_state = create_interview_session(settings)
    initial_state["topic"] = topic
    initial_state["context"] = context
    
    config = {"configurable": {"thread_id": thread_id}}
    
    result = await graph.ainvoke(initial_state, config)
    
    return {
        "question": result.get("current_question", ""),
        "question_number": result.get("question_count", 1),
        "state": result
    }


async def submit_answer_for_assessment(answer: str, thread_id: str):
    """
    Submit an answer and trigger assessment.
    
    Note: This requires resuming the graph with the answer in state.
    """
    graph = get_interview_graph()
    config = {"configurable": {"thread_id": thread_id}}
    
    # Update state with answer and run assessment
    result = await graph.ainvoke(
        {"current_answer": answer},
        config
    )
    
    return {
        "assessment": result.get("last_assessment"),
        "needs_followup": result.get("needs_followup", False),
        "awaiting_approval": result.get("awaiting_approval", False)
    }
