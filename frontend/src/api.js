import axios from 'axios'

const api = axios.create({ baseURL: 'http://127.0.0.1:8003/api' })
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hirehub_access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hirehub_access')
      localStorage.removeItem('hirehub_refresh')
      localStorage.removeItem('hirehub_user')
    }
    return Promise.reject(error)
  }
)
export default api
