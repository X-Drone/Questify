"""
Authentication dependency
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, List
from core import settings
from infra.auth_client import AuthClient

security = HTTPBearer()
auth_client = AuthClient(settings.auth_url)


class CurrentUser:
    """Current user information"""
    def __init__(self, user_id: int, username: str, roles: List[str]):
        self.user_id = user_id
        self.username = username
        self.roles = roles
    
    def has_role(self, role: str) -> bool:
        """Check if user has a specific role"""
        return role in self.roles


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> CurrentUser:
    """
    Get the current user from JWT token
    
    Returns:
        CurrentUser object with user_id, username, and roles
    """
    try:
        token = credentials.credentials
        user_id, username, roles = auth_client.verify(token, timeout=5)
        return CurrentUser(user_id, username, roles)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )

