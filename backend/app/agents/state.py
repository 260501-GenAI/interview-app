"""Interview agent state definitions for StateGraph."""
from typing import TypedDict, Annotated
from operator import add


class InterviewState(TypedDict):
    """
    State for the interview StateGraph workflow.
    
    Uses TypedDict with Annotated reducers per LangGraph v1.0 patterns.
    """
    
    # Message history (accumulates with add reducer)
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
    
    # HITL (Human-in-the-Loop) flags
    awaiting_approval: bool
    approved: bool


class AssessmentResult(TypedDict):
    """Structured assessment result from the critic node."""
    score: int
    feedback: str
    strengths: list[str]
    weaknesses: list[str]
    needs_followup: bool
