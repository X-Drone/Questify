import { useEffect, useState } from "react";
import { useLocation } from "react-router";

const TOKEN_KEY = "auth_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

type AuthState = {
  isAuth: boolean;
  username: string | null;
  loading: boolean;
};

export async function validateAuth(token: string) {
  const res = await fetch(
    `${import.meta.env.VITE_AUTH_URL_SERVER}/auth/verify`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) return null;

  return res.json();
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    isAuth: false,
    username: null,
    loading: true,
  });

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setState({
        isAuth: false,
        username: null,
        loading: false,
      });
      return;
    }

    (async () => {
      try {
        const data = await validateAuth(token);

        if (!data) {
          setState({
            isAuth: false,
            username: null,
            loading: false,
          });
          
          logout();
          window.location.reload();
          return;
        }

        setState({
          isAuth: true,
          username: data.username,
          loading: false,
        });
      } catch {
        setState({
          isAuth: false,
          username: null,
          loading: false,
        });
      }
    })();
  }, []);

  return state;
}

export function useLoginRedirect() {
  const location = useLocation();

  return () => {
    const authUrl = import.meta.env.VITE_AUTH_URL_CLIENT;

    // полный путь (включая query)
    const returnTo = location.pathname + location.search;

    const redirectUrl = `${authUrl}` +
      `?redirect=${encodeURIComponent(window.location.origin + "/auth/callback")}` +
      `&state=${encodeURIComponent(returnTo)}`;

    window.location.href = redirectUrl;
  };
}
