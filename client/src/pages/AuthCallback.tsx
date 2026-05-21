import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { setToken } from '../hooks/auth'

export function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    const state = searchParams.get("state") || "/";
    
    if (token) {
      setToken(token)
      navigate(state, { replace: true })
    } else {
      navigate('/auth/error', { replace: true })
    }
  }, [searchParams, navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-lg">Processing authentication...</p>
      </div>
    </div>
  )
}
