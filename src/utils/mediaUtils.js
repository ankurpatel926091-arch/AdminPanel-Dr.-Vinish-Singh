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

  // Handle relative backend upload paths
  if (typeof url === 'string' && (url.startsWith('/uploads/') || url.startsWith('uploads/'))) {
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const baseUrl = isLocal ? 'http://localhost:5000' : 'https://dr-vinish-backend.onrender.com';
    return `${baseUrl}${cleanPath}`;
  }

  // Keep http:// intact for local dev (localhost / 127.0.0.1) to avoid ERR_SSL_PROTOCOL_ERROR
  if (typeof url === 'string' && url.startsWith('http://')) {
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      return url;
    }
    return url.replace('http://', 'https://');
  }

  return url;
};
