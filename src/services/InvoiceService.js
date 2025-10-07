// Autoresponse service for invoice sale detail.
// Replace getSaleDetailMock with a real API call once the endpoint exists.

export async function getSaleDetailMock(movimientoId) {
  // movimientoId can be used for logging or future logic; currently ignored
  void movimientoId
  // Simulate a small delay to mimic network behavior
  await new Promise((r) => setTimeout(r, 250))
  return {
    id_venta: 6,
    nro_comprobante: 6,
    nro_factura: '001-002-0000006',
    cabecera: {
      nro_documento: '5057016-1',
      tipo_documento: 'RUC',
      credito_contado: 'CONTADO',
      tipo_moneda: 'PYG',
      fecha_emision: '2025-07-18T02:09:55.905Z',
      anho: 2025,
      estado: 'vigente',
      nombre_razon_social: 'Emilio Saldivar',
      direccion: 'Calle Sin nombre 112 entre nanawa y teniente candia',
      telefono_celular: '0971722168',
      timbrado_id: 1,
      establecimiento_id: 1,
      punto_id: 1,
      codigo_establecimiento: '001',
      codigo_punto: '002',
      total_iva: 656.7164179104477,
      total_iva_incluido: 134000,
      total_sin_iva: 133343.28358208956,
    },
    detalles: [
      {
        producto_id: 22,
        cantidad: 3,
        unidad_medida: 'g',
        codigo_producto: '786',
        codigo_barras: '786',
        descripcion: 'des',
        precio_unitario_bruto: 44000,
        descuento: 0,
        precio_unitario_neto: 43781.09452736319,
        iva: 656.7164179104477,
        nombre_producto: 'prueba',
        tipo_iva_id: 2,
        porcentaje_iva: '5.00',
      },
      {
        producto_id: 32,
        cantidad: 2,
        unidad_medida: 'paquete',
        codigo_producto: '4422',
        codigo_barras: '4422',
        descripcion: 'des',
        precio_unitario_bruto: 1000,
        descuento: 0,
        precio_unitario_neto: 1000,
        iva: 0,
        nombre_producto: 'Prueba001',
        tipo_iva_id: 3,
        porcentaje_iva: '0.00',
      },
    ],
  }
}

// Example future replacement:
// import apiService from '@/services/apiService'
// export async function getSaleDetail(movimientoId) {
//   const { data } = await apiService.get(`/api/sales/${movimientoId}`)
//   return data
// }
