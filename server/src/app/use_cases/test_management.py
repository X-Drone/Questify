"""
Use cases for test management
"""
from typing import List

from domain.entities import Test, Question, AnswerOption
from domain.values import (
    TestId, QuestionId, UserId, TestStatus, QuestionType, AnswerPayload
)
from domain.services import TestPublishService
from app.interfaces.uow import IUnitOfWork
from datetime import datetime


class CreateTestUseCase:
    """Use case for creating a new test"""

    def __init__(self, uow: IUnitOfWork):
        self.uow = uow

    def execute(self, creator_id: str, title: str, description: str, tags: List[str] = None) -> dict:
        with self.uow:
            test = Test(
                id=TestId(None),
                creator_id=UserId(creator_id),
                title=title,
                description=description,
                status=TestStatus.DRAFT,
                version=1,
                tags=tags or [],
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )

            created_test = self.uow.tests.add(test)
            self.uow.commit()

            return {
                "id": created_test.id.value,
                "title": created_test.title,
                "description": created_test.description,
                "status": created_test.status.value,
                "tags": created_test.tags,
                "questions": [],
                "created_at": created_test.created_at.isoformat() if created_test.created_at else None,
                "published_at": None,
            }


class PublishTestUseCase:
    """Use case for publishing a test"""

    def __init__(self, uow: IUnitOfWork):
        self.uow = uow

    def execute(self, test_id: int) -> dict:
        """
        Publish a test
        
        Args:
            test_id: ID of the test to publish
            
        Returns:
            Dictionary with updated test data
            
        Raises:
            ValueError if test cannot be published
        """
        with self.uow:
            # Get test
            test = self.uow.tests.get_by_id(TestId(test_id))
            if not test:
                raise ValueError(f"Test {test_id} not found")

            # Publish using domain service
            service = TestPublishService()
            test = service.publish(test)

            # Persist
            test = self.uow.tests.update(test)
            self.uow.commit()

            return {
                "id": test.id.value,
                "title": test.title,
                "status": test.status.value,
                "published_at": test.published_at.isoformat() if test.published_at else None,
            }


class DeleteTestUseCase:
    """Use case for deleting a test"""

    def __init__(self, uow: IUnitOfWork):
        self.uow = uow

    def execute(self, test_id: int, user_id: str) -> None:
        """
        Delete a test
        
        Args:
            test_id: ID of the test to delete
            user_id: ID of the user (for authorization)
            
        Raises:
            ValueError if test not found or user is not the creator
        """
        with self.uow:
            # Get test
            test = self.uow.tests.get_by_id(TestId(test_id))
            if not test:
                raise ValueError(f"Test {test_id} not found")

            # Compare as strings: creator_id is stored as String in DB but may arrive as int
            if str(test.creator_id.value) != str(user_id):
                raise ValueError("User is not authorized to delete this test")

            # Delete
            self.uow.tests.remove(TestId(test_id))
            self.uow.commit()


class GetCreatorTestsUseCase:
    """Use case for getting all tests created by a user"""

    def __init__(self, uow: IUnitOfWork):
        self.uow = uow

    def execute(self, creator_id: str) -> List[dict]:
        """
        Get all tests created by a user
        
        Args:
            creator_id: ID of the creator
            
        Returns:
            List of test dictionaries
        """
        with self.uow:
            tests = self.uow.tests.get_by_creator(UserId(creator_id))
            return [
                {
                    "id": test.id.value,
                    "title": test.title,
                    "description": test.description,
                    "status": test.status.value,
                    "question_count": test.get_question_count(),
                    "tags": test.tags,
                    "created_at": test.created_at.isoformat() if test.created_at else None,
                }
                for test in tests
            ]


class GetPublishedTestsUseCase:
    """Use case for getting published tests"""

    def __init__(self, uow: IUnitOfWork):
        self.uow = uow

    def execute(self, limit: int = 50, offset: int = 0) -> List[dict]:
        """
        Get published tests
        
        Args:
            limit: Maximum number of tests to return
            offset: Number of tests to skip
            
        Returns:
            List of test dictionaries
        """
        with self.uow:
            tests = self.uow.tests.get_published(limit=limit, offset=offset)
            return [
                {
                    "id": test.id.value,
                    "title": test.title,
                    "description": test.description,
                    "status": test.status.value,
                    "question_count": test.get_question_count(),
                    "tags": test.tags,
                    "created_at": test.created_at.isoformat() if test.created_at else None,
                }
                for test in tests
            ]


class GetTestDetailUseCase:
    """Use case for getting detailed test information"""

    def __init__(self, uow: IUnitOfWork):
        self.uow = uow

    def execute(self, test_id: int) -> dict:
        """
        Get detailed test information
        
        Args:
            test_id: ID of the test
            
        Returns:
            Dictionary with test details
            
        Raises:
            ValueError if test not found
        """
        with self.uow:
            test = self.uow.tests.get_by_id(TestId(test_id))
            if not test:
                raise ValueError(f"Test {test_id} not found")

            return {
                "id": test.id.value,
                "title": test.title,
                "description": test.description,
                "status": test.status.value,
                "tags": test.tags,
                "questions": [
                    {
                        "id": q.id.value,
                        "title": q.title,
                        "description": q.description,
                        "type": q.question_type.value,
                        "order": q.order,
                        "answer_options": [
                            {
                                "id": opt.id,
                                "text": opt.text,
                                "is_correct": opt.is_correct,
                                "order": opt.order,
                            }
                            for opt in q.answer_options
                        ],
                    }
                    for q in test.questions
                ],
                "created_at": test.created_at.isoformat() if test.created_at else None,
                "published_at": test.published_at.isoformat() if test.published_at else None,
            }


class UpdateTestUseCase:
    """Use case for updating test metadata (title, description, tags)"""

    def __init__(self, uow: IUnitOfWork):
        self.uow = uow

    def execute(
        self,
        test_id: int,
        user_id,
        title: str = None,
        description: str = None,
        tags: List[str] = None,
    ) -> dict:
        with self.uow:
            test = self.uow.tests.get_by_id(TestId(test_id))
            if not test:
                raise ValueError(f"Test {test_id} not found")

            if str(test.creator_id.value) != str(user_id):
                raise ValueError("User is not authorized to update this test")

            if title is not None:
                test.title = title
            if description is not None:
                test.description = description
            if tags is not None:
                test.tags = tags

            test.updated_at = datetime.utcnow()
            updated = self.uow.tests.update(test)
            self.uow.commit()

            return {
                "id": updated.id.value,
                "title": updated.title,
                "description": updated.description,
                "status": updated.status.value,
                "tags": updated.tags,
                "created_at": updated.created_at.isoformat() if updated.created_at else None,
                "published_at": updated.published_at.isoformat() if updated.published_at else None,
            }
