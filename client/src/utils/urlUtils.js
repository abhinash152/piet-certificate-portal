/**
 * Generates an absolute or relative URL for uploaded certificates,
 * dynamically supporting both local dev and production deployments (e.g. Vercel + Render).
 */
export function getFileUrl(filePath) {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  return baseUrl ? `${baseUrl}/${cleanPath}` : `/${cleanPath}`;
}
