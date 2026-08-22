/**
 * Convert insecure http:// URLs to https:// to prevent Mixed Content warnings
 * and fix broken image loading on HTTPS hosts (like Vercel).
 */
export const getSecureMediaUrl = (url) => {
  if (!url) return '';

  // Base64 or Blob preview URLs remain intact
  if (typeof url === 'string' && (url.startsWith('data:') || url.startsWith('blob:'))) {
    return url;
  }

  // Convert http:// to https://
  if (typeof url === 'string' && url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }

  // Handle relative backend upload paths
  if (typeof url === 'string' && (url.startsWith('/uploads/') || url.startsWith('uploads/'))) {
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `https://dr-vinish-backend.onrender.com${cleanPath}`;
  }

  return url;
};
