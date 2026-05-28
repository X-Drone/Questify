"""
API schemas for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# Test schemas
class AnswerOptionSchema(BaseModel):
    id: Optional[int] = None
    text: str
    is_correct: bool = False
    order: int = 0


class QuestionSchema(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    type: str
    media_url: Optional[str] = None
    order: int
    answer_options: list[AnswerOptionSchema] = []


class TestCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    tags: list[str] = []


class TestDetailResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: str
    tags: list[str]
    questions: list[QuestionSchema]
    created_at: Optional[str] = None
    published_at: Optional[str] = None


class TestListResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: str
    question_count: int
    tags: Optional[list[str]] = []
    created_at: Optional[str] = None


# Question schemas
class QuestionCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    type: str  # single_choice, multiple_choice, etc
    answer_options: list[dict]
    media_url: Optional[str] = None


class QuestionUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    answer_options: Optional[list[dict]] = None


# Attempt schemas
class AnswerSubmitRequest(BaseModel):
    data: dict = Field(..., description="Answer data - format depends on question type")


class AttemptDetailResponse(BaseModel):
    id: int
    test_id: int
    user_id: str
    status: str
    score: Optional[float] = None
    max_score: Optional[float] = None
    percentage: Optional[float] = None
    user_answers: list[dict] = []
    created_at: Optional[str] = None
    completed_at: Optional[str] = None


class AttemptHistoryResponse(BaseModel):
    id: int
    test_id: int
    status: str
    score: Optional[float] = None
    max_score: Optional[float] = None
    percentage: Optional[float] = None
    created_at: Optional[str] = None
    completed_at: Optional[str] = None


class AttemptCompleteResponse(BaseModel):
    id: int
    status: str
    score: float
    max_score: float
    percentage: float
    passed: bool
