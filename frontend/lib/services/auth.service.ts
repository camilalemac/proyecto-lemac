import type { BffLoginSuccess, LoginRequestBody } from "@/lib/types/auth";

/**
 * Login vía Route Handler (cookie httpOnly + mismo origen).
 */
export async function loginViaBff(body: LoginRequestBody): Promise<BffLoginSuccess> {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  const parsed = text ? (JSON.parse(text) as unknown) : {};

  if (!res.ok) {
    const message =
      typeof parsed === "object" && parsed !== null && "error" in parsed
        ? String((parsed as { error?: string }).error)
        : "Error al iniciar sesión";
    throw new Error(message);
  }

  return parsed as BffLoginSuccess;
}
