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

  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const prodBackend = 'https://dr-vinish-backend.onrender.com';

  // Handle relative backend upload paths
  if (typeof url === 'string' && (url.startsWith('/uploads/') || url.startsWith('uploads/'))) {
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    const baseUrl = isLocal ? 'http://localhost:5000' : prodBackend;
    return `${baseUrl}${cleanPath}`;
  }

  // Handle full URLs that contain localhost:5000 or 127.0.0.1:5000 stored in database
  if (typeof url === 'string' && (url.includes('localhost:5000') || url.includes('127.0.0.1:5000'))) {
    if (!isLocal) {
      // In production Vercel, replace localhost:5000 with deployed Render backend domain
      const cleanPath = url.replace(/^https?:\/\/(localhost|127\.0\.0\.1):5000/, '');
      const pathWithSlash = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
      return `${prodBackend}${pathWithSlash}`;
    }
    return url;
  }

  // Handle any other http:// URLs: convert to https:// in production to prevent mixed content
  if (typeof url === 'string' && url.startsWith('http://')) {
    if (!isLocal) {
      return url.replace('http://', 'https://');
    }
  }

  return url;
};
