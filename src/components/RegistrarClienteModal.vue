<template>
  <div
    class="modal fade"
    ref="modalEl"
    tabindex="-1"
    data-bs-backdrop="static"
    data-bs-keyboard="false"
  >
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">
            <i :class="editMode ? 'fas fa-user-edit me-2' : 'fas fa-user-plus me-2'"></i>
            {{ editMode ? 'Editar Cliente' : 'Registrar Cliente' }}
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="close"></button>
        </div>
        <div class="modal-body" style="max-height: 75vh; overflow-y: auto;">
          <form @submit.prevent="submit">
            <div class="container-fluid">
              
              <!-- Sección: Información Básica -->
              <div class="section-header mb-3">
                <h6 class="text-primary border-bottom pb-2 mb-3">
                  <i class="fas fa-id-card me-2"></i>Información Básica
                </h6>
              </div>
              
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold">Nombre Completo <span class="text-danger">*</span></label>
                  <input type="text" v-model="form.nombre_completo" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Nro. Documento <span class="text-danger">*</span></label>
                  <input type="text" v-model="form.nro_documento" class="form-control" required />
                </div>
              </div>
              
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold">RUC <span class="text-danger">*</span></label>
                  <input type="text" v-model="form.ruc" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Nombre Fantasía</label>
                  <input type="text" v-model="form.nombre_fantasia" class="form-control" />
                </div>
              </div>

              <!-- Sección: Identificación Detallada -->
              <div class="section-header mb-3 mt-4">
                <h6 class="text-primary border-bottom pb-2 mb-3">
                  <i class="fas fa-address-card me-2"></i>Identificación Detallada
                </h6>
              </div>

              <div class="row mb-3">
                <div class="col-md-4">
                  <label class="form-label fw-bold">Tipo de Persona</label>
                  <select v-model="form.identificacion.tipo_persona" class="form-select">
                    <option value="fisica">Persona Física</option>
                    <option value="juridica">Persona Jurídica</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-bold">Tipo de Documento</label>
                  <select v-model="form.identificacion.tipo_documento_id" class="form-select">
                    <option value="1">Cédula de Identidad</option>
                    <option value="2">RUC</option>
                    <option value="3">Pasaporte</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-bold">Género</label>
                  <select v-model="form.identificacion.genero_id" class="form-select">
                    <option value="1">Masculino</option>
                    <option value="2">Femenino</option>
                    <option value="3">Otro</option>
                  </select>
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-md-4">
                  <label class="form-label fw-bold">Nombres</label>
                  <input type="text" v-model="form.identificacion.nombres" class="form-control" />
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-bold">Apellidos</label>
                  <input type="text" v-model="form.identificacion.apellidos" class="form-control" />
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-bold">Fecha de Nacimiento</label>
                  <input type="date" v-model="form.identificacion.fecha_nacimiento" class="form-control" />
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold">Razón Social</label>
                  <input type="text" v-model="form.identificacion.razon_social" class="form-control" />
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-bold">Estado de Relación</label>
                  <select v-model="form.identificacion.estado_relacion_id" class="form-select">
                    <option value="1">Soltero/a</option>
                    <option value="2">Casado/a</option>
                    <option value="3">Divorciado/a</option>
                    <option value="4">Viudo/a</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-bold">Etapa Cliente</label>
                  <select v-model="form.identificacion.etapa_cliente_id" class="form-select">
                    <option value="1">Prospecto</option>
                    <option value="2">Cliente Nuevo</option>
                    <option value="3">Cliente Regular</option>
                    <option value="4">Cliente VIP</option>
                  </select>
                </div>
              </div>

              <!-- Sección: Información de Contacto -->
              <div class="section-header mb-3 mt-4">
                <h6 class="text-primary border-bottom pb-2 mb-3">
                  <i class="fas fa-phone me-2"></i>Información de Contacto
                </h6>
              </div>

              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold">Teléfono Principal</label>
                  <input type="tel" v-model="form.telefono" class="form-control" />
                  <small class="text-muted">Teléfono principal para contacto</small>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Email Principal</label>
                  <input type="email" v-model="form.email" class="form-control" />
                  <small class="text-muted">Email principal para comunicaciones</small>
                </div>
              </div>

              <!-- Teléfonos Adicionales -->
              <div class="row mb-3">
                <div class="col-12">
                  <label class="form-label fw-bold">Teléfonos Adicionales</label>
                  <div class="border rounded p-3 bg-light">
                    <div v-for="(telefono, index) in form.contacto.telefonos" :key="index" class="row mb-2">
                      <div class="col-md-4">
                        <select v-model="telefono.tipo_contacto_id" class="form-select form-select-sm">
                          <option value="1">Teléfono Fijo</option>
                          <option value="2">Celular</option>
                          <option value="3">WhatsApp</option>
                        </select>
                      </div>
                      <div class="col-md-6">
                        <input type="tel" v-model="telefono.valor" class="form-control form-control-sm" placeholder="Número de teléfono" />
                      </div>
                      <div class="col-md-2">
                        <button type="button" class="btn btn-outline-danger btn-sm" @click="removeTelefono(index)">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    <button type="button" class="btn btn-outline-primary btn-sm" @click="addTelefono">
                      <i class="fas fa-plus me-1"></i>Agregar Teléfono
                    </button>
                  </div>
                </div>
              </div>

              <!-- Emails Adicionales -->
              <div class="row mb-3">
                <div class="col-12">
                  <label class="form-label fw-bold">Emails Adicionales</label>
                  <div class="border rounded p-3 bg-light">
                    <div v-for="(email, index) in form.contacto.emails" :key="index" class="row mb-2">
                      <div class="col-md-4">
                        <select v-model="email.tipo_contacto_id" class="form-select form-select-sm">
                          <option value="3">Email Personal</option>
                          <option value="4">Email Trabajo</option>
                          <option value="5">Email Facturación</option>
                        </select>
                      </div>
                      <div class="col-md-6">
                        <input type="email" v-model="email.valor" class="form-control form-control-sm" placeholder="Dirección de email" />
                      </div>
                      <div class="col-md-2">
                        <button type="button" class="btn btn-outline-danger btn-sm" @click="removeEmail(index)">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    <button type="button" class="btn btn-outline-primary btn-sm" @click="addEmail">
                      <i class="fas fa-plus me-1"></i>Agregar Email
                    </button>
                  </div>
                </div>
              </div>

              <!-- Redes Sociales -->
              <div class="row mb-3">
                <div class="col-12">
                  <label class="form-label fw-bold">Redes Sociales</label>
                  <div class="border rounded p-3 bg-light">
                    <div v-for="(red, index) in form.contacto.redes" :key="index" class="row mb-2">
                      <div class="col-md-3">
                        <select v-model="red.red_social_id" class="form-select form-select-sm">
                          <option value="1">Twitter</option>
                          <option value="2">Facebook</option>
                          <option value="3">Instagram</option>
                          <option value="4">LinkedIn</option>
                          <option value="5">TikTok</option>
                        </select>
                      </div>
                      <div class="col-md-3">
                        <input type="text" v-model="red.handle" class="form-control form-control-sm" placeholder="@usuario" />
                      </div>
                      <div class="col-md-4">
                        <input type="url" v-model="red.url" class="form-control form-control-sm" placeholder="URL completa" />
                      </div>
                      <div class="col-md-2">
                        <button type="button" class="btn btn-outline-danger btn-sm" @click="removeRed(index)">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    <button type="button" class="btn btn-outline-primary btn-sm" @click="addRed">
                      <i class="fas fa-plus me-1"></i>Agregar Red Social
                    </button>
                  </div>
                </div>
              </div>

              <!-- Sección: Direcciones -->
              <div class="section-header mb-3 mt-4">
                <h6 class="text-primary border-bottom pb-2 mb-3">
                  <i class="fas fa-map-marker-alt me-2"></i>Direcciones
                </h6>
              </div>

              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold">Dirección Principal</label>
                  <input type="text" v-model="form.direccion" class="form-control" />
                  <small class="text-muted">Dirección principal del cliente</small>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Condiciones de Pago</label>
                  <select v-model="form.condiciones_pago" class="form-select">
                    <option value="CONTADO">Contado</option>
                    <option value="CREDITO">Crédito</option>
                  </select>
                </div>
              </div>

              <!-- Direcciones Detalladas -->
              <div class="row mb-3">
                <div class="col-12">
                  <label class="form-label fw-bold">Direcciones Detalladas</label>
                  <div class="border rounded p-3 bg-light">
                    <div v-for="(direccion, index) in form.direcciones" :key="index" class="border rounded p-3 mb-3 bg-white">
                      <div class="row mb-2">
                        <div class="col-md-4">
                          <label class="form-label fw-bold">Tipo de Dirección</label>
                          <select v-model="direccion.tipo_direccion_id" class="form-select form-select-sm">
                            <option value="1">Domicilio</option>
                            <option value="2">Trabajo</option>
                            <option value="3">Comercial</option>
                            <option value="4">Facturación</option>
                          </select>
                        </div>
                        <div class="col-md-4">
                          <label class="form-label fw-bold">País</label>
                          <input type="text" v-model="direccion.pais" class="form-control form-control-sm" placeholder="Paraguay" />
                        </div>
                        <div class="col-md-4">
                          <label class="form-label fw-bold">Departamento</label>
                          <select v-model="direccion.departamento_id" class="form-select form-select-sm">
                            <option value="1">Concepción</option>
                            <option value="2">San Pedro</option>
                            <option value="3">Cordillera</option>
                            <option value="4">Guairá</option>
                            <option value="5">Central</option>
                            <option value="6">Caaguazú</option>
                            <option value="7">Caazapá</option>
                          </select>
                        </div>
                      </div>
                      <div class="row mb-2">
                        <div class="col-md-4">
                          <label class="form-label fw-bold">Ciudad</label>
                          <select v-model="direccion.ciudad_id" class="form-select form-select-sm">
                            <option value="101">Asunción</option>
                            <option value="102">San Lorenzo</option>
                            <option value="103">Lambaré</option>
                            <option value="104">Fernando de la Mora</option>
                            <option value="105">Luque</option>
                          </select>
                        </div>
                        <div class="col-md-4">
                          <label class="form-label fw-bold">Barrio</label>
                          <input type="text" v-model="direccion.barrio" class="form-control form-control-sm" placeholder="Nombre del barrio" />
                        </div>
                        <div class="col-md-4">
                          <label class="form-label fw-bold">Calle Principal</label>
                          <input type="text" v-model="direccion.calle_principal" class="form-control form-control-sm" placeholder="Nombre de la calle" />
                        </div>
                      </div>
                      <div class="row mb-2">
                        <div class="col-md-3">
                          <label class="form-label fw-bold">Número</label>
                          <input type="text" v-model="direccion.numero" class="form-control form-control-sm" placeholder="Nro." />
                        </div>
                        <div class="col-md-5">
                          <label class="form-label fw-bold">Referencia</label>
                          <input type="text" v-model="direccion.referencia" class="form-control form-control-sm" placeholder="Referencias adicionales" />
                        </div>
                        <div class="col-md-2">
                          <label class="form-label fw-bold">Latitud</label>
                          <input type="number" step="0.0001" v-model="direccion.lat" class="form-control form-control-sm" placeholder="-25.3001" />
                        </div>
                        <div class="col-md-2">
                          <label class="form-label fw-bold">Longitud</label>
                          <input type="number" step="0.0001" v-model="direccion.lng" class="form-control form-control-sm" placeholder="-57.6359" />
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-10">
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" v-model="direccion.es_principal" :id="'principal-' + index">
                            <label class="form-check-label" :for="'principal-' + index">
                              Dirección principal
                            </label>
                          </div>
                        </div>
                        <div class="col-md-2 text-end">
                          <button type="button" class="btn btn-outline-danger btn-sm" @click="removeDireccion(index)">
                            <i class="fas fa-trash"></i> Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                    <button type="button" class="btn btn-outline-primary btn-sm" @click="addDireccion">
                      <i class="fas fa-plus me-1"></i>Agregar Dirección
                    </button>
                  </div>
                </div>
              </div>

              <!-- Botones de Acción -->
              <div class="row mt-4">
                <div class="col-12">
                  <div class="d-flex justify-content-end gap-2">
                    <button type="button" class="btn btn-outline-secondary" @click="close">
                      <i class="fas fa-times me-1"></i>Cancelar
                    </button>
                    <button type="submit" class="btn btn-primary">
                      <i :class="editMode ? 'fas fa-edit me-1' : 'fas fa-save me-1'"></i>
                      {{ editMode ? 'Actualizar Cliente' : 'Guardar Cliente' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap';
import apiService from '@/services/apiService.js';

export default {
  name: 'RegistrarClienteModal',
  props: {
    open: { type: Boolean, default: false },
    prefillRuc: { type: String, default: '' },
    prefillDocumento: { type: String, default: '' },
    editMode: { type: Boolean, default: false },
    clienteData: { type: Object, default: () => null }
  },
  emits: ['saved', 'close'],
  data() {
    return {
      bsModal: null,
      form: {
        // Campos originales (obligatorios)
        nombre_completo: '',
        nro_documento: '',
        ruc: '',
        direccion: '',
        telefono: '',
        email: '',
        nombre_fantasia: '',
        condiciones_pago: 'CONTADO',
        
        // Nuevos campos - Identificación
        identificacion: {
          tipo_persona: 'fisica',
          tipo_documento_id: 1,
          nombres: '',
          apellidos: '',
          razon_social: '',
          genero_id: 1,
          fecha_nacimiento: '',
          estado_relacion_id: 1,
          etapa_cliente_id: 1
        },
        
        // Nuevos campos - Contacto
        contacto: {
          telefonos: [],
          emails: [],
          redes: []
        },
        
        // Nuevos campos - Direcciones
        direcciones: []
      }
    };
  },
  watch: {
    open(val) {
      if (val) this.show(); else this.hide();
    }
  },
  methods: {
    show() {
      if (!this.bsModal) {
        this.bsModal = new Modal(this.$refs.modalEl, {
          backdrop: 'static',
          keyboard: false
        });
      }
      
      if (this.editMode && this.clienteData) {
        // Modo edición: precargar datos del cliente
        this.form = {
          // Campos originales (obligatorios) - precargados
          nombre_completo: this.clienteData.nombre_completo || '',
          nro_documento: this.clienteData.nro_documento || '',
          ruc: this.clienteData.ruc || '',
          direccion: this.clienteData.direccion || '',
          telefono: this.clienteData.telefono || '',
          email: this.clienteData.email || '',
          nombre_fantasia: this.clienteData.nombre_fantasia || '',
          condiciones_pago: this.clienteData.condiciones_pago || 'CONTADO',
          
          // Nuevos campos - Identificación (con valores por defecto si no existen)
          identificacion: {
            tipo_persona: this.clienteData.identificacion?.tipo_persona || 'fisica',
            tipo_documento_id: this.clienteData.identificacion?.tipo_documento_id || 1,
            nombres: this.clienteData.identificacion?.nombres || '',
            apellidos: this.clienteData.identificacion?.apellidos || '',
            razon_social: this.clienteData.identificacion?.razon_social || '',
            genero_id: this.clienteData.identificacion?.genero_id || 1,
            fecha_nacimiento: this.clienteData.identificacion?.fecha_nacimiento || '',
            estado_relacion_id: this.clienteData.identificacion?.estado_relacion_id || 1,
            etapa_cliente_id: this.clienteData.identificacion?.etapa_cliente_id || 1
          },
          
          // Nuevos campos - Contacto (con arrays por defecto si no existen)
          contacto: {
            telefonos: this.clienteData.contacto?.telefonos || [],
            emails: this.clienteData.contacto?.emails || [],
            redes: this.clienteData.contacto?.redes || []
          },
          
          // Nuevos campos - Direcciones (con array por defecto si no existe)
          direcciones: this.clienteData.direcciones || []
        };
      } else {
        // Modo creación: formulario vacío con prefill básico
        this.form = {
          // Campos originales (obligatorios)
          nombre_completo: '',
          nro_documento: this.prefillDocumento || this.prefillRuc || '',
          ruc: this.prefillRuc || this.prefillDocumento || '',
          direccion: '',
          telefono: '',
          email: '',
          nombre_fantasia: '',
          condiciones_pago: 'CONTADO',
          
          // Nuevos campos - Identificación
          identificacion: {
            tipo_persona: 'fisica',
            tipo_documento_id: 1,
            nombres: '',
            apellidos: '',
            razon_social: '',
            genero_id: 1,
            fecha_nacimiento: '',
            estado_relacion_id: 1,
            etapa_cliente_id: 1
          },
          
          // Nuevos campos - Contacto
          contacto: {
            telefonos: [],
            emails: [],
            redes: []
          },
          
          // Nuevos campos - Direcciones
          direcciones: []
        };
      }
      
      this.bsModal.show();
    },
    hide() {
      this.bsModal?.hide();
    },
    close() {
      this.hide();
      this.$emit('close');
    },
    async submit() {
      try {
        let response;
        
        if (this.editMode && this.clienteData) {
          // Modo edición: actualizar cliente existente
          const clienteId = this.clienteData.cliente_id || this.clienteData.id;
          
          // Preparar el body solo con los campos básicos requeridos
          const body = {
            nombre_completo: this.form.nombre_completo,
            ci: this.form.nro_documento, // CI usa el valor de nro_documento
            nro_documento: this.form.nro_documento,
            ruc: this.form.ruc,
            direccion: this.form.direccion,
            telefono: this.form.telefono,
            email: this.form.email,
            nombre_fantasia: this.form.nombre_fantasia,
            condiciones_pago: this.form.condiciones_pago
          };
          
          response = await apiService.put(
            `${process.env.VUE_APP_API_BASE_URL}/api/clients/${clienteId}`, 
            body
          );
        } else {
          // Modo creación: crear nuevo cliente (envía todo el form)
          response = await apiService.post(`${process.env.VUE_APP_API_BASE_URL}/api/clients`, this.form);
        }
        
        this.$emit('saved', response.data);
        this.close();
      } catch (e) {
        console.error(`Error al ${this.editMode ? 'actualizar' : 'guardar'} el cliente:`, e);
        alert(`Error al ${this.editMode ? 'actualizar' : 'guardar'} el cliente`);
      }
    },

    // Métodos para manejar teléfonos
    addTelefono() {
      this.form.contacto.telefonos.push({
        contacto_id: null,
        tipo_contacto_id: 1,
        valor: '',
        es_principal: false
      });
    },
    removeTelefono(index) {
      this.form.contacto.telefonos.splice(index, 1);
    },

    // Métodos para manejar emails
    addEmail() {
      this.form.contacto.emails.push({
        contacto_id: null,
        tipo_contacto_id: 3,
        valor: '',
        es_principal: false
      });
    },
    removeEmail(index) {
      this.form.contacto.emails.splice(index, 1);
    },

    // Métodos para manejar redes sociales
    addRed() {
      this.form.contacto.redes.push({
        cliente_red_id: null,
        red_social_id: 1,
        handle: '',
        url: '',
        es_principal: false
      });
    },
    removeRed(index) {
      this.form.contacto.redes.splice(index, 1);
    },

    // Métodos para manejar direcciones
    addDireccion() {
      this.form.direcciones.push({
        direccion_id: null,
        tipo_direccion_id: 1,
        pais: 'Paraguay',
        departamento_id: 5,
        ciudad_id: 101,
        barrio: '',
        calle_principal: '',
        numero: '',
        referencia: '',
        lat: null,
        lng: null,
        es_principal: false
      });
    },
    removeDireccion(index) {
      this.form.direcciones.splice(index, 1);
    }
  },
  mounted() {
    this.bsModal = new Modal(this.$refs.modalEl);
    if (this.open) this.show();
  },
  beforeUnmount() {
    this.bsModal?.hide();
    this.bsModal = null;
  }
};
</script>

<style scoped>
.modal-xl {
  max-width: 1200px;
}

.section-header {
  margin-top: 1.5rem;
}

.section-header:first-of-type {
  margin-top: 0;
}

.section-header h6 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.form-label.fw-bold {
  font-size: 0.9rem;
  color: #333;
}

.text-danger {
  color: #dc3545 !important;
}

.bg-light {
  background-color: #f8f9fa !important;
}

.border {
  border: 1px solid #dee2e6 !important;
}

.rounded {
  border-radius: 0.375rem !important;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.form-control-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.form-select-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.gap-2 {
  gap: 0.5rem !important;
}

.modal-body {
  padding: 1.5rem;
}

.btn-close-white {
  filter: invert(1) grayscale(100%) brightness(200%);
}

/* Mejoras en el scroll */
.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Efectos hover para botones */
.btn:hover {
  transform: translateY(-1px);
  transition: all 0.2s ease-in-out;
}

/* Mejora visual para las secciones */
.bg-white {
  background-color: #ffffff !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .modal-xl {
    max-width: 95%;
    margin: 1rem auto;
  }
  
  .modal-body {
    padding: 1rem;
  }
}
</style>
