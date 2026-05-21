"""
Repository interfaces for DDD pattern
"""
from typing import Optional, Protocol, List
from domain.entities import Test, Question, Attempt
from domain.values import TestId, UserId, QuestionId, AttemptId


class ITestRepository(Protocol):
    """Repository interface for Test aggregate"""

    def add(self, test: Test) -> Test:
        """Add a new test"""
        ...

    def update(self, test: Test) -> Test:
        """Update an existing test"""
        ...

    def remove(self, test_id: TestId) -> None:
        """Remove a test"""
        ...

    def get_by_id(self, test_id: TestId) -> Optional[Test]:
        """Get a test by ID"""
        ...

    def get_by_creator(self, creator_id: UserId) -> List[Test]:
        """Get all tests created by a user"""
        ...

    def get_published(self, limit: int = 50, offset: int = 0) -> List[Test]:
        """Get published tests with pagination"""
        ...

    def get_published_by_tags(self, tags: List[str]) -> List[Test]:
        """Get published tests by tags"""
        ...


class IQuestionRepository(Protocol):
    """Repository interface for Question"""

    def add(self, question: Question) -> Question:
        """Add a new question"""
        ...

    def update(self, question: Question) -> Question:
        """Update a question"""
        ...

    def remove(self, question_id: QuestionId) -> None:
        """Remove a question"""
        ...

    def get_by_id(self, question_id: QuestionId) -> Optional[Question]:
        """Get a question by ID"""
        ...

    def get_by_test(self, test_id: TestId) -> List[Question]:
        """Get all questions in a test"""
        ...


class IAttemptRepository(Protocol):
    """Repository interface for Attempt aggregate"""

    def add(self, attempt: Attempt) -> Attempt:
        """Add a new attempt"""
        ...

    def update(self, attempt: Attempt) -> Attempt:
        """Update an attempt"""
        ...

    def get_by_id(self, attempt_id: AttemptId) -> Optional[Attempt]:
        """Get an attempt by ID"""
        ...

    def get_by_user(self, user_id: UserId, limit: int = 50, offset: int = 0) -> List[Attempt]:
        """Get attempts by user with pagination"""
        ...

    def get_by_user_and_test(self, user_id: UserId, test_id: TestId) -> Optional[Attempt]:
        """Get an attempt for a user on a specific test"""
        ...

    def get_active_attempt(self, user_id: UserId, test_id: TestId) -> Optional[Attempt]:
        """Get an active (non-completed) attempt for a user on a test"""
        ...
