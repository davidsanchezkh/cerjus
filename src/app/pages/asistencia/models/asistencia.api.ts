// Lo que devuelve su backend (nombres ci_*)
export interface ApiAsistencia {
    as_ID: number;
    as_us_ID: number;
    as_fecha_local: Date;
    as_tz: string;
    as_estado: number;
    as_creadoEn: Date;

    ma_ID: bigint;
    ma_as_ID: number;
    ma_tipo: number;
    ma_fecha: Date;
    ma_lat: number;
    ma_lng: number;
    ma_ip: string;
    ma_accuracy: number;
    ma_nota: string;
}
export type ApiAsistenciaListaCompleta = ApiAsistencia

export type ApiAsistenciaListaSimple = Pick<ApiAsistenciaListaCompleta,
 'ma_as_ID'|'ma_ID'|'ma_tipo' | 'ma_fecha'
>
export type ApiAsistenciaDetalleCompleta = ApiAsistencia

export type ApiAsistenciaDetalleSimple= Pick<ApiAsistenciaDetalleCompleta,
 'as_ID' |'as_us_ID'| 'ma_ID' | 'ma_tipo' | 'ma_fecha' |
 'ma_lat' | 'ma_lng' | 'ma_ip' | 'ma_accuracy' | 'ma_nota'
>

export interface ApiAsistenciaPageSimple {
  items: ApiAsistenciaListaSimple[];
  total: number;
  page: number;
  pageSize: number;
}