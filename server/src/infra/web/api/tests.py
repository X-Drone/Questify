"""
API routes for test management
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from infra.persist.db import db
from infra.persist.uow import UnitOfWork
from app.use_cases.test_management import (
    CreateTestUseCase,
    UpdateTestUseCase,
    PublishTestUseCase,
    DeleteTestUseCase,
    GetCreatorTestsUseCase,
    GetPublishedTestsUseCase,
    GetTestDetailUseCase,
)
from infra.web.schemas.schemas import (
    TestCreateRequest,
    TestListResponse,
    TestDetailResponse,
)
from infra.web.api.auth import CurrentUser, get_current_user
from pydantic import BaseModel
from typing import Optional


class TestUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[list[str]] = None

router = APIRouter(prefix="/tests", tags=["tests"])


def get_uow() -> UnitOfWork:
    """Dependency for getting Unit of Work"""
    return UnitOfWork(db.getSession)


@router.post("/create", summary="Create a new test")
async def create_test(
    request: TestCreateRequest,
    current_user: CurrentUser = Depends(get_current_user),
    uow: UnitOfWork = Depends(get_uow),
):
    """Create a new test"""
    try:
        use_case = CreateTestUseCase(uow)
        result = use_case.execute(
            creator_id=current_user.user_id,
            title=request.title,
            description=request.description or "",
            tags=request.tags,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{test_id}", summary="Update test metadata")
async def update_test(
    test_id: int,
    request: TestUpdateRequest,
    current_user: CurrentUser = Depends(get_current_user),
    uow: UnitOfWork = Depends(get_uow),
):
    """Update test title, description or tags"""
    try:
        use_case = UpdateTestUseCase(uow)
        result = use_case.execute(
            test_id=test_id,
            user_id=current_user.user_id,
            title=request.title,
            description=request.description,
            tags=request.tags,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{test_id}/publish", summary="Publish a test")
async def publish_test(
    test_id: int,
    current_user: CurrentUser = Depends(get_current_user),
    uow: UnitOfWork = Depends(get_uow),
):
    """Publish a test"""
    try:
        use_case = PublishTestUseCase(uow)
        result = use_case.execute(test_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{test_id}", summary="Delete a test")
async def delete_test(
    test_id: int,
    current_user: CurrentUser = Depends(get_current_user),
    uow: UnitOfWork = Depends(get_uow),
):
    """Delete a test"""
    try:
        use_case = DeleteTestUseCase(uow)
        use_case.execute(test_id, current_user.user_id)
        return {"message": "Test deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/creator/my-tests", summary="Get creator's tests", response_model=list[TestListResponse])
async def get_my_tests(
    current_user: CurrentUser = Depends(get_current_user),
    uow: UnitOfWork = Depends(get_uow),
):
    """Get all tests created by the current user"""
    try:
        use_case = GetCreatorTestsUseCase(uow)
        result = use_case.execute(current_user.user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/published", summary="Get published tests", response_model=list[TestListResponse])
async def get_published_tests(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    uow: UnitOfWork = Depends(get_uow),
):
    """Get published tests"""
    try:
        use_case = GetPublishedTestsUseCase(uow)
        result = use_case.execute(limit=limit, offset=offset)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{test_id}", summary="Get test details", response_model=TestDetailResponse)
async def get_test_detail(
    test_id: int,
    uow: UnitOfWork = Depends(get_uow),
):
    """Get detailed information about a test"""
    try:
        use_case = GetTestDetailUseCase(uow)
        result = use_case.execute(test_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
