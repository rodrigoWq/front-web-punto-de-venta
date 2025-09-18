<template>
  <div>
    <div v-if="loading" class="status">
      Preparando impresión...
    </div>
    <div v-else-if="error" class="status error">
      {{ error }}
    </div>
    <div v-else class="print-wrapper" :class="[`size-${paperSize}`]">
    <section class="ticket" v-if="mode === 'ticket'">
      <header class="header">
        <div class="mode-badge">TICKET</div>
        <img v-if="empresa.logo" :src="empresa.logo" alt="logo" class="logo" />
        <h1 class="biz-name">{{ empresa.nombre }}</h1>
        <p class="biz-lines">
          <span v-if="empresa.ruc">RUC: {{ empresa.ruc }}</span>
          <span v-if="empresa.direccion">{{ empresa.direccion }}</span>
          <span v-if="empresa.telefono">Tel: {{ empresa.telefono }}</span>
        </p>
      </header>

      <div class="meta">
        <div class="row"><span>Comprobante</span><span>{{ compNumero }}</span></div>
        <div class="row"><span>Fecha</span><span>{{ fechaHora }}</span></div>
        <div class="row" v-if="caja"><span>Caja</span><span>{{ caja }}</span></div>
        <div class="row" v-if="cajero"><span>Cajero</span><span>{{ cajero }}</span></div>
  <!-- En ticket se minimiza información de cliente para rapidez -->
      </div>

      <div class="divider"></div>

      <section class="lines">
        <div class="line head">
          <span class="col desc">Descripción</span>
          <span class="col qty">Cant</span>
          <span class="col price">Precio</span>
          <span class="col amt">Importe</span>
        </div>
        <div class="line" v-for="(it, idx) in items" :key="idx">
          <div class="col desc">
            <div class="text">{{ it.descripcion }}</div>
            <div class="muted" v-if="it.nota">{{ it.nota }}</div>
          </div>
          <span class="col qty">{{ fmt(it.cantidad) }}</span>
          <span class="col price">{{ money(it.precioUnit) }}</span>
          <span class="col amt">{{ money(it.importe) }}</span>
        </div>
      </section>

      <div class="divider"></div>

      <section class="totals">
        <div class="row" v-if="totales.subtotal !== totales.total"><span>Subtotal</span><span>{{ money(totales.subtotal) }}</span></div>
        <div class="row" v-if="totales.descuento"><span>Descuento</span><span>-{{ money(totales.descuento) }}</span></div>
        <div class="row" v-if="totales.impuesto"><span>Impuesto</span><span>{{ money(totales.impuesto) }}</span></div>
        <div class="row total"><span>Total</span><span>{{ money(totales.total) }}</span></div>
      </section>

      <section class="pagos" v-if="pagos && pagos.length">
        <div class="row title">Pagos</div>
        <div class="row" v-for="(p, i) in pagos" :key="i">
          <span>{{ p.medio }}</span><span>{{ money(p.monto) }}</span>
        </div>
        <div class="row" v-if="recibido"><span>Recibido</span><span>{{ money(recibido) }}</span></div>
        <div class="row" v-if="vuelto"><span>Vuelto</span><span>{{ money(vuelto) }}</span></div>
      </section>

      <footer class="footer">
        <p class="center">{{ footerMsg }}</p>
      </footer>
    </section>

    <section class="factura" v-else>
      <header class="header">
        <img v-if="empresa.logo" :src="empresa.logo" alt="logo" class="logo" />
        <div class="header-grid">
          <div>
            <h1 class="biz-name">{{ empresa.nombre }}</h1>
            <p class="biz-lines">
              <span v-if="empresa.ruc">RUC: {{ empresa.ruc }}</span>
              <span v-if="empresa.direccion">{{ empresa.direccion }}</span>
              <span v-if="empresa.telefono">Tel: {{ empresa.telefono }}</span>
            </p>
          </div>
          <div class="box">
            <div class="row"><span>FACTURA</span></div>
            <div class="row"><span>Nro</span><span>{{ compNumero }}</span></div>
            <div class="row"><span>Fecha</span><span>{{ fechaHora }}</span></div>
            <div class="row" v-if="condicion"><span>Condición</span><span>{{ condicion }}</span></div>
          </div>
        </div>
      </header>

      <section class="cliente">
        <div class="row"><span>Cliente</span><span>{{ cliente.nombre }}</span></div>
        <div class="row"><span>Doc</span><span>{{ cliente.doc }}</span></div>
        <div class="row" v-if="cliente.direccion"><span>Dirección</span><span>{{ cliente.direccion }}</span></div>
      </section>

      <section class="lines lines-invoice">
        <div class="line head">
          <span class="col code">Cod</span>
          <span class="col desc">Descripción</span>
          <span class="col qty">Cant</span>
          <span class="col price">Precio</span>
          <span class="col amt">Importe</span>
        </div>
        <div class="line" v-for="(it, idx) in items" :key="idx">
          <span class="col code">{{ it.codigo || '-' }}</span>
          <span class="col desc">{{ it.descripcion }}</span>
          <span class="col qty">{{ fmt(it.cantidad) }}</span>
          <span class="col price">{{ money(it.precioUnit) }}</span>
          <span class="col amt">{{ money(it.importe) }}</span>
        </div>
      </section>

      <section class="totals">
        <div class="row" v-if="totales.subtotal !== totales.total"><span>Subtotal</span><span>{{ money(totales.subtotal) }}</span></div>
        <div class="row" v-if="totales.descuento"><span>Descuento</span><span>-{{ money(totales.descuento) }}</span></div>
        <div class="row" v-if="totales.iva5"><span>IVA 5%</span><span>{{ money(totales.iva5) }}</span></div>
        <div class="row" v-if="totales.iva10"><span>IVA 10%</span><span>{{ money(totales.iva10) }}</span></div>
        <div class="row total"><span>Total</span><span>{{ money(totales.total) }}</span></div>
      </section>

      <footer class="footer">
        <p class="center small">{{ footerMsg }}</p>
      </footer>
    </section>
    </div>
  </div>
