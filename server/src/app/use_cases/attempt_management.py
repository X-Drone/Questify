"""
Use cases for attempt management (taking tests)
"""
from domain.entities import Attempt, UserAnswer
from domain.values import (
    AttemptId, UserId, TestId, QuestionId, AttemptStatus, AnswerPayload, Score, QuestionType
)
from domain.services import AnswerEvaluationService, ScoreCalculationService
from app.interfaces.uow import IUnitOfWork
from datetime import datetime


class StartAttemptUseCase:
    """Use case for starting a new test attempt"""

    def __init__(self, uow: IUnitOfWork):
        self.uow = uow

    def execute(self, user_id: str, test_id: int) -> dict:
        """
        Start a new attempt
        
        Args:
            user_id: ID of the user
            test_id: ID of the test
            
        Returns:
            Dictionary with created attempt data
            
        Raises:
            ValueError if test not found or user already has active attempt
        """
        with self.uow:
            # Get test
            test = self.uow.tests.get_by_id(TestId(test_id))
            if not test:
                raise ValueError(f"Test {test_id} not found")

            # Check if user has active attempt
            active = self.uow.attempts.get_active_attempt(UserId(user_id), TestId(test_id))
            if active:
                return {
                    "attempt_id": active.id.value,
                    "test_id": active.test_id.value,
                    "status": active.status.value,
                }

            # Create attempt
            attempt = Attempt(
                id=AttemptId(None),
                user_id=UserId(user_id),
                test_id=TestId(test_id),
                status=AttemptStatus.STARTED,
                created_at=datetime.utcnow(),
            )

            # Persist
            created_attempt = self.uow.attempts.add(attempt)
            self.uow.commit()

            return {
                "attempt_id": created_attempt.id.value,
                "test_id": created_attempt.test_id.value,
                "status": created_attempt.status.value,
            }


class SubmitAnswerUseCase:
    """Use case for submitting an answer"""

    def __init__(self, uow: IUnitOfWork):
        self.uow = uow

    def execute(self, attempt_id: int, question_id: int, answer_data: dict) -> dict:
        """
        Submit an answer to a question
        
        Args:
            attempt_id: ID of the attempt
            question_id: ID of the question
            answer_data: The answer data
            
        Returns:
            Dictionary with answer evaluation result
            
        Raises:
            ValueError if attempt or question not found
        """
        with self.uow:
            # Get attempt
            attempt = self.uow.attempts.get_by_id(AttemptId(attempt_id))
            if not attempt:
                raise ValueError(f"Attempt {attempt_id} not found")

            # Get question
            question = self.uow.questions.get_by_id(QuestionId(question_id))
            if not question:
                raise ValueError(f"Question {question_id} not found")

            # Create user answer
            user_answer = UserAnswer(
                id=None,
                attempt_id=AttemptId(attempt_id),
                question_id=QuestionId(question_id),
                answer_payload=AnswerPayload(answer_data),
                created_at=datetime.utcnow(),
            )

            # Evaluate answer
            evaluation_service = AnswerEvaluationService()
            # matching_pairs and ordering don't mark options as is_correct —
            # all options define the correct structure, so pass all of them.
            types_using_all_options = (QuestionType.MATCHING_PAIRS, QuestionType.ORDERING)
            if question.question_type in types_using_all_options:
                correct_options = question.answer_options
            else:
                correct_options = [opt for opt in question.answer_options if opt.is_correct]
            is_correct, points = evaluation_service.evaluate_answer(
                user_answer, question, correct_options
            )

            user_answer.is_correct = is_correct
            user_answer.points_earned = points

            # Add to attempt
            attempt.add_answer(user_answer)

            # Persist
            self.uow.attempts.update(attempt)
            self.uow.commit()

            return {
                "question_id": question_id,
                "is_correct": is_correct,
                "points_earned": points,
            }


class CompleteAttemptUseCase:
    """Use case for completing an attempt"""

    def __init__(self, uow: IUnitOfWork):
        self.uow = uow

    def execute(self, attempt_id: int) -> dict:
        """
        Complete an attempt and calculate score
        
        Args:
            attempt_id: ID of the attempt to complete
            
        Returns:
            Dictionary with final score and status
            
        Raises:
            ValueError if attempt not found
        """
        with self.uow:
            # Get attempt
            attempt = self.uow.attempts.get_by_id(AttemptId(attempt_id))
            if not attempt:
                raise ValueError(f"Attempt {attempt_id} not found")

            # Get test
            test = self.uow.tests.get_by_id(attempt.test_id)
            if not test:
                raise ValueError(f"Test {attempt.test_id.value} not found")

            # Calculate score
            score_service = ScoreCalculationService()
            score = score_service.calculate_attempt_score(attempt, test.get_question_count())

            # Complete attempt
            attempt.complete(score)

            # Persist
            self.uow.attempts.update(attempt)
            self.uow.commit()

            return {
                "id": attempt.id.value,
                "status": attempt.status.value,
                "score": score.points,
                "max_score": score.max_points,
                "percentage": score.get_percentage(),
                "passed": score_service.is_passed(score),
            }


class GetAttemptHistoryUseCase:
    """Use case for getting user's attempt history"""

    def __init__(self, uow: IUnitOfWork):
        self.uow = uow

    def execute(self, user_id: str, limit: int = 50, offset: int = 0) -> list[dict]:
        """
        Get user's attempt history
        
        Args:
            user_id: ID of the user
            limit: Maximum number of attempts
            offset: Number of attempts to skip
            
        Returns:
            List of attempt dictionaries
        """
        with self.uow:
            attempts = self.uow.attempts.get_by_user(UserId(user_id), limit=limit, offset=offset)
            return [
                {
                    "id": attempt.id.value,
                    "test_id": attempt.test_id.value,
                    "status": attempt.status.value,
                    "score": attempt.score.points if attempt.score else None,
                    "max_score": attempt.score.max_points if attempt.score else None,
                    "percentage": attempt.score.get_percentage() if attempt.score else None,
                    "created_at": attempt.created_at.isoformat() if attempt.created_at else None,
                    "completed_at": attempt.completed_at.isoformat() if attempt.completed_at else None,
                }
                for attempt in attempts
            ]


class GetAttemptDetailUseCase:
    """Use case for getting detailed attempt information"""

    def __init__(self, uow: IUnitOfWork):
        self.uow = uow

    def execute(self, attempt_id: int) -> dict:
        """
        Get detailed attempt information
        
        Args:
            attempt_id: ID of the attempt
            
        Returns:
            Dictionary with attempt details
            
        Raises:
            ValueError if attempt not found
        """
        with self.uow:
            attempt = self.uow.attempts.get_by_id(AttemptId(attempt_id))
            if not attempt:
                raise ValueError(f"Attempt {attempt_id} not found")

            return {
                "id": attempt.id.value,
                "test_id": attempt.test_id.value,
                "user_id": attempt.user_id.value,
                "status": attempt.status.value,
                "score": attempt.score.points if attempt.score else None,
                "max_score": attempt.score.max_points if attempt.score else None,
                "percentage": attempt.score.get_percentage() if attempt.score else None,
                "user_answers": [
                    {
                        "id": ua.id,
                        "question_id": ua.question_id.value,
                        "answer_payload": ua.answer_payload.data,
                        "is_correct": ua.is_correct,
                        "points_earned": ua.points_earned,
                    }
                    for ua in attempt.user_answers
                ],
                "created_at": attempt.created_at.isoformat() if attempt.created_at else None,
                "completed_at": attempt.completed_at.isoformat() if attempt.completed_at else None,
            }
