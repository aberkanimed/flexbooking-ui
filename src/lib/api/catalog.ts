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

/** Request body for create and update product mutations. All fields required per OpenAPI. */
export interface ProductRequest {
  name: string
  description: string
  active: boolean
}

/** Error shape returned by the catalog API on non-2xx responses. */
export interface ApiErrorResponse {
  errors: string[]
}

const BASE_URL = process.env.CATALOG_API_URL ?? 'http://localhost:8080/api'

/** GET wrapper — read-only, no body. */
async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}

/**
 * Mutation wrapper — supports POST / PUT / DELETE.
 * On non-OK responses, parses and throws ApiErrorResponse so Server Actions
 * can extract `errors: string[]` for the form banner.
 */
async function apiMutate<T>(
  path: string,
  method: 'POST' | 'PUT' | 'DELETE',
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    cache: 'no-store',
    ...(body !== undefined
      ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      : {}),
  })
  if (!res.ok) {
    let errors: string[] = [`Request failed with status ${res.status}`]
    try {
      const errBody: ApiErrorResponse = await res.json()
      if (Array.isArray(errBody.errors) && errBody.errors.length > 0) {
        errors = errBody.errors
      }
    } catch {
      // body was not JSON; keep the default message
    }
    const err = new Error(errors.join('; ')) as Error & { errors: string[] }
    err.errors = errors
    throw err
  }
  // 204 No Content — nothing to parse
  if (res.status === 204) return undefined as T
  return res.json()
}

// ---------------------------------------------------------------------------
// Read helpers
// ---------------------------------------------------------------------------

/**
 * Returns both active and inactive products.
 * Used by the listing page so operators can see and manage inactive products.
 */
export async function getAllProducts(): Promise<ProductResponse[]> {
  const data = await apiFetch<{ products: ProductResponse[] }>(
    '/v1/catalog/products',
  )
  return data.products
}

export async function getServices(): Promise<ServiceResponse[]> {
  const data = await apiFetch<{ services: ServiceResponse[] }>('/v1/catalog/services')
  return data.services
}

export async function getProductById(id: string): Promise<ProductDetailResponse> {
  return apiFetch<ProductDetailResponse>(`/v1/catalog/products/${id}`)
}

export async function getServiceById(id: string): Promise<ServiceDetailResponse> {
  return apiFetch<ServiceDetailResponse>(`/v1/catalog/services/${id}`)
}

// ---------------------------------------------------------------------------
// Mutation helpers
// ---------------------------------------------------------------------------

/** POST /v1/catalog/products — creates a new product, returns 201 ProductResponse. */
export async function createProduct(body: ProductRequest): Promise<ProductResponse> {
  return apiMutate<ProductResponse>('/v1/catalog/products', 'POST', body)
}

/** PUT /v1/catalog/products/{id} — updates an existing product, returns 200 ProductResponse. */
export async function updateProduct(id: string, body: ProductRequest): Promise<ProductResponse> {
  return apiMutate<ProductResponse>(`/v1/catalog/products/${id}`, 'PUT', body)
}

/** DELETE /v1/catalog/products/{id} — deletes a product, expects 204 No Content. */
export async function deleteProduct(id: string): Promise<void> {
  return apiMutate<void>(`/v1/catalog/products/${id}`, 'DELETE')
}

/** Request body for create and update characteristic mutations. All four fields required per OpenAPI. */
export interface CharacteristicRequest {
  name: string
  description: string
  valueType: 'STRING' | 'NUMBER' | 'BOOLEAN'
  active: boolean
}

/** GET /v1/catalog/characteristics — returns all characteristics (active and inactive). Unwraps `items` envelope. */
export async function getAllCharacteristics(): Promise<CharacteristicResponse[]> {
  const data = await apiFetch<{ items: CharacteristicResponse[] }>('/v1/catalog/characteristics')
  return data.items
}

/** POST /v1/catalog/characteristics — creates a new characteristic, returns 201 CharacteristicResponse. */
export async function createCharacteristic(body: CharacteristicRequest): Promise<CharacteristicResponse> {
  return apiMutate<CharacteristicResponse>('/v1/catalog/characteristics', 'POST', body)
}

/** PUT /v1/catalog/characteristics/{id} — updates an existing characteristic, returns 200 CharacteristicResponse. */
export async function updateCharacteristic(id: string, body: CharacteristicRequest): Promise<CharacteristicResponse> {
  return apiMutate<CharacteristicResponse>(`/v1/catalog/characteristics/${id}`, 'PUT', body)
}

/** DELETE /v1/catalog/characteristics/{id} — server-side deactivates (soft delete), expects 204 No Content. */
export async function deleteCharacteristic(id: string): Promise<void> {
  return apiMutate<void>(`/v1/catalog/characteristics/${id}`, 'DELETE')
}
