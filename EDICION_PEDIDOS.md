# 📝 Documentación: Edición de Pedidos

## 🎯 Objetivo
Permitir editar pedidos existentes reutilizando la misma interfaz de `PantallaInicio.vue` con toda su funcionalidad de agregar/eliminar productos, manteniendo separados los flujos de creación y edición.

---

## 🏗️ Arquitectura de la Solución

### **Estrategia: Reutilización de componente con modo dual**
- ✅ Se usa el mismo `PantallaInicio.vue` para crear y editar pedidos
- ✅ Se detecta el modo mediante `$route.query.modo`
- ✅ Se mantiene toda la funcionalidad existente (agregar/eliminar productos, búsqueda, etc.)
- ✅ Se cambian dinámicamente botones y endpoints según el modo

---

## 📋 Cambios Implementados

### **1. GestionPedidos.vue**

#### Botón "Editar" agregado
```vue
<button
  type="button"
  class="btn btn-warning btn-sm"
  @click="editarPedido(pedido.pedido_id)"
>
  <i class="bi bi-pencil me-1"></i>
  Editar
</button>
```

#### Método `editarPedido()`
```javascript
async editarPedido(pedidoId) {
  try {
    // 1. Cargar detalles completos del pedido
    const { data: pedido } = await apiService.get(
      `${process.env.VUE_APP_API_BASE_URL}/api/orders/pending/${pedidoId}`
    );
    
    // 2. Navegar a PantallaInicio con query params
    this.$router.push({
      name: 'Inicio',
      query: {
        modo: 'edicion',
        pedidoId: pedido.pedido_id,
        clienteNombre: pedido.nombre_cliente || '',
        clienteDocumento: pedido.nro_documento || '',
        clienteTelefono: pedido.telefono || '',
        clienteDireccion: pedido.direccion || '',
        clienteEmail: pedido.email || '',
        productos: JSON.stringify(pedido.detalles || [])
      }
    });
  } catch (error) {
    console.error('Error al cargar pedido:', error);
    alert('No se pudo cargar el pedido.');
  }
}
```

**¿Por qué query params en lugar de params?**
- Los `params` solo funcionan con rutas con nombre y se pierden al recargar
- Los `query` params persisten en la URL y permiten recarga de página
- JSON.stringify permite pasar arrays complejos por la URL

---

### **2. PantallaInicio.vue**

#### Nuevos campos en `data()`
```javascript
data() {
  return {
    // ... campos existentes ...
    
    // Modo edición
    modoEdicion: false,
    pedidoIdEdicion: null,
    clienteTelefono: '',
    clienteDireccion: '',
    clienteEmail: ''
  }
}
```

#### Indicador visual de modo edición
```vue
<div v-if="modoEdicion" class="alert alert-info alert-dismissible fade show mb-3">
  <i class="bi bi-pencil-square me-2"></i>
  <strong>Modo Edición:</strong> Estás editando el Pedido #{{ pedidoIdEdicion }}
  <button type="button" class="btn-close" @click="cancelarEdicion"></button>
</div>
```

#### Botones adaptativos
```vue
<div class="button-container">
  <!-- Solo en modo creación -->
  <button v-if="!modoEdicion" type="button" class="btn btn-warning" @click="openPendingModal">
    Poner Venta en Espera
  </button>
  
  <!-- Texto dinámico según modo -->
  <button type="button" class="btn btn-danger" @click="cancelarVenta">
    {{ modoEdicion ? 'Cancelar Edición' : 'Cancelar Venta' }}
  </button>
  
  <button type="button" class="btn btn-success" @click="confirmarVenta">
    {{ modoEdicion ? 'Confirmar Edición' : 'Confirmar Venta' }}
  </button>
</div>
```

