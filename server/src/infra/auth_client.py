import json
import requests
import http.client
from urllib.parse import urlparse
from typing import Tuple, Optional, List

from app.interfaces.auth_client import IAuthClient, AuthServiceError, InvalidTokenError


class AuthClient(IAuthClient):
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")

    def verify(self, token: str, timeout: int = 5) -> Tuple[int, str, List[str]]:
        """
        Verify a JWT token and get user info
        
        Returns:
            Tuple of (user_id, username, roles)
        """
        try:
            data = self._verify_requests(token, timeout)
        except Exception:
            try:
                data = self._verify_http_client(token, timeout)
            except Exception as e:
                raise AuthServiceError(f"Failed to verify token: {str(e)}")

        # Verify token validity
        if not data.get("valid"):
            raise AuthServiceError(data.get("detail", "Invalid token"))
        
        # Get username from response
        username = data.get("username")
        if not username:
            raise AuthServiceError("No username in token response")
        
        # Get user info from /users/me endpoint
        try:
            user_info = self._get_user_info(token, timeout)
            user_id = user_info.get("id")
            
            # Get user roles
            roles = self._get_user_roles(user_id, token, timeout)
            
            return user_id, username, roles
        except Exception as e:
            raise AuthServiceError(f"Failed to get user info: {str(e)}")

    # PRIMARY: requests library
    def _verify_requests(self, token: str, timeout: int) -> dict:
        """Verify token using requests library"""
        url = f"{self.base_url}/verify"

        response = requests.post(
            url,
            json={"token": token},
            timeout=timeout
        )

        if response.status_code != 200:
            raise AuthServiceError(
                f"Auth service on {url} returned {response.status_code}"
            )

        return response.json()

    # FALLBACK: http.client
    def _verify_http_client(self, token: str, timeout: int) -> dict:
        """Verify token using http.client (fallback)"""
        parsed = urlparse(self.base_url)

        conn_cls = (
            http.client.HTTPSConnection
            if parsed.scheme == "https"
            else http.client.HTTPConnection
        )

        conn = conn_cls(parsed.netloc, timeout=timeout)

        try:
            payload = json.dumps({"token": token})
            headers = {"Content-Type": "application/json"}

            conn.request("POST", f"{parsed.path}/verify", body=payload, headers=headers)

            response = conn.getresponse()

            if response.status != 200:
                raise AuthServiceError(
                    f"Auth service returned {response.status}"
                )

            raw = response.read().decode("utf-8")

            try:
                return json.loads(raw)
            except json.JSONDecodeError:
                raise AuthServiceError("Invalid JSON from auth service")

        except TimeoutError:
            raise AuthServiceError("Auth service timeout")
        finally:
            conn.close()

    def _get_user_info(self, token: str, timeout: int) -> dict:
        """Get user info from /users/me endpoint"""
        base_parts = self.base_url.rsplit("/auth", 1)
        root_url = base_parts[0] if len(base_parts) > 1 else self.base_url
        url = f"{root_url}/users/me"
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        response = requests.get(url, headers=headers, timeout=timeout)

        if response.status_code != 200:
            raise AuthServiceError(
                f"Failed to get user info: {response.status_code}"
            )

        return response.json()

    def _get_user_roles(self, user_id: int, token: str, timeout: int) -> List[str]:
        """Get user roles from /roles/user/{user_id} endpoint"""
        # Reconstruct root URL from auth URL (e.g., http://localhost:3003/auth/ -> http://localhost:3003/)
        base_parts = self.base_url.rsplit("/auth", 1)
        root_url = base_parts[0] if len(base_parts) > 1 else self.base_url
        url = f"{root_url}/roles/user/{user_id}"
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        try:
            response = requests.get(url, headers=headers, timeout=timeout)
            
            if response.status_code == 200:
                data = response.json()
                roles = data.get("roles", [])
                return [role.get("name", "") for role in roles]
            else:
                return []
        except Exception:
            # If roles can't be fetched, return empty list
            return []


    # ------------------------
    # COMMON LOGIC
    # ------------------------
    def _process_response(self, data: dict) -> tuple[str, str]:
        valid = data.get("valid")
        username = data.get("username")
        role = data.get("role")
        detail = data.get("detail")

        if not valid:
            raise InvalidTokenError(detail or "Invalid token")

        if not username:
            raise AuthServiceError("Auth response missing username")

        if not role:
            raise AuthServiceError("Auth response missing role")

        return username, role