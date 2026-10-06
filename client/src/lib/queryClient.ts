import { QueryClient, QueryFunction } from "@tanstack/react-query";

// ── CSRF token store ───────────────────────────────────────────────────────────
// Set by useAuth once the user payload (which includes csrfToken) is fetched.
// Attached as X-CSRF-Token on every state-changing request.
let _csrfToken: string | null = null;

export function setCsrfToken(token: string | null) {
  _csrfToken = token;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  method: string,
  data?: unknown | undefined,
): Promise<Response> {
  const isReadOnly = ["GET", "HEAD"].includes(method.toUpperCase());
  const headers: Record<string, string> = {};

  if (data) headers["Content-Type"] = "application/json";

  // Attach CSRF token to all state-changing requests
  if (!isReadOnly && !_csrfToken) {
    const authResponse = await fetch("/api/auth/user", { credentials: "include", cache: "no-store" });
    await throwIfResNotOk(authResponse);
    const user = await authResponse.json();
    setCsrfToken(user?.csrfToken ?? null);
    if (!_csrfToken) throw new Error("Please sign in before making changes.");
  }
  if (!isReadOnly && _csrfToken) {
    headers["X-CSRF-Token"] = _csrfToken;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const [path, filters] = queryKey;
    const params = new URLSearchParams();
    if (filters && typeof filters === "object") {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
      }
    }
    const url = typeof filters === "object"
      ? `${path}${params.size ? `?${params}` : ""}`
      : queryKey.join("/");
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    const result = await res.json();
    if (path === "/api/auth/user") setCsrfToken(result?.csrfToken ?? null);
    return result;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