</template>

<script>
import apiService from '@/services/apiService'

export default {
  name: 'FacturaPrint',
  data() {
    return {
      loading: true,
      error: null,
      // Configuración
      paperSize: '80', // '58' | '80'
  mode: 'factura', // 'ticket' | 'factura' (por defecto factura)
      footerMsg: 'Gracias por su compra',
      // Datos
      empresa: { nombre: 'Mi Negocio', ruc: '8000000-0', direccion: 'Dirección', telefono: '', logo: '' },
      compNumero: '-',
      fechaHora: '-',
      condicion: '-',
      caja: '',
      cajero: '',
      cliente: { nombre: '', doc: '', direccion: '' },
      items: [],
      totales: { subtotal: 0, descuento: 0, impuesto: 0, iva5: 0, iva10: 0, total: 0 },
      pagos: [],
      recibido: 0,
      vuelto: 0
    }
  },
  created() {
    this.load()
  },
  methods: {
    async load() {
      try {
        // Si viene el comprobante embebido en la URL, úsalo
        const q = this.$route.query?.data
  // Leer modo y tamaño desde query (?mode=ticket|factura&size=58|80)
  const qMode = (this.$route.query?.mode || '').toString().toLowerCase()
  const qSize = (this.$route.query?.size || '').toString()
  if (qMode === 'ticket' || qMode === 'factura') this.mode = qMode
  if (qSize === '58' || qSize === '80') this.paperSize = qSize
        let data = null
        if (q) {
          try {
            data = JSON.parse(decodeURIComponent(q))
          } catch (err) {
            console.warn('No se pudo parsear data de la query', err)
          }
        }
        if (!data) {
          const id = this.$route.params.id
          // Solo backend
          data = await this.obtenerFacturaDesdeBackend(id)
        }
        if (!data) {
          this.error = 'Comprobante no encontrado'
          this.loading = false
          return
        }
        this.mapFactura(data)
        this.$nextTick(() => {
          window.print()
          // Opcional: cerrar después de imprimir en nueva pestaña
          // window.close()
        })
      } catch (e) {
        this.error = 'Error al preparar impresión'
      } finally {
        this.loading = false
      }
    },
    async obtenerFacturaDesdeBackend(id) {
      try {
        if (!id) return null
        const { data } = await apiService.get(`${process.env.VUE_APP_API_BASE_URL}/api/purchases/invoices/${id}`)
        // La API usada en Factura.vue devuelve { cabecera, detalles }
        if (data && (data.cabecera || data.detalles)) {
          return data
        }
        return null
      } catch (err) {
        console.warn('No se pudo obtener desde backend', err)
        return null
      }
    },
    mapFactura(f) {
      // Soporta dos formatos: objeto Factura (mock) o payload API { cabecera, detalles }
      const isApiPayload = f && f.cabecera && f.detalles
      if (isApiPayload) {
        const cab = f.cabecera
        const det = Array.isArray(f.detalles) ? f.detalles : []
        this.compNumero = cab.nro_comprobante || '-'
        this.fechaHora = cab.fecha_emision ? new Date(cab.fecha_emision).toLocaleString() : new Date().toLocaleString()
        this.condicion = (cab.credito_contado || 'CONTADO').toLowerCase()
        // Cliente si estuviera
        this.cliente.nombre = cab.nombre_razon_social || ''
        this.cliente.doc = cab.nro_documento || ''
        this.cliente.direccion = cab.direccion || ''
        // Empresa (placeholder)
        this.empresa = {
          nombre: 'Mi Negocio',
          ruc: '8000000-0',
          direccion: 'Dirección',
          telefono: '000-000',
          logo: ''
        }
        // Items
        this.items = det.map(p => ({
          codigo: p.codigo_barras || p.codigo_producto,
          descripcion: p.descripcion,
          cantidad: Number(p.cantidad) || 0,
          precioUnit: Number(p.precio_unitario_neto ?? p.precio_unitario_bruto ?? 0),
          importe: (Number(p.cantidad) || 0) * (Number(p.precio_unitario_neto ?? p.precio_unitario_bruto ?? 0))
        }))
        const subtotal = this.items.reduce((a, b) => a + b.importe, 0)
        const iva5 = cab.iva_detalle?.['iva_5.00'] ? Number(cab.iva_detalle['iva_5.00']) : 0
        const iva10 = cab.iva_detalle?.['iva_10.00'] ? Number(cab.iva_detalle['iva_10.00']) : 0
        const impuesto = iva5 + iva10
        const total = Number(cab.total_iva_incluido ?? subtotal)
        this.totales = { subtotal, descuento: 0, impuesto, iva5, iva10, total }
        this.pagos = []
        this.recibido = 0
        this.vuelto = 0
      } else {
  // Si no es el formato esperado del backend, marcamos error
  this.error = 'Formato de datos no soportado'
      }
    },
    money(n) {
      const num = Math.ceil(Number(n || 0))
      return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    },
    fmt(n) {
      const num = Math.ceil(Number(n || 0))
      return num.toLocaleString()
    }
  }
}
</script>

