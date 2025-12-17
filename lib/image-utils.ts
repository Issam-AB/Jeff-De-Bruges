/**
 * Utility functions for handling product images
 */

/**
 * Normalize image path for Next.js
 * Handles paths with spaces and special characters
 */
export function normalizeImagePath(path: string): string {
  if (!path) return '/Logo_bf.png';
  
  // If already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Ensure it starts with /
  let normalized = path.startsWith('/') ? path : `/${path}`;
  
  // For local images with spaces, we need to encode the filename part only
  // Next.js serves files from public/ directly, but spaces need encoding
  if (normalized.includes('Photos avec prix')) {
    // Split path and encode only the filename (last part)
    const parts = normalized.split('/');
    const filename = parts[parts.length - 1];
    if (filename && filename.includes(' ')) {
      parts[parts.length - 1] = encodeURIComponent(filename);
      normalized = parts.join('/');
    }
  }
  
  return normalized;
}

/**
 * Get image URL that works with Next.js Image component
 */
export function getImageUrl(path: string): string {
  return normalizeImagePath(path);
}

