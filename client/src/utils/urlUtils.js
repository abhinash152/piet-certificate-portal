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

/**
 * Returns the direct download API URL for a certificate.
 * Forces an attachment download with the original filename from the server.
 */
export function getCertificateDownloadUrl(certId) {
  if (!certId) return '';
  const baseUrl = import.meta.env.VITE_API_URL || '';
  return `${baseUrl}/api/certificates/download/${certId}`;
}

/**
 * Downloads a file directly via Blob to ensure proper browser downloading
 * even on cross-origin setups (Vercel frontend -> Render backend).
 */
export async function downloadCertificateFile(certId, filename) {
  try {
    const url = getCertificateDownloadUrl(certId);
    const res = await fetch(url);
    if (!res.ok) throw new Error('File download failed');
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || 'certificate';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
    return true;
  } catch (err) {
    console.error('Download error:', err);
    // Fallback: direct window navigate
    window.open(getCertificateDownloadUrl(certId), '_blank');
    return false;
  }
}
