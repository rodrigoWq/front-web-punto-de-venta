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
    path: '/factura',
    name: 'Factura',
    component: FacturaView
  },
  {
    path: '/nota-de-remision',
    name: 'NotaDeRemision',
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
