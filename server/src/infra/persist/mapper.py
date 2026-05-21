"""
Mapper for converting between domain entities and ORM models
"""
from domain.entities import Test, Question, AnswerOption, Attempt, UserAnswer
from domain.values import (
    TestId, QuestionId, UserId, AttemptId, TestStatus, QuestionType,
    AttemptStatus, AnswerPayload, Score
)
from infra.persist.models import (
    TestModel, QuestionModel, AnswerOptionModel, AttemptModel, UserAnswerModel
)


class TestMapper:
    """Mapper for Test entity"""

    @staticmethod
    def to_domain(model: TestModel) -> Test:
        """Convert ORM model to domain entity"""
        questions = [
            QuestionMapper.to_domain(q) for q in sorted(model.questions, key=lambda x: x.order)
        ]
        
        return Test(
            id=TestId(model.id),
            creator_id=UserId(model.creator_id),
            title=model.title,
            description=model.description or "",
            status=TestStatus(model.status),
            version=model.version,
            tags=model.tags or [],
            questions=questions,
            created_at=model.created_at,
            updated_at=model.updated_at,
            published_at=model.published_at,
        )

    @staticmethod
    def to_persistence(entity: Test) -> TestModel:
        """Convert domain entity to ORM model"""
        model = TestModel(
            id=entity.id.value,
            creator_id=entity.creator_id.value,
            title=entity.title,
            description=entity.description,
            status=entity.status.value,
            version=entity.version,
            tags=entity.tags,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
            published_at=entity.published_at,
        )
        
        model.questions = [
            QuestionMapper.to_persistence(q) for q in entity.questions
        ]
        
        return model


class QuestionMapper:
    """Mapper for Question entity"""

    @staticmethod
    def to_domain(model: QuestionModel) -> Question:
        """Convert ORM model to domain entity"""
        answer_options = [
            AnswerOptionMapper.to_domain(opt) for opt in sorted(model.answer_options, key=lambda x: x.order)
        ]
        
        return Question(
            id=QuestionId(model.id),
            test_id=TestId(model.test_id),
            title=model.title,
            description=model.description or "",
            question_type=QuestionType(model.question_type),
            media_url=model.media_url,
            order=model.order,
            answer_options=answer_options,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    @staticmethod
    def to_persistence(entity: Question) -> QuestionModel:
        """Convert domain entity to ORM model"""
        model = QuestionModel(
            id=entity.id.value,
            test_id=entity.test_id.value,
            title=entity.title,
            description=entity.description,
            question_type=entity.question_type.value,
            media_url=entity.media_url,
            order=entity.order,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )
        
        model.answer_options = [
            AnswerOptionMapper.to_persistence(opt) for opt in entity.answer_options
        ]
        
        return model


class AnswerOptionMapper:
    """Mapper for AnswerOption entity"""

    @staticmethod
    def to_domain(model: AnswerOptionModel) -> AnswerOption:
        """Convert ORM model to domain entity"""
        return AnswerOption(
            id=model.id,
            question_id=QuestionId(model.question_id),
            text=model.text,
            is_correct=model.is_correct,
            order=model.order,
        )

    @staticmethod
    def to_persistence(entity: AnswerOption) -> AnswerOptionModel:
        """Convert domain entity to ORM model"""
        return AnswerOptionModel(
            id=entity.id,
            question_id=entity.question_id.value,
            text=entity.text,
            is_correct=entity.is_correct,
            order=entity.order,
        )


class AttemptMapper:
    """Mapper for Attempt entity"""

    @staticmethod
    def to_domain(model: AttemptModel) -> Attempt:
        """Convert ORM model to domain entity"""
        user_answers = [
            UserAnswerMapper.to_domain(ua) for ua in model.user_answers
        ]
        
        score = None
        if model.score_points is not None and model.score_max_points is not None:
            score = Score(float(model.score_points), float(model.score_max_points))
        
        return Attempt(
            id=AttemptId(model.id),
            user_id=UserId(model.user_id),
            test_id=TestId(model.test_id),
            status=AttemptStatus(model.status),
            score=score,
            user_answers=user_answers,
            created_at=model.created_at,
            completed_at=model.completed_at,
        )

    @staticmethod
    def to_persistence(entity: Attempt) -> AttemptModel:
        """Convert domain entity to ORM model"""
        model = AttemptModel(
            id=entity.id.value,
            user_id=entity.user_id.value,
            test_id=entity.test_id.value,
            status=entity.status.value,
            score_points=entity.score.points if entity.score else None,
            score_max_points=entity.score.max_points if entity.score else None,
            created_at=entity.created_at,
            completed_at=entity.completed_at,
        )
        
        model.user_answers = [
            UserAnswerMapper.to_persistence(ua) for ua in entity.user_answers
        ]
        
        return model


class UserAnswerMapper:
    """Mapper for UserAnswer entity"""

    @staticmethod
    def to_domain(model: UserAnswerModel) -> UserAnswer:
        """Convert ORM model to domain entity"""
        return UserAnswer(
            id=model.id,
            attempt_id=AttemptId(model.attempt_id),
            question_id=QuestionId(model.question_id),
            answer_payload=AnswerPayload(model.answer_payload),
            is_correct=model.is_correct,
            points_earned=float(model.points_earned),
            created_at=model.created_at,
        )

    @staticmethod
    def to_persistence(entity: UserAnswer) -> UserAnswerModel:
        """Convert domain entity to ORM model"""
        return UserAnswerModel(
            id=entity.id,
            attempt_id=entity.attempt_id.value,
            question_id=entity.question_id.value,
            answer_payload=entity.answer_payload.data,
            is_correct=entity.is_correct,
            points_earned=entity.points_earned,
            created_at=entity.created_at,
        )
