"""
Unit of Work interface for DDD pattern
"""
from typing import Protocol
from app.interfaces.repositories import ITestRepository, IQuestionRepository, IAttemptRepository


class IUnitOfWork(Protocol):
    """Unit of Work interface for managing repositories"""

    tests: ITestRepository
    questions: IQuestionRepository
    attempts: IAttemptRepository

    def __enter__(self):
        """Context manager entry"""
        ...

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        ...

    def commit(self) -> None:
        """Commit changes"""
        ...

    def rollback(self) -> None:
        """Rollback changes"""
        ...

    def begin(self) -> None:
        """Begin a new transaction"""
        ...
