/**
 * Get the full URL for a storage path
 */
export function getStorageUrl(path: string): string {
  if (!path) return '';

  // If path is already a full URL, return it as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Build the storage URL
  const apiUrl = import.meta.env.VITE_API_URL;
  const baseUrl = apiUrl ? apiUrl.replace('/api', '') : window.location.origin;

  // Remove leading slash from path if present
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;

  return `${baseUrl}/storage/${cleanPath}`;
}

/**
 * Get the image URL from a product
 */
export function getProductImageUrl(product: any, index: number = 0): string {
  if (!product) return '';

  // Try images array first
  if (product.images && product.images.length > index && product.images[index]?.path) {
    return getStorageUrl(product.images[index].path);
  }

  // Try primary_image
  if (product.primary_image?.path) {
    return getStorageUrl(product.primary_image.path);
  }

  return '';
}
