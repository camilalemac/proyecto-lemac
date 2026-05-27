import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "";
const HMAC_SECRET = process.env.HMAC_SECRET || "";
const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

const getEncryptionKey = (): Buffer => {
  if (!ENCRYPTION_KEY) {
    throw new Error("[ms-identity] ENCRYPTION_KEY no está definida en las variables de entorno");
  }
  return Buffer.from(ENCRYPTION_KEY, "hex").subarray(0, KEY_LENGTH);
};

const getHmacSecret = (): string => {
  if (!HMAC_SECRET) {
    throw new Error("[ms-identity] HMAC_SECRET no está definida en las variables de entorno");
  }
  return HMAC_SECRET;
};

/**
 * Encripta un valor usando AES-256-GCM.
 * Retorna un string en formato: iv:authTag:ciphertext (todo en hex)
 * Usado para: EMAIL, NOMBRES, APELLIDOS — campos que necesitan ser leídos por la app.
 */
export const encrypt = (plaintext: string): string => {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
};

/**
 * Desencripta un valor encriptado con AES-256-GCM.
 * Espera el formato: iv:authTag:ciphertext (todo en hex)
 */
export const decrypt = (encryptedValue: string): string => {
  const key = getEncryptionKey();
  const parts = encryptedValue.split(":");

  if (parts.length !== 3) {
    throw new Error("[ms-identity] Formato de valor encriptado inválido");
  }

  const iv = Buffer.from(parts[0], "hex");
  const authTag = Buffer.from(parts[1], "hex").subarray(0, AUTH_TAG_LENGTH);
  const ciphertext = Buffer.from(parts[2], "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString("utf8");
};

/**
 * Genera un hash determinístico usando HMAC-SHA256.
 * Siempre produce el mismo resultado para el mismo input,
 * lo que permite búsquedas en BD sin exponer el valor real.
 * Usado para: RUT_CUERPO, RUT_DV — campos que necesitan búsqueda pero no lectura.
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
