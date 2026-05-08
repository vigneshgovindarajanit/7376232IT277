import axios from 'axios'

const STORAGE_KEY = 'affordmed-frontend-session'
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://4.224.186.213/evaluation-service'

function buildAuthHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function normalizeError(error, fallbackMessage) {
  return (
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.message ??
    fallbackMessage
  )
}

export function loadStoredSession() {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (!stored) {
    return null
  }

  try {
    return JSON.parse(stored)
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function saveStoredSession(session) {
  if (!session) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export async function registerCandidate(payload) {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, payload)
    return response.data
  } catch (error) {
    throw new Error(normalizeError(error, 'Registration failed.'), { cause: error })
  }
}

export async function authenticateCandidate(payload) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth`, payload)
    return response.data
  } catch (error) {
    throw new Error(normalizeError(error, 'Authentication failed.'), { cause: error })
  }
}

export async function fetchNotifications({ token, page = 1, limit = 20, notificationType = '' }) {
  try {
    const response = await axios.get(`${API_BASE_URL}/notifications`, {
      params: {
        page,
        limit,
        ...(notificationType ? { notification_type: notificationType } : {}),
      },
      headers: buildAuthHeaders(token),
    })

    return response.data.notifications ?? []
  } catch (error) {
    throw new Error(normalizeError(error, 'Unable to fetch notifications.'), {
      cause: error,
    })
  }
}

export async function logEvent({
  token,
  stack = 'frontend',
  level = 'info',
  packageName = 'api',
  message,
}) {
  if (!token || !message) {
    return null
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/logs`,
      {
        stack,
        level,
        package: packageName,
        message,
      },
      {
        headers: buildAuthHeaders(token),
      },
    )

    return response.data
  } catch {
    return null
  }
}
