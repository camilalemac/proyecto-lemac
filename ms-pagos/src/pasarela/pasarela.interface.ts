export interface IniciarPagoParams {
  monto: number;
  descripcion: string;
  returnUrl: string;
  // NUEVO: Necesitamos saber qué se está pagando para enviarlo en la metadata
  cobrosIds: number[];
  colegioId: number;
}

export interface IniciarPagoResult {
  urlPago: string;
  tokenPasarela: string; // En MercadoPago, este será el preferenceId
}

export interface ConfirmarPagoParams {
  tokenPasarela: string;
}

export interface ConfirmarPagoResult {
  aprobado: boolean;
  codigoRespuesta: string;
  mensaje: string;
  montoPagado: number;
}

export interface IPasarelaPago {
  iniciarPago(params: IniciarPagoParams): Promise<IniciarPagoResult>;
  confirmarPago(params: ConfirmarPagoParams): Promise<ConfirmarPagoResult>;
}