<style scoped>
.print-wrapper {
  margin: 0 auto;
  padding: 8px;
  color: #000;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.size-58 { width: 58mm; }
.size-80 { width: 80mm; }

.header { text-align: center; }
.logo { max-width: 160px; max-height: 80px; object-fit: contain; margin: 0 auto 6px; display: block; }
.biz-name { font-size: 14px; margin: 0; font-weight: 700; }
.biz-lines { display: flex; flex-direction: column; gap: 2px; font-size: 11px; margin: 4px 0 0; }
.mode-badge { display: inline-block; border: 1px solid #000; padding: 2px 8px; font-size: 11px; font-weight: 700; margin-bottom: 6px; }

.meta { font-size: 11px; margin-top: 6px; }
.meta .row { display: flex; justify-content: space-between; gap: 8px; }
.divider { border-top: 1px dashed #000; margin: 6px 0; }

.lines { font-size: 11px; }
.lines .line { display: grid; grid-template-columns: 1fr auto auto auto; gap: 6px; align-items: start; padding: 2px 0; }
.lines .line.head { font-weight: 600; border-bottom: 1px solid #000; }
.lines .col.desc .text { word-break: break-word; }
.lines .col.qty, .lines .col.price, .lines .col.amt { text-align: right; min-width: 48px; }
.lines .col.code { min-width: 40px; }
.muted { color: #666; font-size: 10px; }

.totals { font-size: 12px; margin-top: 6px; }
.totals .row { display: flex; justify-content: space-between; gap: 8px; }
.totals .row.total { font-weight: 700; font-size: 13px; border-top: 1px solid #000; margin-top: 4px; padding-top: 4px; }
.ticket .totals .row.total { font-size: 15px; }

.pagos { font-size: 11px; margin-top: 6px; }
.pagos .row { display: flex; justify-content: space-between; }
.pagos .row.title { font-weight: 600; }

.footer { margin-top: 8px; }
.footer .center { text-align: center; font-size: 11px; }
.footer .small { font-size: 10px; }

/* Factura layout tweaks */
.header-grid { display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: start; }
.box { border: 1px solid #000; padding: 6px; font-size: 11px; }
.cliente { font-size: 11px; margin: 6px 0; border: 1px solid #000; padding: 6px; }
.lines-invoice .line { grid-template-columns: 48px 1fr 48px 72px 80px; }

@media print {
  :host, .print-wrapper { margin: 0; }
  @page { size: auto; margin: 4mm; }
  body { background: #fff; }
}
</style>
