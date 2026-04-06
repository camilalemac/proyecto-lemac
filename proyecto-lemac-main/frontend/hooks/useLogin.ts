"use client";

import { useCallback, useState } from "react";
import type { LoginRequestBody } from "@/lib/types/auth";
import { loginViaBff } from "@/lib/services/auth.service";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (body: LoginRequestBody) => {
    setLoading(true);
    setError(null);
    try {
      return await loginViaBff(body);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error al iniciar sesión";
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { login, loading, error, clearError: () => setError(null) };
}
