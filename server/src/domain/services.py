"""
Domain services for Questify - containing pure business logic
"""
from typing import Optional, Tuple
from domain.entities import Test, Question, Attempt, UserAnswer, AnswerOption
from domain.values import (
    QuestionType, Score, AnswerPayload, QuestionId, UserId
)


class TestPublishService:
    """Service for publishing tests"""

    def publish(self, test: Test) -> Test:
        """
        Publish a test
        
        Validations:
        - Test must not already be published
        - Test must have at least one question
        """
        if test.get_question_count() == 0:
            raise ValueError("Cannot publish a test without questions")
        
        test.publish()
        return test


class AnswerEvaluationService:
    """Service for evaluating answers"""

    def evaluate_answer(
        self, 
        answer: UserAnswer, 
        question: Question, 
        correct_options: list[AnswerOption]
    ) -> Tuple[bool, float]:
        """
        Evaluate an answer and return (is_correct, points_earned)
        
        Args:
            answer: The user's answer
            question: The question being answered
            correct_options: List of correct options for this question
        
        Returns:
            Tuple of (is_correct, points_earned)
        """
        if question.question_type == QuestionType.SINGLE_CHOICE:
            return self._evaluate_single_choice(answer, correct_options)
        elif question.question_type == QuestionType.MULTIPLE_CHOICE:
            return self._evaluate_multiple_choice(answer, correct_options)
        elif question.question_type == QuestionType.TRUE_FALSE:
            return self._evaluate_true_false(answer, correct_options)
        elif question.question_type == QuestionType.TEXT_ANSWER:
            return self._evaluate_text_answer(answer, correct_options)
        elif question.question_type == QuestionType.NUMERIC_ANSWER:
            return self._evaluate_numeric_answer(answer, correct_options)
        elif question.question_type == QuestionType.MATCHING_PAIRS:
            return self._evaluate_matching_pairs(answer, correct_options)
        elif question.question_type == QuestionType.ORDERING:
            return self._evaluate_ordering(answer, correct_options)
        else:
            raise ValueError(f"Unknown question type: {question.question_type}")

    def _evaluate_single_choice(
        self, 
        answer: UserAnswer, 
        correct_options: list[AnswerOption]
    ) -> Tuple[bool, float]:
        """Evaluate single choice answer"""
        selected_id = answer.answer_payload.data.get("selected_id")
        correct_id = correct_options[0].order if correct_options else None
        
        is_correct = selected_id == correct_id
        points = 1.0 if is_correct else 0.0
        return is_correct, points

    def _evaluate_multiple_choice(
        self, 
        answer: UserAnswer, 
        correct_options: list[AnswerOption]
    ) -> Tuple[bool, float]:
        """Evaluate multiple choice answer"""
        selected_ids = set(answer.answer_payload.data.get("selected_ids", []))
        correct_ids = {opt.order for opt in correct_options}
        
        is_correct = selected_ids == correct_ids
        points = 1.0 if is_correct else 0.0
        return is_correct, points

    def _evaluate_true_false(
        self, 
        answer: UserAnswer, 
        correct_options: list[AnswerOption]
    ) -> Tuple[bool, float]:
        """Evaluate true/false answer"""
        selected_value = answer.answer_payload.data.get("selected_value")
        correct_value = correct_options[0].text.lower() == "true" if correct_options else None
        
        is_correct = selected_value == correct_value
        points = 1.0 if is_correct else 0.0
        return is_correct, points

    def _evaluate_text_answer(
        self, 
        answer: UserAnswer, 
        correct_options: list[AnswerOption]
    ) -> Tuple[bool, float]:
        """
        Evaluate text answer - case-insensitive partial match
        """
        user_text = answer.answer_payload.data.get("text", "").lower().strip()
        
        # Check if any of the correct options match
        for option in correct_options:
            correct_text = option.text.lower().strip()
            # Simple substring matching - can be enhanced
            if correct_text in user_text or user_text in correct_text:
                return True, 1.0
        
        return False, 0.0

    def _evaluate_numeric_answer(
        self, 
        answer: UserAnswer, 
        correct_options: list[AnswerOption]
    ) -> Tuple[bool, float]:
        """
        Evaluate numeric answer - with tolerance
        """
        user_answer = answer.answer_payload.data.get("value")
        tolerance = answer.answer_payload.data.get("tolerance", 0.01)
        
        try:
            user_value = float(user_answer)
            correct_value = float(correct_options[0].text) if correct_options else None
            
            if correct_value is None:
                return False, 0.0
            
            is_correct = abs(user_value - correct_value) <= tolerance
            points = 1.0 if is_correct else 0.0
            return is_correct, points
        except (ValueError, TypeError):
            return False, 0.0

    def _evaluate_matching_pairs(
        self, 
        answer: UserAnswer, 
        correct_options: list[AnswerOption]
    ) -> Tuple[bool, float]:
        """Evaluate matching pairs answer"""
        # Format: {"pairs": [{"left": "id1", "right": "id2"}, ...]}
        user_pairs = set(
            tuple(sorted([p["left"], p["right"]]))
            for p in answer.answer_payload.data.get("pairs", [])
        )
        
        correct_pairs = set(
            tuple(sorted([opt.text.split("|")[0], opt.text.split("|")[1]]))
            for opt in correct_options
        )
        
        is_correct = user_pairs == correct_pairs
        points = 1.0 if is_correct else 0.0
        return is_correct, points

    def _evaluate_ordering(
        self, 
        answer: UserAnswer, 
        correct_options: list[AnswerOption]
    ) -> Tuple[bool, float]:
        """Evaluate ordering answer"""
        user_order = answer.answer_payload.data.get("order", [])
        correct_order = [opt.id for opt in sorted(correct_options, key=lambda x: x.order)]
        
        is_correct = user_order == correct_order
        points = 1.0 if is_correct else 0.0
        return is_correct, points


class ScoreCalculationService:
    """Service for calculating attempt scores"""

    def calculate_attempt_score(
        self, 
        attempt: Attempt, 
        total_questions: int
    ) -> Score:
        """
        Calculate the total score for an attempt
        
        Args:
            attempt: The attempt to calculate score for
            total_questions: Total number of questions in the test
        
        Returns:
            Score value object
        """
        if not attempt.user_answers:
            return Score(0.0, total_questions)
        
        total_points = sum(answer.points_earned for answer in attempt.user_answers)
        max_points = total_questions
        
        return Score(total_points, max_points)

    def get_pass_score_percentage(self) -> float:
        """Get the passing score percentage (default 60%)"""
        return 60.0

    def is_passed(self, score: Score) -> bool:
        """Check if the score is passing"""
        percentage = score.get_percentage()
        return percentage >= self.get_pass_score_percentage()