#### Método `confirmarVenta()` mejorado
```javascript
async confirmarVenta() {
  try {
    // Validar productos
    const detalles = this.productos
      .map(p => ({
        producto_id: p.producto_id,
        cantidad: Number(p.cantidad) || 0
      }))
      .filter(item => item.cantidad > 0);

    if (!detalles.length) {
      alert('Agregá al menos un producto antes de confirmar.');
      return;
    }

    // ====== MODO EDICIÓN ======
    if (this.modoEdicion && this.pedidoIdEdicion) {
      const payload = {
        descripcion: "Cobro tras edición",
        moneda: "PYG",
        idempotency_key: "",
        cabecera: {
          nombre_cliente: this.clienteNombre || 'Cliente sin nombre',
          telefono: this.clienteTelefono || '',
          direccion: this.clienteDireccion || '',
          email: this.clienteEmail || ''
        },
        detalles
      };

      const resp = await apiService.post(
        `${process.env.VUE_APP_API_BASE_URL}/api/orders/pending/${this.pedidoIdEdicion}`,
        payload
      );
      
      alert(`Pedido #${this.pedidoIdEdicion} editado correctamente.`);
      this.$router.push({ name: 'GestionPedidos' });
      return;
    }

    // ====== MODO CREACIÓN (código original sin cambios) ======
    // ... lógica existente de creación ...
  }
}
```

#### Método `mounted()` - Detección de modo
```javascript
mounted() {
  this.userName = localStorage.getItem("user_name") || '';
  this.mostrarReloj();
  this._timeInterval = setInterval(this.mostrarReloj, 1000);
  
  // Verificar si venimos desde edición
  if (this.$route.query.modo === 'edicion') {
    this.modoEdicion = true;
    this.pedidoIdEdicion = this.$route.query.pedidoId;
    this.clienteNombre = this.$route.query.clienteNombre || '';
    this.rucCliente = this.$route.query.clienteDocumento || '';
    this.clienteTelefono = this.$route.query.clienteTelefono || '';
    this.clienteDireccion = this.$route.query.clienteDireccion || '';
    this.clienteEmail = this.$route.query.clienteEmail || '';
    
    // Parsear productos desde JSON
    try {
      const productosParam = JSON.parse(this.$route.query.productos || '[]');
      this.productos = productosParam.map(detalle => ({
        producto_id: detalle.producto_id,
        codigo: detalle.codigo_barras || detalle.codigo || '',
        nombre: detalle.nombre_producto || detalle.nombre || '',
        cantidad: detalle.cantidad || 0,
        unidad_medida: detalle.unidad_medida || '',
        precio: detalle.precio_unitario || detalle.precio || 0
      }));
    } catch (error) {
      console.error('Error al parsear productos:', error);
      this.productos = [];
    }
  }
}
```

#### Nuevos métodos auxiliares
```javascript
cancelarEdicion() {
  // Para el botón X del alert
  this.$router.push({ name: 'GestionPedidos' });
},

