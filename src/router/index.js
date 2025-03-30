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
import ProductosView from '@/views/ProductosView.vue'; // Importa la pantalla de Productos

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
    path: '/productos',
    name: 'Productos',
    component: ProductosView
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
    path: '/user-management',
    name: 'UserManagement',
    component: UserManagement
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
