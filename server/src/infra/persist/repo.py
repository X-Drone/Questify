"""
Repository implementations using SQLAlchemy
"""
from typing import Optional
from sqlalchemy.orm import Session
from domain.entities import Test, Question, Attempt
from domain.values import TestId, UserId, QuestionId, AttemptId, TestStatus, AttemptStatus
from infra.persist.models import TestModel, QuestionModel, AttemptModel
from infra.persist.mapper import TestMapper, QuestionMapper, AttemptMapper


class TestRepository:
    """SQLAlchemy implementation of Test repository"""

    def __init__(self, session: Session):
        self.session = session

    def add(self, test: Test) -> Test:
        """Add a new test"""
        model = TestMapper.to_persistence(test)
        self.session.add(model)
        self.session.flush()
        return TestMapper.to_domain(model)

    def update(self, test: Test) -> Test:
        """Update an existing test"""
        model = self.session.query(TestModel).filter_by(id=test.id.value).first()
        if not model:
            raise ValueError(f"Test with id {test.id.value} not found")
        
        updated_model = TestMapper.to_persistence(test)
        self.session.merge(updated_model)
        self.session.flush()
        
        return TestMapper.to_domain(
            self.session.query(TestModel).filter_by(id=test.id.value).first()
        )

    def remove(self, test_id: TestId) -> None:
        """Remove a test"""
        model = self.session.query(TestModel).filter_by(id=test_id.value).first()
        if model:
            self.session.delete(model)
            self.session.flush()

    def get_by_id(self, test_id: TestId) -> Optional[Test]:
        """Get a test by ID"""
        model = self.session.query(TestModel).filter_by(id=test_id.value).first()
        return TestMapper.to_domain(model) if model else None

    def get_by_creator(self, creator_id: UserId) -> list[Test]:
        """Get all tests created by a user"""
        models = self.session.query(TestModel).filter_by(creator_id=(creator_id.value)).all()
        return [TestMapper.to_domain(m) for m in models]

    def get_published(self, limit: int = 50, offset: int = 0) -> list[Test]:
        """Get published tests with pagination"""
        models = self.session.query(TestModel)\
            .filter_by(status=TestStatus.PUBLISHED.value)\
            .limit(limit)\
            .offset(offset)\
            .all()
        return [TestMapper.to_domain(m) for m in models]

    def get_published_by_tags(self, tags: list[str]) -> list[Test]:
        """Get published tests by tags"""
        models = self.session.query(TestModel)\
            .filter_by(status=TestStatus.PUBLISHED.value)\
            .all()
        
        result = []
        for model in models:
            if any(tag in model.tags for tag in tags):
                result.append(TestMapper.to_domain(model))
        
        return result


class QuestionRepository:
    """SQLAlchemy implementation of Question repository"""

    def __init__(self, session: Session):
        self.session = session

    def add(self, question: Question) -> Question:
        """Add a new question"""
        model = QuestionMapper.to_persistence(question)
        self.session.add(model)
        self.session.flush()
        return QuestionMapper.to_domain(model)

    def update(self, question: Question) -> Question:
        """Update a question"""
        model = self.session.query(QuestionModel).filter_by(id=question.id.value).first()
        if not model:
            raise ValueError(f"Question with id {question.id.value} not found")
        
        updated_model = QuestionMapper.to_persistence(question)
        self.session.merge(updated_model)
        self.session.flush()
        
        return QuestionMapper.to_domain(
            self.session.query(QuestionModel).filter_by(id=question.id.value).first()
        )

    def remove(self, question_id: QuestionId) -> None:
        """Remove a question"""
        model = self.session.query(QuestionModel).filter_by(id=question_id.value).first()
        if model:
            self.session.delete(model)
            self.session.flush()

    def get_by_id(self, question_id: QuestionId) -> Optional[Question]:
        """Get a question by ID"""
        model = self.session.query(QuestionModel).filter_by(id=question_id.value).first()
        return QuestionMapper.to_domain(model) if model else None

    def get_by_test(self, test_id: TestId) -> list[Question]:
        """Get all questions in a test"""
        models = self.session.query(QuestionModel)\
            .filter_by(test_id=test_id.value)\
            .order_by(QuestionModel.order)\
            .all()
        return [QuestionMapper.to_domain(m) for m in models]


class AttemptRepository:
    """SQLAlchemy implementation of Attempt repository"""

    def __init__(self, session: Session):
        self.session = session

    def add(self, attempt: Attempt) -> Attempt:
        """Add a new attempt"""
        model = AttemptMapper.to_persistence(attempt)
        self.session.add(model)
        self.session.flush()
        return AttemptMapper.to_domain(model)

    def update(self, attempt: Attempt) -> Attempt:
        """Update an attempt"""
        model = self.session.query(AttemptModel).filter_by(id=attempt.id.value).first()
        if not model:
            raise ValueError(f"Attempt with id {attempt.id.value} not found")
        
        updated_model = AttemptMapper.to_persistence(attempt)
        self.session.merge(updated_model)
        self.session.flush()
        
        return AttemptMapper.to_domain(
            self.session.query(AttemptModel).filter_by(id=attempt.id.value).first()
        )

    def get_by_id(self, attempt_id: AttemptId) -> Optional[Attempt]:
        """Get an attempt by ID"""
        model = self.session.query(AttemptModel).filter_by(id=attempt_id.value).first()
        return AttemptMapper.to_domain(model) if model else None

    def get_by_user(self, user_id: UserId, limit: int = 50, offset: int = 0) -> list[Attempt]:
        """Get attempts by user with pagination"""
        models = self.session.query(AttemptModel)\
            .filter_by(user_id=user_id.value)\
            .order_by(AttemptModel.created_at.desc())\
            .limit(limit)\
            .offset(offset)\
            .all()
        return [AttemptMapper.to_domain(m) for m in models]

    def get_by_user_and_test(self, user_id: UserId, test_id: TestId) -> Optional[Attempt]:
        """Get an attempt for a user on a specific test"""
        model = self.session.query(AttemptModel)\
            .filter_by(user_id=user_id.value, test_id=test_id.value)\
            .order_by(AttemptModel.created_at.desc())\
            .first()
        return AttemptMapper.to_domain(model) if model else None

    def get_active_attempt(self, user_id: UserId, test_id: TestId) -> Optional[Attempt]:
        """Get an active (non-completed) attempt for a user on a test"""
        model = self.session.query(AttemptModel)\
            .filter(
                AttemptModel.user_id == user_id.value,
                AttemptModel.test_id == test_id.value,
                AttemptModel.status.in_([
                    AttemptStatus.STARTED.value,
                    AttemptStatus.IN_PROGRESS.value
                ])
            )\
            .order_by(AttemptModel.created_at.desc())\
            .first()
        return AttemptMapper.to_domain(model) if model else None
