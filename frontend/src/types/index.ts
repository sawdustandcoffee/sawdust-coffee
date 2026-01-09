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
  products_count?: number;
  products?: Product[];
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
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  stripe_session_id?: string;
  stripe_payment_intent?: string;
  tracking_number?: string;
  admin_notes?: string;
  subtotal: string;
  tax: string;
  shipping: string;
  total: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  is_paid?: boolean;
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
  product?: Product;
  variant?: ProductVariant;
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
  status: 'new' | 'reviewed' | 'quoted' | 'accepted' | 'declined' | 'completed';
  admin_notes?: string;
  quoted_price?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SiteContent {
  id: number;
  key: string;
  value: string;
  type: 'text' | 'html' | 'json' | 'boolean' | 'integer' | 'float';
  group?: string;
  description?: string;
  decoded_value?: any;
  created_at?: string;
  updated_at?: string;
}

export interface ContactFormSubmission {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'new' | 'read' | 'responded' | 'archived';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
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
