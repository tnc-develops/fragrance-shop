export const PUBLIC_API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

function baseUrl() {
  if (typeof window === "undefined") {
    return (process.env.API_INTERNAL_URL || PUBLIC_API_URL).replace(/\/$/, "");
  }
  return PUBLIC_API_URL;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  token?: string | null;
  /** Seconds to cache GET responses on the Next.js server. */
  revalidate?: number;
}

export async function api<T>(path: string, { body, token, revalidate, headers, ...init }: RequestOptions = {}): Promise<T> {
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const res = await fetch(`${baseUrl()}/api${path}`, {
    ...init,
    headers: {
      ...(body !== undefined && !isForm ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
    ...(revalidate !== undefined ? { next: { revalidate } } : {}),
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data.error ?? `Request failed (${res.status})`, data.details);
  }
  return data as T;
}

export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (Array.isArray(err.details) && err.details.length) {
      return err.details.map((d: { message?: string }) => d.message).filter(Boolean).join(". ");
    }
    return err.message;
  }
  if (err instanceof TypeError) return "We couldn't reach the store. Please check your connection and try again.";
  return "Something went wrong. Please try again.";
}
