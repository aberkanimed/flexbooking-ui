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

export interface CharacteristicValueResponse {
  id: string
  value: string
  isDefault: boolean
}

export interface CharacteristicResponse {
  id: string
  name: string
  description: string
  valueType: 'STRING' | 'NUMBER' | 'BOOLEAN'
  active: boolean
}

export interface CharacteristicSpecificationDetailResponse {
  id: string
  code: string
  configurable: boolean
  characteristic: CharacteristicResponse
  unitOfMeasure: 'UNIT' | 'SQUARE_FOOTAGE' | 'HOUR' | 'MINUTE' | 'NONE'
  price: number
  active: boolean
  range: boolean
  valueFrom: number | null
  valueTo: number | null
  values: CharacteristicValueResponse[]
}

export interface ServiceDetailResponse extends ServiceResponse {
  characteristics: CharacteristicSpecificationDetailResponse[]
}

export interface ProductDetailResponse extends ProductResponse {
  services: ServiceDetailResponse[]
  updatedAt?: string
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

export async function getProductById(id: string): Promise<ProductDetailResponse> {
  return apiFetch<ProductDetailResponse>(`/v1/catalog/products/${id}`)
}
