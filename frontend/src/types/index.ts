export interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  long_description?: string;
  price: string;
  sale_price?: string;
  inventory: number;
  active: boolean;
  featured: boolean;
  sku?: string;
  created_at: string;
  updated_at: string;
  categories?: ProductCategory[];
  images?: ProductImage[];
  variants?: ProductVariant[];
  effective_price?: string;
  is_on_sale?: boolean;
  is_in_stock?: boolean;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  active: boolean;
}

export interface ProductImage {
  id: number;
  product_id: number;
  path: string;
  alt_text?: string;
  sort_order: number;
  is_primary: boolean;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  type: string;
  price_modifier: string;
  inventory?: number;
  active: boolean;
}

export interface GalleryItem {
  id: number;
  title: string;
  description?: string;
  category?: string;
  image_path: string;
  featured: boolean;
  sort_order: number;
}

export interface Order {
  id: number;
  order_number: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  shipping_address?: string;
  city?: string;
  state?: string;
  zip?: string;
  status: string;
  subtotal: string;
  tax: string;
  shipping: string;
  total: string;
  paid_at?: string;
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id?: number;
  product_variant_id?: number;
  product_name: string;
  variant_name?: string;
  quantity: number;
  price_at_purchase: string;
  subtotal: string;
}

export interface QuoteRequest {
  id: number;
  name: string;
  email: string;
  phone?: string;
  project_type?: string;
  description: string;
  budget_range?: string;
  timeline?: string;
  reference_files?: string[];
  status: string;
  admin_notes?: string;
  responded_at?: string;
  created_at: string;
}

export interface SiteContent {
  id: number;
  key: string;
  value: string;
  type: string;
  group?: string;
  description?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
