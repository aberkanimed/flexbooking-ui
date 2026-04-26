export interface ProductResponse {
  id: string
  name: string
  description: string
  active: boolean
}

export interface ServiceResponse {
  id: string
  name: string
  description: string
  active: boolean
  basePrice: number
}

const BASE_URL = process.env.CATALOG_API_URL ?? 'http://localhost:8080/api'

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}

export async function getProducts(): Promise<ProductResponse[]> {
  const data = await apiFetch<{ products: ProductResponse[] }>('/v1/catalog/products')
  return data.products
}

export async function getServices(): Promise<ServiceResponse[]> {
  const data = await apiFetch<{ services: ServiceResponse[] }>('/v1/catalog/services')
  return data.services
}
