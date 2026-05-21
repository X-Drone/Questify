"""
Unit of Work implementation for DDD pattern
"""
from typing import Callable
from sqlalchemy.orm import Session
from app.interfaces.uow import IUnitOfWork
from infra.persist.repo import TestRepository, QuestionRepository, AttemptRepository


class UnitOfWork(IUnitOfWork):
    session: Session | None
    get_session: Callable[[], Session]

    def __init__(self, get_session: Callable[[], Session]):
        self.get_session = get_session
        self.session = None

    def __enter__(self) -> "UnitOfWork":
        self.session = self.get_session()
        self.tests = TestRepository(self.session)
        self.questions = QuestionRepository(self.session)
        self.attempts = AttemptRepository(self.session)
        return self
    
    def __exit__(self, exc_type, exc, tb):
        if self.session:
            self.session.close()
            self.session = None

    def commit(self) -> None:
        if self.session:
            self.session.commit()

    def rollback(self) -> None:
        if self.session:
            self.session.rollback()

    def begin(self) -> None:
        """Begin a new transaction"""
        if self.session:
            self.session.begin_nested()
