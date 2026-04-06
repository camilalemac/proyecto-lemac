/**
 * ms-geo devuelve `{ success: true, data: ... }`.
 * Ajusta campos si tus tablas difieren.
 */

export type Region = {
  regionId: number;
  nombre: string;
  abreviatura?: string;
  capital?: string;
};

export type GeoListSuccess<T> = {
  success: true;
  data: T;
};
