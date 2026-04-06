export interface IniciarPagoParams {
  monto: number;
  descripcion: string;
  transaccionId: number;
  returnUrl: string;
}

export interface IniciarPagoResult {
  urlPago: string;
  tokenPasarela: string;
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
