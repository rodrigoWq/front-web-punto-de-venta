<script>
import Factura from '@/models/Factura';
import Producto from '@/models/Producto';
import FacturaService from '@/services/FacturaServiceMock';

export default {
  name: 'FacturaView',
  props: ['facturaData'], // Receives facturaData as a prop
  data() {
    return {
      factura: new Factura(this.facturaData || {}), // Initialize with facturaData if available
      productoData: {
        codigo: '',
        descripcion: '',
        cantidad: 0,
        valorUnitario: 0,
        tipoImpuesto: 'exenta',
      },
      facturas: [] // Stores the list of facturas
    };
  },
  methods: {
    agregarProducto() {
      const producto = new Producto(this.productoData);
      this.factura.agregarProducto(producto);
      this.limpiarCamposProducto();
    },
    limpiarCamposProducto() {
      this.productoData = { codigo: '', descripcion: '', cantidad: 0, valorUnitario: 0, tipoImpuesto: 'exenta' };
    },
    async guardarFactura() {
      try {
        this.facturas = await FacturaService.guardarFactura(this.factura);
        alert('Factura guardada correctamente');
        this.factura = new Factura(); // Reset the factura after saving
      } catch (error) {
        console.error('Error al guardar la factura:', error);
      }
    },
    cargarFacturaDesdeProps() {
      console.log(this.facturaData)
      if (this.facturaData) {
        this.factura = new Factura(this.facturaData);
        this.factura.calcularTotales(); // Calculate totals after assigning products
        console.log("Factura cargada desde facturaData prop:", this.factura);
      } else {
        console.warn("No se recibieron datos de factura en facturaData prop.");
      }
    }
  },
  watch: {
    facturaData: {
      immediate: true, // Run on first render
      handler() {
        this.cargarFacturaDesdeProps();
      }
    }
  },
  mounted() {
    this.cargarFacturaDesdeProps(); // Run on component mount
  }
};
</script>
