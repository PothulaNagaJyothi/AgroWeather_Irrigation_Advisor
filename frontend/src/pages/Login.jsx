import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api/authService'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
      navigate('/farm')
    } catch (err) {
      setError(err?.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '480px', margin: '40px auto' }}>
      <div className="card">
        <h2 className="card-title" style={{ textAlign: 'center', marginBottom: '32px' }}>Login to AgroWeather</h2>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <form onSubmit={submit} className="form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? '⏳ Signing in...' : '🔓 Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-light)' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)' }}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}
