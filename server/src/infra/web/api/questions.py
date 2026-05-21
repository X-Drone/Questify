"""
API routes for question management
"""
from fastapi import APIRouter, Depends, HTTPException
from infra.persist.db import db
from infra.persist.uow import UnitOfWork
from app.use_cases.question_management import (
    AddQuestionUseCase,
    DeleteQuestionUseCase,
    UpdateQuestionUseCase,
)
from infra.web.schemas.schemas import (
    QuestionCreateRequest,
    QuestionUpdateRequest,
)
from infra.web.api.auth import CurrentUser, get_current_user

router = APIRouter(prefix="/tests", tags=["questions"])


def get_uow() -> UnitOfWork:
    """Dependency for getting Unit of Work"""
    return UnitOfWork(db.getSession)


'''
{
  "title": "qwe2",
  "description": "qwewqqweqw",
  "type": "multiple_choice",
  "answer_options": [
    {
      "text": "qweqweqweq",
      "is_correct": false
    },
    {
      "text": "qweqweqweq",
      "is_correct": true
    }
  ],
  "media_url": "string"
}
'''
@router.post("/{test_id}/questions", summary="Add question to test")
async def add_question(
    test_id: int,
    request: QuestionCreateRequest,
    current_user: CurrentUser = Depends(get_current_user),
    uow: UnitOfWork = Depends(get_uow),
):
    """Add a question to a test"""
    try:
        use_case = AddQuestionUseCase(uow)
        result = use_case.execute(
            test_id=test_id,
            title=request.title,
            description=request.description or "",
            question_type=request.type,
            answer_options_data=request.answer_options,
            media_url=request.media_url,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{test_id}/questions/{question_id}", summary="Delete question")
async def delete_question(
    test_id: int,
    question_id: int,
    current_user: CurrentUser = Depends(get_current_user),
    uow: UnitOfWork = Depends(get_uow),
):
    """Delete a question from a test"""
    try:
        use_case = DeleteQuestionUseCase(uow)
        use_case.execute(test_id, question_id)
        return {"message": "Question deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{test_id}/questions/{question_id}", summary="Update question")
async def update_question(
    test_id: int,
    question_id: int,
    request: QuestionUpdateRequest,
    current_user: CurrentUser = Depends(get_current_user),
    uow: UnitOfWork = Depends(get_uow),
):
    """Update a question"""
    try:
        use_case = UpdateQuestionUseCase(uow)
        result = use_case.execute(
            question_id=question_id,
            title=request.title,
            description=request.description,
            answer_options_data=request.answer_options,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
