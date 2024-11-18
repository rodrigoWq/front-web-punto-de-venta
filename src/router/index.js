import { createRouter, createWebHistory } from 'vue-router';
import ClientesView from '../components/ClientesView.vue';
import PantallaInicio from '../components/PantallaInicio.vue'; 
import LoginView from '../components/LoginView.vue';
import FacturaView from '../components/Factura.vue'; // Importa la pantalla de Factura
import NotaDeRemision from '../components/NotaDeRemision.vue'; // Importa la pantalla de NotaDeRemision
import ListarComprobantes from '../components/ListarComprobantes.vue'; // Importa la pantalla de ListarComprobantes
import UserManagement from '../components/UserManagement.vue'; // Importa UserManagement

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginView
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
    component: FacturaView,
    props: route => ({ datosParaFactura: route.params.datosParaFactura }),
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
