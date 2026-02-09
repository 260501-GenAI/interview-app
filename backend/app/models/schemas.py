"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


# ============ Enums ============

class InterviewStatus(str, Enum):
    """Interview session status."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    AWAITING_ANSWER = "awaiting_answer"
    ASSESSING = "assessing"
    COMPLETED = "completed"


# ============ Materials ============

class MaterialUploadResponse(BaseModel):
    """Response after uploading study materials."""
    material_id: str = Field(description="Unique identifier for the uploaded material")
    filename: str = Field(description="Original filename")
    chunks_created: int = Field(description="Number of text chunks indexed")
    message: str = Field(default="Material uploaded successfully")


# ============ Interview Requests ============

class StartInterviewRequest(BaseModel):
    """Request to start a new interview session."""
    topic: str = Field(
        description="Topic to be assessed on",
        examples=["Python fundamentals", "AWS SageMaker", "LangChain basics"]
    )
    thread_id: Optional[str] = Field(
        default=None,
        description="Optional thread ID for session continuity"
    )
    use_materials: bool = Field(
        default=True,
        description="Whether to use uploaded materials for context"
    )


class SubmitAnswerRequest(BaseModel):
    """Request to submit a voice transcript answer."""
    thread_id: str = Field(description="Active interview session ID")
    transcript: str = Field(
        description="Voice-to-text transcript of user's answer",
        min_length=1
    )


# ============ Interview Responses ============

class InterviewSessionResponse(BaseModel):
    """Response after starting an interview session."""
    thread_id: str = Field(description="Session thread ID")
    topic: str = Field(description="Interview topic")
    status: InterviewStatus = Field(description="Current session status")
    message: str = Field(description="Status message")


class QuestionResponse(BaseModel):
    """Response containing the next interview question."""
    thread_id: str = Field(description="Session thread ID")
    question: str = Field(description="The interview question")
    question_number: int = Field(description="Current question number")
    is_followup: bool = Field(
        default=False,
        description="Whether this is a follow-up question"
    )
    status: InterviewStatus = Field(description="Current session status")


class AnswerAssessment(BaseModel):
    """Assessment of a single answer."""
    score: int = Field(
        ge=0, le=100,
        description="Score from 0-100"
    )
    feedback: str = Field(description="Detailed feedback on the answer")
    strengths: list[str] = Field(
        default_factory=list,
        description="Key strengths in the answer"
    )
    weaknesses: list[str] = Field(
        default_factory=list,
        description="Areas for improvement"
    )
    needs_followup: bool = Field(
        default=False,
        description="Whether a follow-up question is warranted"
    )
    followup_question: Optional[str] = Field(
        default=None,
        description="Follow-up question if needed"
    )


class SubmitAnswerResponse(BaseModel):
    """Response after submitting an answer."""
    thread_id: str = Field(description="Session thread ID")
    status: InterviewStatus = Field(description="Current session status")
    message: str = Field(description="Status message")
    has_followup: bool = Field(
        default=False,
        description="Whether a follow-up question is queued"
    )


class FinalAssessmentResponse(BaseModel):
    """Final interview performance report."""
    thread_id: str = Field(description="Session thread ID")
    topic: str = Field(description="Interview topic")
    overall_score: int = Field(
        ge=0, le=100,
        description="Overall score from 0-100"
    )
    total_questions: int = Field(description="Total questions asked")
    summary: str = Field(description="Overall performance summary")
    strengths: list[str] = Field(description="Overall strengths demonstrated")
    weaknesses: list[str] = Field(description="Areas needing improvement")
    recommendations: list[str] = Field(
        default_factory=list,
        description="Study recommendations"
    )
    assessments: list[AnswerAssessment] = Field(
        default_factory=list,
        description="Individual question assessments"
    )


# ============ Error Responses ============

class ErrorResponse(BaseModel):
    """Standard error response."""
    detail: str = Field(description="Error message")
    code: Optional[str] = Field(default=None, description="Error code")
