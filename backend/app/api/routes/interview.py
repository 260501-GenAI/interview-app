"""Interview session management routes with StateGraph integration."""
import uuid
from fastapi import APIRouter, HTTPException, BackgroundTasks, status

from app.api.deps import SessionStoreDep, VectorStoreDep, SettingsDep
from app.models.schemas import (
    StartInterviewRequest,
    SubmitAnswerRequest,
    InterviewSessionResponse,
    QuestionResponse,
    SubmitAnswerResponse,
    FinalAssessmentResponse,
    AnswerAssessment,
    InterviewStatus,
    ErrorResponse,
)
from app.agents.supervisor import (
    get_interview_graph,
    create_interview_session,
)


router = APIRouter(prefix="/interview", tags=["interview"])


@router.post(
    "/start",
    response_model=InterviewSessionResponse,
    summary="Start interview session",
    description="Initialize a new interview session with a specified topic using StateGraph."
)
async def start_interview(
    request: StartInterviewRequest,
    sessions: SessionStoreDep,
    vectorstore: VectorStoreDep,
    settings: SettingsDep,
) -> InterviewSessionResponse:
    """
    Start a new interview preparation session.
    
    Workflow (StateGraph):
    1. gather_context node analyzes materials
    2. generate_question node creates first question
    3. Returns question and pauses for answer
    """
    thread_id = request.thread_id or str(uuid.uuid4())
    
    if thread_id in sessions and sessions[thread_id].get("status") != InterviewStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Session {thread_id} already in progress."
        )
    
    # Get context from materials
    context = ""
    if request.use_materials:
        context = await vectorstore.query(
            query=f"Information about {request.topic}",
            n_results=5
        )
    
    # Initialize state for StateGraph
    initial_state = create_interview_session(settings)
    initial_state["topic"] = request.topic
    initial_state["context"] = context or "No materials provided. Use general knowledge."
    
    # Get the compiled graph
    graph = get_interview_graph()
    config = {"configurable": {"thread_id": thread_id}}
    
    # Run graph to generate first question
    result = graph.invoke(initial_state, config)
    
    # Store session info
    sessions[thread_id] = {
        "thread_id": thread_id,
        "topic": request.topic,
        "status": InterviewStatus.AWAITING_ANSWER,
        "graph_state": result,
        "config": config,
    }
    
    return InterviewSessionResponse(
        thread_id=thread_id,
        topic=request.topic,
        status=InterviewStatus.IN_PROGRESS,
        message=f"Interview started. First question generated."
    )


@router.get(
    "/question",
    response_model=QuestionResponse,
    responses={404: {"model": ErrorResponse}},
    summary="Get current/next question",
    description="Retrieve the current interview question from StateGraph state."
)
async def get_question(
    thread_id: str,
    sessions: SessionStoreDep,
) -> QuestionResponse:
    """Get the current question from the graph state."""
    if thread_id not in sessions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {thread_id} not found"
        )
    
    session = sessions[thread_id]
    state = session.get("graph_state", {})
    
    if session["status"] == InterviewStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Interview session completed. Get assessment or start new session."
        )
    
    return QuestionResponse(
        thread_id=thread_id,
        question=state.get("current_question", ""),
        question_number=state.get("question_count", 1),
        is_followup=state.get("followup_count", 0) > 0,
        status=InterviewStatus.AWAITING_ANSWER
    )


@router.post(
    "/answer",
    response_model=SubmitAnswerResponse,
    responses={404: {"model": ErrorResponse}},
    summary="Submit answer",
    description="Submit voice transcript. Triggers assessment and generates next question."
)
async def submit_answer(
    request: SubmitAnswerRequest,
    background_tasks: BackgroundTasks,
    sessions: SessionStoreDep,
    settings: SettingsDep,
) -> SubmitAnswerResponse:
    """
    Submit an answer, assess it, and generate the next question.
    
    Flow:
    1. Run assess_answer_node to evaluate the answer
    2. Store assessment in session state
    3. Run generate_question to get next question
    """
    if request.thread_id not in sessions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {request.thread_id} not found"
        )
    
    session = sessions[request.thread_id]
    session["status"] = InterviewStatus.ASSESSING
    
    # Get current state and update with answer
    graph = get_interview_graph()
    config = session["config"]
    current_state = session["graph_state"].copy()
    current_state["current_answer"] = request.transcript
    
    # Import and run assess_answer_node directly
    from app.agents.supervisor import assess_answer_node, generate_question_node
    
    print(f"[DEBUG submit_answer] Assessing answer: {request.transcript[:100]}...")
    
    # Run assessment
    assessment_update = assess_answer_node(current_state)
    
    # Merge assessment into state
    for key, value in assessment_update.items():
        if key == "messages":
            current_state["messages"] = current_state.get("messages", []) + value
        else:
            current_state[key] = value
    
    print(f"[DEBUG submit_answer] Assessment result: {current_state.get('last_assessment')}")
    
    # Store the updated state with assessment
    session["graph_state"] = current_state
    
    # Now generate next question
    question_update = generate_question_node(current_state)
    
    # Merge question into state
    for key, value in question_update.items():
        if key == "messages":
            current_state["messages"] = current_state.get("messages", []) + value
        else:
            current_state[key] = value
    
    # Update session with final state
    session["graph_state"] = current_state
    session["status"] = InterviewStatus.AWAITING_ANSWER
    
    has_followup = current_state.get("needs_followup", False)
    
    return SubmitAnswerResponse(
        thread_id=request.thread_id,
        status=InterviewStatus.IN_PROGRESS,
        message="Answer assessed. Next question ready.",
        has_followup=has_followup
    )


