"""
API routes for attempt management
"""
from fastapi import APIRouter, Depends, HTTPException
from infra.persist.db import db
from infra.persist.uow import UnitOfWork
from app.use_cases.attempt_management import (
    StartAttemptUseCase,
    SubmitAnswerUseCase,
    CompleteAttemptUseCase,
    GetAttemptHistoryUseCase,
    GetAttemptDetailUseCase,
)
from infra.web.schemas.schemas import (
    AnswerSubmitRequest,
    AttemptDetailResponse,
    AttemptHistoryResponse,
    AttemptCompleteResponse,
)
from infra.web.api.auth import CurrentUser, get_current_user

router = APIRouter(prefix="/attempts", tags=["attempts"])


def get_uow() -> UnitOfWork:
    """Dependency for getting Unit of Work"""
    return UnitOfWork(db.getSession)


@router.post("/start/{test_id}", summary="Start a test attempt")
async def start_attempt(
    test_id: int,
    current_user: CurrentUser = Depends(get_current_user),
    uow: UnitOfWork = Depends(get_uow),
):
    """Start a new test attempt"""
    try:
        use_case = StartAttemptUseCase(uow)
        result = use_case.execute(current_user.user_id, test_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{attempt_id}/questions/{question_id}/answer", summary="Submit answer")
async def submit_answer(
    attempt_id: int,
    question_id: int,
    request: AnswerSubmitRequest,
    current_user: CurrentUser = Depends(get_current_user),
    uow: UnitOfWork = Depends(get_uow),
):
    """Submit an answer to a question"""
    try:
        use_case = SubmitAnswerUseCase(uow)
        result = use_case.execute(attempt_id, question_id, request.data)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{attempt_id}/complete", summary="Complete attempt", response_model=AttemptCompleteResponse)
async def complete_attempt(
    attempt_id: int,
    current_user: CurrentUser = Depends(get_current_user),
    uow: UnitOfWork = Depends(get_uow),
):
    """Complete an attempt and calculate score"""
    try:
        use_case = CompleteAttemptUseCase(uow)
        result = use_case.execute(attempt_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history", summary="Get attempt history", response_model=list[AttemptHistoryResponse])
async def get_history(
    limit: int = 50,
    offset: int = 0,
    current_user: CurrentUser = Depends(get_current_user),
    uow: UnitOfWork = Depends(get_uow),
):
    """Get current user's attempt history"""
    try:
        use_case = GetAttemptHistoryUseCase(uow)
        result = use_case.execute(current_user.user_id, limit=limit, offset=offset)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{attempt_id}", summary="Get attempt details", response_model=AttemptDetailResponse)
async def get_attempt_detail(
    attempt_id: int,
    current_user: CurrentUser = Depends(get_current_user),
    uow: UnitOfWork = Depends(get_uow),
):
    """Get detailed information about an attempt"""
    try:
        use_case = GetAttemptDetailUseCase(uow)
        result = use_case.execute(attempt_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
