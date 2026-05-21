"""
Auth client interface
"""
from typing import Protocol


class AuthServiceError(Exception):
    """Exception raised when auth service returns an error"""
    pass


class InvalidTokenError(Exception):
    """Exception raised when auth client cant resolve token"""
    pass


class IAuthClient(Protocol):
    """Interface for external auth service"""

    def verify(self, token: str, timeout: int = 5) -> tuple[str, str]:
        """
        Verify a JWT token with the auth service
        
        Returns:
            Tuple of (user_id, role)
            
        Raises:
            AuthServiceError if verification fails
        """
        ...
