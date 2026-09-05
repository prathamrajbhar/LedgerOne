/**
 * Get the application base URL from environment variables.
 * Prioritizes NEXTAUTH_URL, AUTH_URL, or VERCEL_URL.
 */
export function getAppBaseUrl(): string {
  const envUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, "")}`;
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");
  }

  throw new Error(
    "Application URL is not configured. Please define NEXTAUTH_URL or AUTH_URL in your environment variables (.env)."
  );
}