@router.post(
    "/approve",
    summary="Approve assessment (HITL)",
    description="Human-in-the-loop approval to continue after assessment."
)
async def approve_assessment(
    thread_id: str,
    action: str = "approve",  # approve, reject, end_interview
    sessions: SessionStoreDep = None,
) -> dict:
    """
    Resume the StateGraph after HITL approval.
    
    Actions:
    - approve: Continue to next question or follow-up
    - reject: Re-run assessment
    - end_interview: Complete the session
    """
    if thread_id not in sessions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {thread_id} not found"
        )
    
    session = sessions[thread_id]
    graph = get_interview_graph()
    config = session["config"]
    
    # Resume graph with approval decision
    result = graph.invoke(
        {"approved": action == "approve", "awaiting_approval": False},
        config
    )
    
    session["graph_state"] = result
    
    if action == "end_interview":
        session["status"] = InterviewStatus.COMPLETED
        return {"message": "Interview ended", "status": "completed"}
    
    session["status"] = InterviewStatus.AWAITING_ANSWER
    
    return {
        "message": f"Assessment {action}d. Next question ready.",
        "next_question": result.get("current_question", ""),
        "has_followup": result.get("needs_followup", False)
    }


@router.get(
    "/assessment",
    response_model=FinalAssessmentResponse,
    responses={404: {"model": ErrorResponse}},
    summary="Get final assessment",
    description="Retrieve the complete performance report."
)
async def get_assessment(
    thread_id: str,
    sessions: SessionStoreDep,
) -> FinalAssessmentResponse:
    """Get the final interview assessment from all recorded assessments."""
    if thread_id not in sessions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {thread_id} not found"
        )
    
    session = sessions[thread_id]
    state = session.get("graph_state", {})
    
    # Debug logging
    print(f"[DEBUG get_assessment] thread_id={thread_id}")
    print(f"[DEBUG get_assessment] state keys: {state.keys() if state else 'NO STATE'}")
    print(f"[DEBUG get_assessment] last_assessment: {state.get('last_assessment')}")
    
    # Extract assessment from messages (they're logged as [Assessment] messages)
    assessments = []
    
    # Check for last_assessment in state first
    last_assessment = state.get("last_assessment")
    if last_assessment:
        print(f"[DEBUG] Found last_assessment: {last_assessment}")
        assessments.append(AnswerAssessment(
            score=last_assessment.get("score", 70),
            feedback=last_assessment.get("feedback", ""),
            strengths=last_assessment.get("strengths", []),
            weaknesses=last_assessment.get("weaknesses", []),
            needs_followup=last_assessment.get("needs_followup", False)
        ))
    
    # Also check messages for additional assessments
    messages = state.get("messages", [])
    for msg in messages:
        content = getattr(msg, "content", str(msg))
        if "[Assessment]" in content and not assessments:
            print(f"[DEBUG] Found assessment in message: {content[:100]}")
            # Parse inline assessment if no structured one found
            assessments.append(AnswerAssessment(
                score=70,
                feedback=content.replace("[Assessment]", "").strip()[:500],
                strengths=["Completed interview practice"],
                weaknesses=["Continue practicing for improvement"],
                needs_followup=False
            ))
    
    # Handle early termination gracefully
    if not assessments:
        question_count = state.get("question_count", 0)
        topic = session.get("topic", "Interview Practice")
        print(f"[DEBUG] No assessments - returning early termination summary. Questions: {question_count}")
        session["status"] = InterviewStatus.COMPLETED
        
        return FinalAssessmentResponse(
            thread_id=thread_id,
            topic=session.get("topic", "Interview Practice"),
            overall_score=0,
            total_questions=question_count,
            summary=f"Interview ended early. {question_count} question(s) were asked but no answers were submitted for assessment.",
            strengths=["Started interview practice session"],
            weaknesses=["Interview ended before completing assessments"],
            recommendations=[
                f"Try another session on {session.get('topic', 'your topic')}",
                "Complete at least one full question-answer cycle for feedback",
                "Practice speaking clearly and completely"
            ],
            assessments=[]
        )
    
    # Calculate overall score
    scores = [a.score for a in assessments]
    overall_score = sum(scores) // len(scores)
    
    # Aggregate strengths/weaknesses
    all_strengths = []
    all_weaknesses = []
    for a in assessments:
        all_strengths.extend(a.strengths)
        all_weaknesses.extend(a.weaknesses)
    
    session["status"] = InterviewStatus.COMPLETED
    
    return FinalAssessmentResponse(
        thread_id=thread_id,
        topic=session["topic"],
        overall_score=overall_score,
        total_questions=state.get("question_count", 1),
        summary=f"Completed {state.get('question_count', 1)} questions with average score {overall_score}%",
        strengths=list(set(all_strengths))[:5] if all_strengths else ["Completed interview"],
        weaknesses=list(set(all_weaknesses))[:5] if all_weaknesses else ["Keep practicing"],
        recommendations=[
            f"Continue practicing {session['topic']}",
            "Focus on providing specific examples",
            "Review areas identified as weaknesses"
        ],
        assessments=assessments
    )


@router.delete(
    "/{thread_id}",
    summary="End interview session"
)
async def end_session(
    thread_id: str,
    sessions: SessionStoreDep,
) -> dict:
    """End an interview session."""
    if thread_id in sessions:
        del sessions[thread_id]
        return {"message": f"Session {thread_id} ended"}
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Session {thread_id} not found"
    )
