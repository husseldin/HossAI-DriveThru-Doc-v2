// Base types
export interface Branch {
  id: number
  name: string
  location: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BranchCreate {
  name: string
  location: string
  is_active?: boolean
}

export interface BranchUpdate {
  name?: string
  location?: string
  is_active?: boolean
}

// Menu types
export interface Menu {
  id: number
  branch_id: number
  name_ar: string
  name_en: string
  is_published: boolean
  version: number
  created_at: string
  updated_at: string
}

export interface MenuCreate {
  branch_id: number
  name_ar: string
  name_en: string
  is_published?: boolean
}

export interface MenuUpdate {
  name_ar?: string
  name_en?: string
  is_published?: boolean
}

// Category types
export interface Category {
  id: number
  menu_id: number
  name_ar: string
  name_en: string
  description_ar?: string
  description_en?: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CategoryCreate {
  menu_id: number
  name_ar: string
  name_en: string
  description_ar?: string
  description_en?: string
  display_order?: number
  is_active?: boolean
}

export interface CategoryUpdate {
  name_ar?: string
  name_en?: string
  description_ar?: string
  description_en?: string
  display_order?: number
  is_active?: boolean
}

// Item types
export interface Item {
  id: number
  category_id: number
  name_ar: string
  name_en: string
  description_ar?: string
  description_en?: string
  base_price: number
  is_active: boolean
  image_url?: string
  display_order: number
  created_at: string
  updated_at: string
}

export interface ItemCreate {
  category_id: number
  name_ar: string
  name_en: string
  description_ar?: string
  description_en?: string
  base_price: number
  is_active?: boolean
  image_url?: string
  display_order?: number
}

export interface ItemUpdate {
  name_ar?: string
  name_en?: string
  description_ar?: string
  description_en?: string
  base_price?: number
  is_active?: boolean
  image_url?: string
  display_order?: number
}

// Variant types
export type VariantType = 'size' | 'style' | 'temperature' | 'custom'

export interface Variant {
  id: number
  item_id: number
  name_ar: string
  name_en: string
  variant_type: VariantType
  price_modifier: number
  is_default: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface VariantCreate {
  item_id: number
  name_ar: string
  name_en: string
  variant_type: VariantType
  price_modifier?: number
  is_default?: boolean
  is_active?: boolean
}

export interface VariantUpdate {
  name_ar?: string
  name_en?: string
  variant_type?: VariantType
  price_modifier?: number
  is_default?: boolean
  is_active?: boolean
}

// AddOn types
export interface AddOn {
  id: number
  item_id: number
  name_ar: string
  name_en: string
  price: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AddOnCreate {
  item_id: number
  name_ar: string
  name_en: string
  price: number
  is_active?: boolean
}

export interface AddOnUpdate {
  name_ar?: string
  name_en?: string
  price?: number
  is_active?: boolean
}

// Keyword types
export interface Keyword {
  id: number
  item_id: number
  keyword_ar: string
  keyword_en: string
  created_at: string
}

export interface KeywordCreate {
  item_id: number
  keyword_ar: string
  keyword_en: string
}

// Complex response types
export interface ItemWithDetails extends Item {
  variants: Variant[]
  addons: AddOn[]
}

export interface CategoryWithItems extends Category {
  items: Item[]
}

export interface CategoryWithFullItems extends Category {
  items: ItemWithDetails[]
}

export interface MenuWithCategories extends Menu {
  categories: Category[]
}

export interface FullMenuResponse extends Menu {
  categories: CategoryWithFullItems[]
}

// Validation types
export interface MenuValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

// Health check types
export enum ServiceStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
}

export interface HealthCheckResponse {
  status: ServiceStatus
  message?: string
  latency_ms?: number
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}
