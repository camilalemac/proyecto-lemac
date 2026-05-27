import crypto from "crypto";

const getHmacSecret = (): string => {
  const secret = process.env.HMAC_SECRET;
  if (!secret) {
    throw new Error("[ms-identity] HMAC_SECRET no está definida en las variables de entorno");
  }
  return secret;
};

/**
 * Genera un hash determinístico usando HMAC-SHA256.
 * Siempre produce el mismo resultado para el mismo input,
 * lo que permite búsquedas en BD sin exponer el valor real.
 * Usado para: RUT_CUERPO, RUT_DV
 */
export const hmacHash = (value: string): string => {
  const secret = getHmacSecret();
  return crypto.createHmac("sha256", secret).update(value.toLowerCase().trim()).digest("hex");
};

/**
 * Verifica si un valor coincide con su hash HMAC almacenado.
 */
export const verifyHmac = (plaintext: string, storedHash: string): boolean => {
  const computedHash = hmacHash(plaintext);
  return crypto.timingSafeEqual(Buffer.from(computedHash, "hex"), Buffer.from(storedHash, "hex"));
};
