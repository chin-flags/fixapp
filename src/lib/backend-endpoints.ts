const EXTERNAL_BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

function getAppOrigin() {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export function getBackendProxyBaseUrl() {
  if (typeof window !== "undefined") {
    return "/api/backend";
  }

  return `${getAppOrigin()}/api/backend`;
}

export function buildBackendProxyUrl(path: string) {
  return `${getBackendProxyBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildExternalBackendUrl(path: string) {
  return `${EXTERNAL_BACKEND_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export { EXTERNAL_BACKEND_URL };
