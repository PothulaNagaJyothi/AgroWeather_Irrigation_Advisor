import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signup } from '../api/authService'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      await signup(email, password)
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
        <h2 className="card-title" style={{ textAlign: 'center', marginBottom: '32px' }}>Create Your AgroWeather Account</h2>

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
            <p className="form-helper">We'll use this to sign you in</p>
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
            <p className="form-helper">Must be at least 6 characters</p>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? '⏳ Creating account...' : '🌾 Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-light)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
