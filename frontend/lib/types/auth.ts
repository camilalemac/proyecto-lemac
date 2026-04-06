/**
 * Contratos alineados con ms-auth (`/api/v1/auth/*`).
 * Ver `ms-auth/src/api/components/auth/auth.controller.ts` y `auth.service.ts`.
 */

export type LoginRequestBody = {
  email: string;
  password: string;
};

/** Respuesta del microservicio: `{ success: true, data: AuthTokens }` */
export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthLoginSuccess = {
  success: true;
  data: AuthTokens;
};

export type AuthErrorBody = {
  success: false;
  message: string;
};

/** Payload JWT emitido en login (campos relevantes para el frontend) */
export type AuthAccessTokenPayload = {
  userId: number;
  colegioId: number;
  role: string;
  nombre: string;
};

/** Respuesta del Route Handler Next `/api/login` (BFF) */
export type BffLoginSuccess = {
  success: true;
  data: {
    accessToken: string;
    refreshToken?: string;
    user: {
      id: number | undefined;
      colegioId?: number;
      role: string;
      nombre: string;
    };
  };
};

export type RegisterRequestBody = {
  colegioId: number;
  rutCuerpo: string;
  rutDv: string;
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
};
