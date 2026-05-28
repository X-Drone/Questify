"""
Use cases for question management
"""
from domain.entities import Question, AnswerOption
from domain.values import (
    QuestionId, TestId, QuestionType, AnswerPayload
)
from app.interfaces.uow import IUnitOfWork
from datetime import datetime


def _option_text(question_type: str, opt_data: dict) -> str:
    """
    Convert answer option data to the text stored in the DB.

    Convention:
    - numeric_answer  → "value|tolerance"  (e.g. "9.81|0.01")
    - matching_pairs  → "left|right"       (e.g. "France|Paris")
    - all others      → opt_data["text"]
    """
    if question_type == "numeric_answer":
        value = opt_data.get("value", 0)
        tolerance = opt_data.get("tolerance", 0)
        return f"{value}|{tolerance}"
    if question_type == "matching_pairs":
        left = opt_data.get("left", "")
        right = opt_data.get("right", "")
        return f"{left}|{right}"
    return opt_data.get("text", "")


class AddQuestionUseCase:
    """Use case for adding a question to a test"""

    def __init__(self, uow: IUnitOfWork):
        self.uow = uow

    def execute(
        self,
        test_id: int,
        title: str,
        description: str,
        question_type: str,
        answer_options_data: list[dict],
        media_url: str = None,
    ) -> dict:
        """
        Add a question to a test
        
        Args:
            test_id: ID of the test
            title: Question title
            description: Question description
            question_type: Type of question (single_choice, multiple_choice, etc)
            answer_options_data: List of answer options
            media_url: Optional URL to media
            
        Returns:
            Dictionary with created question data
        """
        with self.uow:
            # Get test
            test = self.uow.tests.get_by_id(TestId(test_id))
            if not test:
                raise ValueError(f"Test {test_id} not found")

            # Create question
            question = Question(
                id=QuestionId(None),
                test_id=TestId(test_id),
                title=title,
                description=description,
                question_type=QuestionType(question_type),
                media_url=media_url,
                order=test.get_question_count() + 1,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )

            # Add answer options — format depends on question type
            for idx, opt_data in enumerate(answer_options_data):
                text = _option_text(question_type, opt_data)
                option = AnswerOption(
                    id=None,
                    question_id=question.id,
                    text=text,
                    is_correct=opt_data.get("is_correct", False),
                    order=idx,
                )
                question.add_answer_option(option)

            # Add question to test
            test.add_question(question)

            # Persist
            created_question = self.uow.questions.add(question)
            self.uow.tests.update(test)
            self.uow.commit()

            return {
                "id": created_question.id.value,
                "title": created_question.title,
                "type": created_question.question_type.value,
                "order": created_question.order,
            }


class DeleteQuestionUseCase:
    """Use case for deleting a question from a test"""

    def __init__(self, uow: IUnitOfWork):
        self.uow = uow

    def execute(self, test_id: int, question_id: int) -> None:
        """
        Delete a question from a test
        
        Args:
            test_id: ID of the test
            question_id: ID of the question to delete
            
        Raises:
            ValueError if test or question not found
        """
        with self.uow:
            # Get test
            test = self.uow.tests.get_by_id(TestId(test_id))
            if not test:
                raise ValueError(f"Test {test_id} not found")

            # Get question
            question = self.uow.questions.get_by_id(QuestionId(question_id))
            if not question:
                raise ValueError(f"Question {question_id} not found")

            # Remove from test
            test.remove_question(QuestionId(question_id))

            # Delete
            self.uow.questions.remove(QuestionId(question_id))
            self.uow.tests.update(test)
            self.uow.commit()


class UpdateQuestionUseCase:
    """Use case for updating a question"""

    def __init__(self, uow: IUnitOfWork):
        self.uow = uow

    def execute(
        self,
        question_id: int,
        title: str = None,
        description: str = None,
        answer_options_data: list[dict] = None,
    ) -> dict:
        """
        Update a question
        
        Args:
            question_id: ID of the question to update
            title: New title (optional)
            description: New description (optional)
            answer_options_data: New answer options (optional)
            
        Returns:
            Dictionary with updated question data
        """
        with self.uow:
            # Get question
            question = self.uow.questions.get_by_id(QuestionId(question_id))
            if not question:
                raise ValueError(f"Question {question_id} not found")

            # Update fields
            if title:
                question.title = title
            if description:
                question.description = description
            
            if answer_options_data:
                question.answer_options = []
                for idx, opt_data in enumerate(answer_options_data):
                    text = _option_text(question.question_type.value, opt_data)
                    option = AnswerOption(
                        id=None,
                        question_id=question.id,
                        text=text,
                        is_correct=opt_data.get("is_correct", False),
                        order=idx,
                    )
                    question.add_answer_option(option)

            question.updated_at = datetime.utcnow()

            # Persist
            updated_question = self.uow.questions.update(question)
            self.uow.commit()

            return {
                "id": updated_question.id.value,
                "title": updated_question.title,
                "type": updated_question.question_type.value,
            }
