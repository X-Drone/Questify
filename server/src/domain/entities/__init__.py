"""
Domain entities for Questify
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from domain.values import (
    TestId, QuestionId, UserId, AttemptId, TestStatus, 
    QuestionType, AttemptStatus, AnswerPayload, Score
)


@dataclass
class AnswerOption:
    """Answer option for a question"""
    id: Optional[int]
    question_id: QuestionId
    text: str
    is_correct: bool
    order: int = 0

    def __eq__(self, other):
        if not isinstance(other, AnswerOption):
            return False
        return self.id == other.id


@dataclass
class Question:
    """Question entity"""
    id: QuestionId
    test_id: TestId
    title: str
    description: str
    question_type: QuestionType
    media_url: Optional[str]
    order: int
    answer_options: list[AnswerOption] = field(default_factory=list)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def add_answer_option(self, option: AnswerOption):
        """Add an answer option to the question"""
        self.answer_options.append(option)

    def remove_answer_option(self, option_id: int):
        """Remove an answer option from the question"""
        self.answer_options = [opt for opt in self.answer_options if opt.id != option_id]

    def __eq__(self, other):
        if not isinstance(other, Question):
            return False
        return self.id == other.id


@dataclass
class Test:
    """Test entity - root aggregate"""
    id: TestId
    creator_id: UserId
    title: str
    description: str
    status: TestStatus
    version: int
    tags: list[str]
    questions: list[Question] = field(default_factory=list)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    published_at: Optional[datetime] = None

    def add_question(self, question: Question):
        """Add a question to the test"""
        question.order = len(self.questions) + 1
        self.questions.append(question)

    def remove_question(self, question_id: QuestionId):
        """Remove a question from the test"""
        self.questions = [q for q in self.questions if q.id != question_id]
        # Reorder questions
        for idx, q in enumerate(self.questions):
            q.order = idx + 1

    def publish(self):
        """Publish the test"""
        if self.status == TestStatus.PUBLISHED:
            raise ValueError("Test is already published")
        self.status = TestStatus.PUBLISHED
        self.published_at = datetime.utcnow()

    def archive(self):
        """Archive the test"""
        self.status = TestStatus.ARCHIVED

    def get_question_count(self) -> int:
        """Get the number of questions in the test"""
        return len(self.questions)

    def __eq__(self, other):
        if not isinstance(other, Test):
            return False
        return self.id == other.id


@dataclass
class UserAnswer:
    """User answer entity"""
    id: Optional[int]
    attempt_id: AttemptId
    question_id: QuestionId
    answer_payload: AnswerPayload
    is_correct: Optional[bool] = None
    points_earned: float = 0.0
    created_at: Optional[datetime] = None

    def __eq__(self, other):
        if not isinstance(other, UserAnswer):
            return False
        return self.id == other.id


@dataclass
class Attempt:
    """Attempt entity - root aggregate"""
    id: AttemptId
    user_id: UserId
    test_id: TestId
    status: AttemptStatus
    score: Optional[Score] = None
    user_answers: list[UserAnswer] = field(default_factory=list)
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    def add_answer(self, answer: UserAnswer):
        """Add an answer to the attempt"""
        self.user_answers.append(answer)

    def get_answer_for_question(self, question_id: QuestionId) -> Optional[UserAnswer]:
        """Get the answer for a specific question"""
        for answer in self.user_answers:
            if answer.question_id == question_id:
                return answer
        return None

    def start(self):
        """Start the attempt"""
        if self.status != AttemptStatus.STARTED:
            raise ValueError("Attempt already started or completed")
        self.status = AttemptStatus.IN_PROGRESS

    def complete(self, score: Score):
        """Complete the attempt"""
        if self.status == AttemptStatus.COMPLETED:
            raise ValueError("Attempt is already completed")
        self.status = AttemptStatus.COMPLETED
        self.score = score
        self.completed_at = datetime.utcnow()

    def __eq__(self, other):
        if not isinstance(other, Attempt):
            return False
        return self.id == other.id
