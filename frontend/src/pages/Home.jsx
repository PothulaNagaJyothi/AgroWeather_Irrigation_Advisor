import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAuthenticated } from '../api/authService'

export default function Home() {
  const navigate = useNavigate()
  const isAuth = isAuthenticated()

  const features = [
    { icon: '⛅', title: 'Weather-Driven', desc: 'Real-time weather forecast integration' },
    { icon: '🌱', title: 'Crop-Aware', desc: 'Tailored advice for your crop type' },
    { icon: '🏞️', title: 'Soil-Optimized', desc: 'Account for soil water retention' },
    { icon: '📊', title: 'Data-Backed', desc: 'Rule-based decision engine' }
  ]

  return (
    <div>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '16px', color: 'var(--primary-dark)' }}>
          Make Smarter Irrigation Decisions
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
          AgroWeather Irrigation Advisor helps farmers optimize irrigation scheduling using real-time weather forecasts, soil conditions, and crop requirements.
        </p>
        {isAuth ? (
          <Link to="/farm" className="btn btn-primary btn-lg">
            Get Started → Get Irrigation Advice
          </Link>
        ) : (
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link to="/signup" className="btn btn-primary btn-lg">
              Sign Up Free
            </Link>
            <button 
              onClick={() => navigate('/login')} 
              className="btn btn-outline btn-lg"
              style={{ background: 'transparent', border: '2px solid var(--primary)', color: 'var(--primary)' }}
            >
              Login
            </button>
          </div>
        )}
      </div>

      {/* Features Grid */}
      <div style={{ marginBottom: '60px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>Why Choose AgroWeather?</h2>
        <div className="grid grid-cols-4">
          {features.map((f, i) => (
            <div key={i} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{f.icon}</div>
              <h3 style={{ marginBottom: '12px' }}>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', color: 'white', textAlign: 'center' }}>
        <h3 style={{ color: 'white', marginBottom: '12px' }}>Ready to Optimize Your Irrigation?</h3>
        <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '24px' }}>
          {isAuth ? 'Access your farm data and get personalized recommendations.' : 'Get started in 2 minutes with a free account.'}
        </p>
        {isAuth ? (
          <Link to="/farm" className="btn" style={{ background: 'white', color: 'var(--primary)' }}>
            Go to Farm Input
          </Link>
        ) : (
          <Link to="/signup" className="btn" style={{ background: 'white', color: 'var(--primary)' }}>
            Create Account
          </Link>
        )}
      </div>
    </div>
  )
}
