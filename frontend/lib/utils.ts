import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(" ");
}

// Validar RUT Chileno (Algoritmo Módulo 11)
export function validarRut(rut: string): boolean {
  if (!rut || typeof rut !== "string") return false;
  
  // Limpiar puntos y guiones
  const rutLimpio = rut.replace(/[^0-9kK]/g, "");
  if (rutLimpio.length < 2) return false;

  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1).toLowerCase();

  let suma = 0;
  let multiplicador = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const dvEsperado = 11 - (suma % 11);
  let dvCalc = dvEsperado === 11 ? "0" : dvEsperado === 10 ? "k" : dvEsperado.toString();

  return dv === dvCalc;
}

// Separar el RUT en cuerpo y dv para enviar de manera exacta a Oracle
export function desagregarRut(rut: string): { cuerpo: string; dv: string } {
  const rutLimpio = rut.replace(/[^0-9kK]/g, "");
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1).toUpperCase();
  return { cuerpo, dv };
}