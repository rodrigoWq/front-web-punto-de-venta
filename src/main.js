import { createApp } from 'vue';
import { createPinia } from 'pinia'
import App from './App.vue';
import router from './router'; // Importa el router
import { useCashboxStore } from '@/stores/cashbox'

// Importa Bootstrap CSS y JS aquí
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Importa Bootstrap Icons aquí
import '@fortawesome/fontawesome-free/css/all.min.css';


// Inicializa la aplicación
const app = createApp(App);
const pinia = createPinia()
app.use(pinia);
app.use(router);


const cashboxStore = useCashboxStore()
await cashboxStore.fetchCurrentOpen()



app.mount('#app');
