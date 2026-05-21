"""
Base for SQLAlchemy ORM models
"""
from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Import models to register them with Base
from infra.persist.models import (  # noqa
    TestModel,
    QuestionModel,
    AnswerOptionModel,
    AttemptModel,
    UserAnswerModel,
)
