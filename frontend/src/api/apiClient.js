import axios from 'axios'

let backendUrl = import.meta.env.VITE_API_BASE || 'http://localhost:4000'
if (!backendUrl.includes('.') && backendUrl !== 'localhost' && !backendUrl.includes(':')) {
  backendUrl = `${backendUrl}.onrender.com`
}
if (!backendUrl.startsWith('http')) {
  backendUrl = `https://${backendUrl}`
}
const API_BASE = backendUrl.endsWith('/api') ? backendUrl : `${backendUrl}/api`
console.log('API Client API_BASE:', API_BASE); // Debug logging

const client = axios.create({ baseURL: API_BASE, timeout: 60000 })

// Add token to requests if it exists
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export async function createFarm(input) {
  const resp = await client.post('/farm', input)
  return resp.data
}

export async function getForecast(lat, lon) {
  const resp = await client.get('/weather/forecast', { params: { lat, lon } })
  return resp.data
}

export async function listHistory() {
  const resp = await client.get('/history')
  return resp.data
}

export default client
