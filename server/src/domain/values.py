"""
Domain value objects and enums for Questify
"""
from enum import Enum
from dataclasses import dataclass
from typing import Any


class TestStatus(str, Enum):
    """Status of a test"""
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class QuestionType(str, Enum):
    """Types of questions"""
    SINGLE_CHOICE = "single_choice"
    MULTIPLE_CHOICE = "multiple_choice"
    TRUE_FALSE = "true_false"
    TEXT_ANSWER = "text_answer"
    NUMERIC_ANSWER = "numeric_answer"
    MATCHING_PAIRS = "matching_pairs"
    ORDERING = "ordering"


class AttemptStatus(str, Enum):
    """Status of an attempt"""
    STARTED = "started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


@dataclass
class TestId:
    """Value object for test ID"""
    value: int | None

    def __eq__(self, other):
        if not isinstance(other, TestId):
            return False
        return self.value == other.value

    def __hash__(self):
        return hash(self.value)


@dataclass
class QuestionId:
    """Value object for question ID"""
    value: int | None

    def __eq__(self, other):
        if not isinstance(other, QuestionId):
            return False
        return self.value == other.value

    def __hash__(self):
        return hash(self.value)


@dataclass
class UserId:
    """Value object for user ID"""
    value: int | None

    def __eq__(self, other):
        if not isinstance(other, UserId):
            return False
        return self.value == other.value

    def __hash__(self):
        return hash(self.value)


@dataclass
class AttemptId:
    """Value object for attempt ID"""
    value: int | None

    def __eq__(self, other):
        if not isinstance(other, AttemptId):
            return False
        return self.value == other.value

    def __hash__(self):
        return hash(self.value)


@dataclass
class Score:
    """Value object for score"""
    points: float
    max_points: float

    def get_percentage(self) -> float:
        """Calculate percentage score"""
        if self.max_points == 0:
            return 0.0
        return (self.points / self.max_points) * 100

    def __eq__(self, other):
        if not isinstance(other, Score):
            return False
        return self.points == other.points and self.max_points == other.max_points


@dataclass
class AnswerPayload:
    """Value object for answer payload - can be different depending on question type"""
    data: dict[str, Any]

    def __eq__(self, other):
        if not isinstance(other, AnswerPayload):
            return False
        return self.data == other.data
