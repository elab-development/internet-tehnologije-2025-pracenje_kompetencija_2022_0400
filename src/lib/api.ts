
type Json = Record<string, any>;

function getTokenFromStorage(): string | null {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

export async function apiFetch<T = any>(
  url: string,
  init: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: T | null; errorText: string | null }> {
  const headers = new Headers(init.headers);

  // Ako šaljemo JSON body, postavi Content-Type ako nije već setovan
  if (init.body && !headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Ako ima token u localStorage, šaljemo ga (ne škodi ako backend ignoriše)
  const token = typeof window !== "undefined" ? getTokenFromStorage() : null;
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...init,
    headers,
    // BITNO: šalje cookie za session auth
    credentials: "include",
  });

  const status = res.status;
  const ok = res.ok;

  // pokušaj JSON, fallback na text
  let data: any = null;
  let errorText: string | null = null;

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    const t = await res.text();
    if (!ok) errorText = t || null;
  }

  if (!ok && !errorText && data && typeof data === "object") {
    errorText = (data.message as string) || (data.error as string) || "Unauthorized";
  }

  return { ok, status, data, errorText };
}