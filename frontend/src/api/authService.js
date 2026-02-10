import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'

const authClient = axios.create({ baseURL: API_BASE, timeout: 10000 })

// Add token to requests if it exists
authClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export async function signup(email, password) {
  const resp = await authClient.post('/auth/signup', { email, password })
  if (resp.data.token) {
    localStorage.setItem('token', resp.data.token)
    localStorage.setItem('user', JSON.stringify(resp.data.user))
  }
  return resp.data
}

export async function login(email, password) {
  const resp = await authClient.post('/auth/login', { email, password })
  if (resp.data.token) {
    localStorage.setItem('token', resp.data.token)
    localStorage.setItem('user', JSON.stringify(resp.data.user))
  }
  return resp.data
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export function getToken() {
  return localStorage.getItem('token')
}

export function getUser() {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export function isAuthenticated() {
  return !!localStorage.getItem('token')
}

export default authClient
