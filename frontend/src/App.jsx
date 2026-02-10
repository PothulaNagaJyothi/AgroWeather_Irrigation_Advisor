import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import FarmInput from './pages/FarmInput'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProtectedRoute from './components/ProtectedRoute'
import { isAuthenticated, logout, getUser } from './api/authService'
import './styles/global.css'

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isAuth, setIsAuth] = useState(isAuthenticated())
  const [user, setUser] = useState(getUser())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Check auth status on route change
    const authenticated = isAuthenticated()
    setIsAuth(authenticated)
    if (authenticated) {
      setUser(getUser())
    } else {
      setUser(null)
    }
    // Close mobile menu on route change
    setMobileMenuOpen(false)
  }, [location])

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    setIsAuth(false)
    setUser(null)
    setMobileMenuOpen(false)
    navigate('/')
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <div id="app">
      <header className="header">
        <div className="header-content">
          <div className="header-brand">
            <span className="header-brand-icon">🌾</span>
            <span>AgroWeather Irrigation Advisor</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="header-nav desktop-nav">
            <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
            {isAuth && (
              <>
                <Link to="/farm" className={isActive('/farm') ? 'active' : ''}>Farm Input</Link>
                <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>Dashboard</Link>
                <Link to="/history" className={isActive('/history') ? 'active' : ''}>History</Link>
              </>
            )}
          </nav>

          {/* Desktop Auth Section */}
          <div className="header-auth desktop-auth">
            {isAuth && user ? (
              <div className="auth-section">
                <span className="user-email">{user.email}</span>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </div>
            ) : (
              <div className="auth-section">
                <Link to="/login" className="auth-link">Login</Link>
                <Link to="/signup" className="auth-link signup-link">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Menu Button */}
          <button className="hamburger-btn mobile-only" onClick={toggleMobileMenu} aria-label="Toggle menu">
            <span className={`hamburger-line ${mobileMenuOpen ? 'active' : ''}`}></span>
            <span className={`hamburger-line ${mobileMenuOpen ? 'active' : ''}`}></span>
            <span className={`hamburger-line ${mobileMenuOpen ? 'active' : ''}`}></span>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <nav className="mobile-nav">
              <Link to="/" className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}>
                Home
              </Link>
              {isAuth && (
                <>
                  <Link to="/farm" className={`mobile-nav-link ${isActive('/farm') ? 'active' : ''}`}>
                    Farm Input
                  </Link>
                  <Link to="/dashboard" className={`mobile-nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                    Dashboard
                  </Link>
                  <Link to="/history" className={`mobile-nav-link ${isActive('/history') ? 'active' : ''}`}>
                    History
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile Auth Section */}
            <div className="mobile-auth">
              {isAuth && user ? (
                <div className="mobile-auth-section">
                  <p className="mobile-user-email">{user.email}</p>
                  <button onClick={handleLogout} className="mobile-logout-btn">
                    🚪 Logout
                  </button>
                </div>
              ) : (
                <div className="mobile-auth-section">
                  <Link to="/login" className="mobile-auth-btn login-btn">
                    🔓 Login
                  </Link>
                  <Link to="/signup" className="mobile-auth-btn signup-btn">
                    ✏️ Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main>
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/farm" 
              element={
                <ProtectedRoute>
                  <FarmInput />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/history" 
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </main>

      <footer className="footer">
        <p>&copy; 2026 AgroWeather Irrigation Advisor. Helping farmers make smarter irrigation decisions.</p>
      </footer>
    </div>
  )
}
