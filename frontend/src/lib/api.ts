const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

interface ApiOptions extends RequestInit {
  params?: Record<string, string | number>
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type')
  
  if (!response.ok) {
    let errorData: unknown
    try {
      errorData = contentType?.includes('application/json') 
        ? await response.json() 
        : await response.text()
    } catch {
      errorData = null
    }
    
    const message = typeof errorData === 'object' && errorData && 'message' in errorData
      ? String((errorData as { message: string }).message)
      : response.statusText || 'An error occurred'
      
    throw new ApiError(response.status, message, errorData)
  }
  
  if (!contentType?.includes('application/json')) {
    return null
  }
  
  return response.json()
}

export async function get<T>(endpoint: string, options?: ApiOptions): Promise<T> {
  const url = new URL(`${API_BASE_URL}${endpoint}`)
  
  if (options?.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value))
    })
  }
  
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })
  
  return handleResponse(response) as Promise<T>
}

export async function post<T>(endpoint: string, data?: unknown, options?: ApiOptions): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: JSON.stringify(data),
    ...options,
  })
  
  return handleResponse(response) as Promise<T>
}

export async function put<T>(endpoint: string, data?: unknown, options?: ApiOptions): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: JSON.stringify(data),
    ...options,
  })
  
  return handleResponse(response) as Promise<T>
}

export async function del<T>(endpoint: string, options?: ApiOptions): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })
  
  return handleResponse(response) as Promise<T>
}

export { ApiError }
