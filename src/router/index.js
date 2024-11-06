import { createRouter, createWebHistory } from 'vue-router';
import ClientesView from '../components/ClientesView.vue';
import PantallaInicio from '../components/PantallaInicio.vue'; // Importa la nueva pantalla

const routes = [
  {
    path: '/',
    name: 'Inicio',
    component: PantallaInicio
  },
  {
    path: '/clientes',
    name: 'Clientes',
    component: ClientesView
  },
  // Aquí puedes agregar más rutas para otras pantallas en el futuro
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
