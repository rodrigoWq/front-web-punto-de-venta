import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Importa el router

// Importa Bootstrap CSS y JS aquí
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Importa Bootstrap Icons aquí
import '@fortawesome/fontawesome-free/css/all.min.css';


// Inicializa la aplicación
const app = createApp(App);

app.use(router);
app.mount('#app');
