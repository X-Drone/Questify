"""
SQLAlchemy ORM models for Questify
"""
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, Integer, String, DateTime, Boolean, JSON, Numeric, Text
from datetime import datetime
from infra.persist.base import Base


class TestModel(Base):
    __tablename__ = "tests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    creator_id: Mapped[str] = mapped_column(String(255), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="draft", nullable=False)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    tags: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    questions = relationship("QuestionModel", back_populates="test", cascade="all, delete-orphan")
    attempts = relationship("AttemptModel", back_populates="test", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<TestModel(id={self.id}, title={self.title})>"


class QuestionModel(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    test_id: Mapped[int] = mapped_column(ForeignKey("tests.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    question_type: Mapped[str] = mapped_column(String(50), nullable=False)
    media_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    order: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    test = relationship("TestModel", back_populates="questions")
    answer_options = relationship("AnswerOptionModel", back_populates="question", cascade="all, delete-orphan")
    user_answers = relationship("UserAnswerModel", back_populates="question", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<QuestionModel(id={self.id}, test_id={self.test_id})>"


class AnswerOptionModel(Base):
    __tablename__ = "answer_options"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    question_id: Mapped[int] = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    question = relationship("QuestionModel", back_populates="answer_options")

    def __repr__(self):
        return f"<AnswerOptionModel(id={self.id}, question_id={self.question_id})>"


class AttemptModel(Base):
    __tablename__ = "attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(255), nullable=False)
    test_id: Mapped[int] = mapped_column(ForeignKey("tests.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="started", nullable=False)
    score_points: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    score_max_points: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    test = relationship("TestModel", back_populates="attempts")
    user_answers = relationship("UserAnswerModel", back_populates="attempt", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<AttemptModel(id={self.id}, user_id={self.user_id})>"


class UserAnswerModel(Base):
    __tablename__ = "user_answers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    attempt_id: Mapped[int] = mapped_column(ForeignKey("attempts.id", ondelete="CASCADE"), nullable=False)
    question_id: Mapped[int] = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    answer_payload: Mapped[dict] = mapped_column(JSON, nullable=False)
    is_correct: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    points_earned: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    attempt = relationship("AttemptModel", back_populates="user_answers")
    question = relationship("QuestionModel", back_populates="user_answers")

    def __repr__(self):
        return f"<UserAnswerModel(id={self.id}, attempt_id={self.attempt_id})>"