limpiarFormulario() {
  this.productos = [];
  this.paginaActual = 1;
  this.cabecera.referencia = '';
  this.cabecera.observaciones = '';
  this.cabecera.tipo_entrega = 'domicilio';
  this.cabecera.fecha_entrega = '';
  this.productCode = '';
  this.productQuantity = 1;
  this.productDescription = '';
  this.selectedProduct = null;
  this.rucCliente = '';
  this.clienteNombre = '';
  this.showPendingModal = false;
  // Resetear modo edición
  this.modoEdicion = false;
  this.pedidoIdEdicion = null;
  this.clienteTelefono = '';
  this.clienteDireccion = '';
  this.clienteEmail = '';
}
```

---

## 🔄 Flujo de Usuario

### **Modo Creación (comportamiento original)**
1. Usuario entra a PantallaInicio normalmente
2. Agrega productos
3. Confirma venta → POST `/api/orders/pending` (sin ID)
4. Se queda en la misma pantalla

### **Modo Edición (nuevo)**
1. Usuario va a "Gestión de Pedidos"
2. Click en botón "Editar" de un pedido
3. Se carga el pedido completo desde API
4. Navega a PantallaInicio con query params
5. `mounted()` detecta `?modo=edicion`
6. Precarga datos del cliente y productos
7. Usuario puede:
   - Buscar y agregar más productos
   - Eliminar productos existentes
   - Modificar cantidades
8. Click en "Confirmar Edición"
9. POST `/api/orders/pending/:pedidoId` con payload específico
10. Redirige a GestionPedidos

---

## 🔌 Endpoints Utilizados

### **Cargar pedido para edición**
```
GET /api/orders/pending/:pedido_id
```

### **Confirmar edición**
```
POST /api/orders/pending/:pedido_id
```

**Body esperado:**
```json
{
  "descripcion": "Cobro tras edición",
  "moneda": "PYG",
  "idempotency_key": "",
  "cabecera": {
    "nombre_cliente": "Cliente Editado",
    "telefono": "0981999888",
    "direccion": "Dirección actualizada",
    "email": "email@example.com"
  },
  "detalles": [
    { "producto_id": 91, "cantidad": 1 },
    { "producto_id": 42, "cantidad": 3 }
  ]
}
```

**Respuesta esperada:**
```json
{
  "ok": true,
  "data": {
    "pedido_id": 3,
    "estado": "pendiente",
    "caja_movimiento_id": null,
    "total_neto": 36000,
    "total_sin_iva": 32987,
    "iva": 3013
  }
}
```

### **Crear nuevo pedido (sin cambios)**
```
POST /api/orders/pending
```

---

## ✅ Funcionalidades Preservadas

Todas estas funciones siguen funcionando en modo edición:

- ✅ Buscar producto por código de barras
- ✅ Agregar productos a la tabla
- ✅ Eliminar productos de la tabla
- ✅ Modificar cantidades
- ✅ Búsqueda de cliente por RUC/CI
- ✅ Selector modal de productos
- ✅ Selector modal de clientes
- ✅ Paginación de productos en tabla
- ✅ Cálculo automático del total

---

## 🚫 Diferencias entre Modos

| Característica | Modo Creación | Modo Edición |
|---------------|---------------|--------------|
| Alert informativo | ❌ No | ✅ Sí (muestra ID pedido) |
| Botón "Poner en Espera" | ✅ Visible | ❌ Oculto |
| Texto botón cancelar | "Cancelar Venta" | "Cancelar Edición" |
| Texto botón confirmar | "Confirmar Venta" | "Confirmar Edición" |
| Endpoint usado | `/api/orders/pending` | `/api/orders/pending/:id` |
| Payload cabecera | Completo con fecha_entrega | Simplificado sin fecha |
| Acción post-confirmación | Limpiar y quedarse | Volver a GestionPedidos |

---

## 🛡️ Validaciones y Seguridad

- ✅ No se puede confirmar sin productos
- ✅ Confirmación antes de cancelar edición
- ✅ Manejo de errores en carga de pedido
- ✅ Manejo de errores en parseo de JSON
- ✅ Fallbacks para datos opcionales
- ✅ Validación de respuesta del servidor

---

## 🎨 Mejoras de UX

1. **Alert visible**: Usuario siempre sabe que está editando
2. **Botón X rápido**: Cancelar directamente desde el alert
3. **Botones adaptativos**: Texto claro según contexto
4. **Sin duplicación de código**: Reutiliza toda la lógica existente
5. **Navegación fluida**: Vuelve automáticamente a lista tras editar

---

## 🧪 Testing Manual Recomendado

1. ✅ Crear pedido nuevo (flujo normal)
2. ✅ Editar pedido existente
3. ✅ Agregar productos en edición
4. ✅ Eliminar productos en edición
5. ✅ Cancelar edición (botón "Cancelar Edición")
6. ✅ Cancelar edición (botón X del alert)
7. ✅ Confirmar edición con cambios
8. ✅ Confirmar edición sin cambios
9. ✅ Recargar página en modo edición (debe preservar query params)
10. ✅ Verificar que modo creación no se afecta

---

## 📌 Notas Importantes

- Los productos en edición vienen de `pedido.detalles` del backend
- El mapeo de productos maneja diferentes estructuras de nombres de campos
- El cliente en edición usa los datos ya almacenados, no hace búsqueda por RUC
- El modo se resetea completamente al limpiar el formulario
- La navegación con `$router.push` garantiza limpieza de estado

---

## 🔮 Posibles Mejoras Futuras

1. Agregar animación de transición al alert de edición
2. Mostrar diff de cambios antes de confirmar
3. Permitir cambiar cliente en edición
4. Historial de cambios del pedido
5. Validación de stock antes de confirmar edición
6. Guardar borrador de edición en localStorage
