import { createApp } from 'vue';
import { createPinia } from 'pinia'
import App from './App.vue';
import router from './router'; // Importa el router
import { useNotificationStore } from '@/stores/notifications'
import { useConfirmStore } from '@/stores/confirm'
//import { useCashboxStore } from '@/stores/cashbox'

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


const notificationStore = useNotificationStore(pinia)
const confirmStore = useConfirmStore(pinia)

const buildAlertOptions = (message, maybeOptions) => {
	let options = maybeOptions

	if (typeof options === 'string') {
		options = { type: options }
	} else if (typeof options === 'number') {
		options = { duration: options }
	}

	if (message && typeof message === 'object' && !Array.isArray(message)) {
		options = { ...message, ...options }
		message = options.message ?? options.text ?? ''
	}

	return {
		message: message == null ? '' : String(message),
		...(options || {})
	}
}

const customAlert = (message, options) => {
	const payload = buildAlertOptions(message, options)
	notificationStore.notify(payload)
}

customAlert.success = (message, options) => customAlert(message, { ...options, type: 'success' })
customAlert.error = (message, options) => customAlert(message, { ...options, type: 'error' })
customAlert.warning = (message, options) => customAlert(message, { ...options, type: 'warning' })
customAlert.info = (message, options) => customAlert(message, { ...options, type: 'info' })

window.alert = customAlert
app.config.globalProperties.$alert = customAlert

const customConfirm = (message, options) => confirmStore.request(message, options)

window.confirm = customConfirm
app.config.globalProperties.$confirm = customConfirm


//const cashboxStore = useCashboxStore()
//await cashboxStore.fetchCurrentOpen()



app.mount('#app');
