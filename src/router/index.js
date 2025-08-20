import { createRouter, createWebHistory } from 'vue-router';
import ClientesView from '../views/ClientesView.vue'; // Importa la vista de Clientes
import PantallaInicio from '../views/PantallaInicio.vue'; 
import LoginView from '../views/LoginView.vue';
import FacturaView from '../views/Factura.vue'; // Importa la pantalla de Factura
import NotaDeRemision from '../views/NotaDeRemision.vue'; // Importa la pantalla de NotaDeRemision
import ListarComprobantes from '../views/ListarComprobantes.vue'; // Importa la pantalla de ListarComprobantes
import UserManagement from '../views/UserManagement.vue'; // Importa UserManagement
import RegistrarProveedor from '@/components/RegistrarProveedorModal.vue';
import RegistrarProductoModal from '@/components/RegistrarProductoModal.vue';
import ProductosPrecioView from '@/views/Inventario/ProductosPrecioView.vue'; // Importa la pantalla de Productos
import ProveedoresView from '@/views/ProveedoresView.vue';
import PermisosView from '@/views/PermisosView.vue';
import ListarComprobantesNT from '@/views/ListarComprobantesNT.vue';
import RolesView from '@/views/RolesView.vue';
import CajaView from '@/views/CajaView.vue'; // Importa la pantalla de Caja
import CerrarCajaView from '@/views/CerrarCajaView.vue'
import CobroFacturaVentaView from '@/views/CobroFacturaVentaView.vue';
import CobroVentaRapidaView from '@/views/CobroVentaRapidaView.vue';
import IngresoVariosView from '@/views/IngresoVariosView.vue';
import EgresoVariosView from '@/views/EgresoVariosView.vue';
import MovimientosCajaView from '@/views/MovimientosCajaView.vue';
import CobroClienteCredito from '@/views/CobroClienteCredito.vue';
import PagoFactura from '@/views/PagoFactura.vue';
import InventoryLayout from '@/views/InventoryLayout.vue';
import DashboardView   from '@/views/Inventario/DashboardView.vue'
import ProductosView from '@/views/Inventario/ProductosView.vue';
import MovimientosView from '@/views/Inventario/MovimientosView.vue';
import LotesView from '@/views/Inventario/LotesView.vue';
import ControlInventarioView from '@/views/Inventario/ControlInventarioView.vue';
import DepositosView from '@/views/Inventario/DepositosView.vue';
import CategoriaView from '@/views/Inventario/CategoriaView.vue';
import UnidadMedidaView from '@/views/Inventario/UnidadMedidaView.vue';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/registrar-proveedor',
    name: 'RegistrarProveedor',
    component: RegistrarProveedor,
  },
  {
    path: '/permisos',
    name: 'Permisos',
    component: PermisosView,
  },
  {
    path: '/inventario',
    component: InventoryLayout,
    children: [
      {path: '',             name: 'InvDashboard',    component: DashboardView },
      {path: 'productos',    name: 'InvProductos',    component: ProductosView },
      {path: 'movimientos',  name: 'InvMovimientos',  component: MovimientosView },
      {path: 'lotes',        name: 'InvLotes',        component: LotesView },
      {path: 'control',      name: 'InvControl',      component: ControlInventarioView },
      {path: 'depositos',    name: 'InvDepositos',    component: DepositosView },
  {path: 'productos-precio', name: 'ProductosPrecio', component: ProductosPrecioView },
  {path: 'categorias',   name: 'InvCategorias',   component: CategoriaView }
  ,{path: 'unidades-medida', name: 'InvUnidadesMedida', component: UnidadMedidaView }
    ]
  },
  {
    path: '/roles',
    name: 'Roles',
    component: RolesView
  },
  {
    path: '/cobro-cliente-credito',
    name: 'CobroClienteCredito',
    component: CobroClienteCredito
  },
  {
    path: '/pago-factura',
    name: 'PagoFactura',
    component: PagoFactura
  },
  {
    path: '/ingreso-varios',
    name: 'IngresoVarios',  
    component: IngresoVariosView
  },
  {
    path: '/egreso-varios',
    name: 'EgresoVarios',
    component: EgresoVariosView
  },
  {
    path: '/proveedores/editar/:id',
    name: 'EditarProveedor',
    component: RegistrarProveedor,
    props: true
  },
  {
    path: '/productos',
    name: 'Productos',
    component: ProductosPrecioView
  },
  {
    path: '/registrar-producto',
    name: 'RegistrarProducto',
    component: RegistrarProductoModal,

  },
  {
    path: '/pantalla-inicio',
    name: 'Inicio',
    component: PantallaInicio
  },
  {
    path: '/cobro-factura-venta',
    name: 'CobroFacturaVenta',
    component: CobroFacturaVentaView

  },
  {
    path: '/cobro-venta-rapida',
    name: 'CobroVentaRapida',
    component: CobroVentaRapidaView
  },
  {
    path: '/clientes',
    name: 'Clientes',
    component: ClientesView
  },
  {
    path: '/factura/:id(\\d+)', // Ruta para ver una factura existente
    name: 'Factura',
    component: FacturaView
  },
  {
    path: '/factura', // Ruta para registrar una nueva factura
    name: 'RegistrarFactura',
    component: () => import('@/views/Factura.vue'), // Ruta al componente Factura
    props: route => ({
      datosParaFactura: route.query.datosParaFactura ? JSON.parse(decodeURIComponent(route.query.datosParaFactura)) : null,
    }),
  },
  {
    path: '/nota-de-remision/:id',
    name: 'NotaDeRemision',
    component: NotaDeRemision,
    props: true
  },
  {
    path: '/nota-de-remision', // Ruta para registrar una nueva nota de remisión
    name: 'RegistrarNotaDeRemision',
    component: NotaDeRemision
  },
  {
    path: '/listar-comprobantes',
    name: 'ListarComprobantes',
    component: ListarComprobantes
  },
  {
    path: '/listar-notas-remision',
    name: 'ListarNotasDeRemision',
    component: ListarComprobantesNT
  },
  {
    path: '/caja',
    name: 'Caja', 
    component: CajaView
  },
  {
    path: '/movimientos-caja',
    name: 'MovimientosCaja',
    component: MovimientosCajaView
  },
  {
    path: '/cerrar-caja',
    name: 'CerrarCaja',
    component: CerrarCajaView
  },
  {
    path: '/user-management',
    name: 'UserManagement',
    component: UserManagement
  },
  {
    path: '/listar-proveedores',
    name: 'ListarProveedores',
    component: ProveedoresView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
