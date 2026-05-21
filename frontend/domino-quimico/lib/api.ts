const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("dominoToken")
}

export function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken()

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
}