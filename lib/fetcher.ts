export async function fetcher<T = any>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, { ...init, credentials: "include" })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed: ${res.status}`)
  }
  return res.json()
}
