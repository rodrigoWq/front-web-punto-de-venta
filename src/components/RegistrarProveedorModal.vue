<template>
  <div class="modal fade" :class="{ show: showModal }" :style="{ display: showModal ? 'block' : 'none' }" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-xl" role="document">
      <div class="modal-content">
        <div class="modal-header bg-success text-white">
          <h5 class="modal-title">
            <i :class="isEditMode ? 'fas fa-truck-loading me-2' : 'fas fa-plus-circle me-2'"></i>
            {{ isEditMode ? 'Editar Proveedor' : 'Registrar Proveedor' }}
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
        </div>
        <div class="modal-body" style="max-height: 75vh; overflow-y: auto;">
          <form @submit.prevent="handleSave">
            <div class="container-fluid">
              
              <!-- Sección: Información Básica -->
              <div class="section-header mb-3">
                <h6 class="text-success border-bottom pb-2 mb-3">
                  <i class="fas fa-building me-2"></i>Información Básica
                </h6>
              </div>
              
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold">Nombre <span class="text-danger">*</span></label>
                  <input type="text" v-model="providerData.nombre" class="form-control" placeholder="Nombre del proveedor" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Contacto Principal<span class="text-danger">*</span></label>
                  <input type="text" v-model="providerData.contacto_principal" class="form-control" placeholder="Nombre del contacto" />
                </div>
              </div>
              
              <div class="row mb-3">
                <div class="col-md-4">
                  <label class="form-label fw-bold">Nro. Documento<span class="text-danger"></span></label>
                  <input type="text" v-model="providerData.nro_documento" class="form-control" placeholder="Nro. de documento" />
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-bold">RUC<span class="text-danger">*</span></label>
                  <input type="text" v-model="providerData.ruc" class="form-control" placeholder="RUC" />
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-bold">CI<span class="text-danger">*</span></label>
                  <input type="text" v-model="providerData.ci" class="form-control" placeholder="CI" />
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold">Nombre Fantasía</label>
                  <input type="text" v-model="providerData.nombre_fantasia" class="form-control" placeholder="Nombre Fantasía" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Condiciones de Pago</label>
                  <input type="text" v-model="providerData.condiciones_pago" class="form-control" placeholder="Ej: 30 días, Contado" />
                </div>
              </div>

              <!-- Sección: Información Comercial -->
              <div class="section-header mb-3 mt-4">
                <h6 class="text-success border-bottom pb-2 mb-3">
                  <i class="fas fa-handshake me-2"></i>Información Comercial
                </h6>
              </div>

              <div class="row mb-3">
                <div class="col-md-4">
                  <label class="form-label fw-bold">Tipo de Entidad</label>
                  <select v-model="providerData.tipo_entidad" class="form-select">
                    <option value="SIN DATO">Sin especificar</option>
                    <option value="EMPRESA">Empresa</option>
                    <option value="PERSONA_FISICA">Persona Física</option>
                    <option value="COOPERATIVA">Cooperativa</option>
                    <option value="FUNDACION">Fundación</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-bold">Tipo de Proveedor</label>
                  <select v-model="providerData.tipo_proveedor_id" class="form-select">
                    <option value="1">Productos</option>
                    <option value="2">Servicios</option>
                    <option value="3">Mixto</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-bold">Estado de Relación</label>
                  <select v-model="providerData.estado_relacion_id" class="form-select">
                    <option value="1">Activo</option>
                    <option value="2">Inactivo</option>
                    <option value="3">Suspendido</option>
                    <option value="4">En evaluación</option>
                  </select>
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold">Rubro</label>
                  <input type="text" v-model="providerData.rubro" class="form-control" placeholder="Ej: Canasta Familiar y Bebidas" />
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-bold">Años en Mercado</label>
                  <input type="number" v-model="providerData.anios_en_mercado" class="form-control" placeholder="0" min="0" />
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-bold">Riesgo Proveedor</label>
                  <select v-model="providerData.riesgo_proveedor" class="form-select">
                    <option value="SIN DATO">Sin evaluar</option>
                    <option value="BAJO">Bajo</option>
                    <option value="MEDIO">Medio</option>
                    <option value="ALTO">Alto</option>
                  </select>
                </div>
              </div>

              <!-- Sección: Información de Contacto -->
              <div class="section-header mb-3 mt-4">
                <h6 class="text-success border-bottom pb-2 mb-3">
                  <i class="fas fa-phone me-2"></i>Información de Contacto
                </h6>
              </div>

              <div class="row mb-3">
                <div class="col-md-4">
                  <label class="form-label fw-bold">Teléfono Celular <span class="text-danger">*</span></label>
                  <input type="tel" v-model="providerData.telefono_celular" class="form-control" placeholder="Teléfono celular" />
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-bold">Email Principal <span class="text-danger">*</span></label>
                  <input type="email" v-model="providerData.email" class="form-control" placeholder="Email principal" />
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-bold">Dirección Principal<span class="text-danger">*</span></label>
                  <input type="text" v-model="providerData.direccion" class="form-control" placeholder="Dirección" />
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-md-4">
                  <label class="form-label fw-bold">Teléfono Corporativo</label>
                  <input type="tel" v-model="providerData.telefono_corporativo" class="form-control" placeholder="Teléfono corporativo" />
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-bold">Email Corporativo</label>
                  <input type="email" v-model="providerData.email_corporativo" class="form-control" placeholder="Email corporativo" />
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-bold">Sitio Web</label>
                  <input type="url" v-model="providerData.sitio_web" class="form-control" placeholder="https://ejemplo.com" />
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold">WhatsApp Link</label>
                  <input type="url" v-model="providerData.whatsapp_link" class="form-control" placeholder="https://wa.me/595..." />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Estatus Auditoría</label>
                  <select v-model="providerData.estatus_auditoria" class="form-select">
                    <option value="SIN DATO">Sin auditoría</option>
                    <option value="APROBADO">Aprobado</option>
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="RECHAZADO">Rechazado</option>
                  </select>
                </div>
              </div>

              <!-- Contactos Adicionales -->
              <div class="row mb-3">
                <div class="col-12">
                  <label class="form-label fw-bold">Contactos Adicionales</label>
                  <div class="border rounded p-3 bg-light">
                    <div v-for="(contacto, index) in providerData.contacto.contactos" :key="index" class="row mb-2">
                      <div class="col-md-3">
                        <select v-model="contacto.tipo_contacto_id" class="form-select form-select-sm">
                          <option value="1">Teléfono</option>
                          <option value="2">Email</option>
                          <option value="3">Fax</option>
                        </select>
                      </div>
                      <div class="col-md-3">
                        <input type="text" v-model="contacto.valor" class="form-control form-control-sm" placeholder="Valor de contacto" />
                      </div>
                      <div class="col-md-3">
                        <input type="text" v-model="contacto.rol" class="form-control form-control-sm" placeholder="Rol (Ventas, Soporte...)" />
                      </div>
                      <div class="col-md-2">
                        <div class="form-check">
                          <input class="form-check-input" type="checkbox" v-model="contacto.es_principal" :id="'principal-contacto-' + index">
                          <label class="form-check-label text-xs" :for="'principal-contacto-' + index">
                            Principal
                          </label>
                        </div>
                      </div>
                      <div class="col-md-1">
                        <button type="button" class="btn btn-outline-danger btn-sm" @click="removeContacto(index)">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    <button type="button" class="btn btn-outline-success btn-sm" @click="addContacto">
                      <i class="fas fa-plus me-1"></i>Agregar Contacto
                    </button>
                  </div>
                </div>
              </div>

              <!-- Redes Sociales -->
              <div class="row mb-3">
                <div class="col-12">
                  <label class="form-label fw-bold">Redes Sociales</label>
                  <div class="border rounded p-3 bg-light">
                    <div v-for="(red, index) in providerData.contacto.redes" :key="index" class="row mb-2">
                      <div class="col-md-3">
                        <select v-model="red.red_social_id" class="form-select form-select-sm">
                          <option value="1">Facebook</option>
                          <option value="2">Instagram</option>
                          <option value="3">Twitter</option>
                          <option value="4">LinkedIn</option>
                          <option value="5">TikTok</option>
                        </select>
                      </div>
                      <div class="col-md-3">
                        <input type="text" v-model="red.handle" class="form-control form-control-sm" placeholder="@usuario o /empresa" />
                      </div>
                      <div class="col-md-4">
                        <input type="url" v-model="red.url" class="form-control form-control-sm" placeholder="URL completa" />
                      </div>
                      <div class="col-md-1">
                        <div class="form-check">
                          <input class="form-check-input" type="checkbox" v-model="red.es_principal" :id="'principal-red-' + index">
                          <label class="form-check-label text-xs" :for="'principal-red-' + index">
                            Principal
                          </label>
                        </div>
                      </div>
                      <div class="col-md-1">
                        <button type="button" class="btn btn-outline-danger btn-sm" @click="removeRed(index)">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    <button type="button" class="btn btn-outline-success btn-sm" @click="addRed">
                      <i class="fas fa-plus me-1"></i>Agregar Red Social
                    </button>
                  </div>
                </div>
              </div>

              <!-- Sección: Direcciones -->
              <div class="section-header mb-3 mt-4">
                <h6 class="text-success border-bottom pb-2 mb-3">
                  <i class="fas fa-map-marker-alt me-2"></i>Direcciones
                </h6>
              </div>

              <!-- Direcciones Detalladas -->
              <div class="row mb-3">
                <div class="col-12">
                  <label class="form-label fw-bold">Direcciones Detalladas</label>
                  <div class="border rounded p-3 bg-light">
                    <div v-for="(direccion, index) in providerData.direcciones" :key="index" class="border rounded p-3 mb-3 bg-white">
                      <div class="row mb-2">
                        <div class="col-md-4">
                          <label class="form-label fw-bold">Tipo de Dirección</label>
                          <select v-model="direccion.tipo_direccion_id" class="form-select form-select-sm">
                            <option value="1">Comercial</option>
                            <option value="2">Envío</option>
                            <option value="3">Facturación</option>
                            <option value="4">Depósito</option>
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
                            <option value="7">Itapúa</option>
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
                            <option value="150">La Colmena</option>
                            <option value="104">Fernando de la Mora</option>
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
                        <div class="col-md-2">
                          <label class="form-label fw-bold">Número</label>
                          <input type="text" v-model="direccion.numero" class="form-control form-control-sm" placeholder="Nro." />
                        </div>
                        <div class="col-md-2">
                          <label class="form-label fw-bold">Código Postal</label>
                          <input type="text" v-model="direccion.codigo_postal" class="form-control form-control-sm" placeholder="CP" />
                        </div>
                        <div class="col-md-4">
                          <label class="form-label fw-bold">Referencia</label>
                          <input type="text" v-model="direccion.referencia" class="form-control form-control-sm" placeholder="Referencias adicionales" />
                        </div>
                        <div class="col-md-2">
                          <label class="form-label fw-bold">Latitud</label>
                          <input type="number" step="0.0001" v-model="direccion.lat" class="form-control form-control-sm" placeholder="-25.305" />
                        </div>
                        <div class="col-md-2">
                          <label class="form-label fw-bold">Longitud</label>
                          <input type="number" step="0.0001" v-model="direccion.lng" class="form-control form-control-sm" placeholder="-57.620" />
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-10">
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" v-model="direccion.es_principal" :id="'principal-direccion-' + index">
                            <label class="form-check-label" :for="'principal-direccion-' + index">
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
                    <button type="button" class="btn btn-outline-success btn-sm" @click="addDireccion">
                      <i class="fas fa-plus me-1"></i>Agregar Dirección
                    </button>
                  </div>
                </div>
              </div>

              <!-- Sección: Observaciones -->
              <div class="section-header mb-3 mt-4">
                <h6 class="text-success border-bottom pb-2 mb-3">
                  <i class="fas fa-sticky-note me-2"></i>Observaciones
                </h6>
              </div>

              <div class="row mb-3">
                <div class="col-12">
                  <label class="form-label fw-bold">Observaciones</label>
                  <textarea v-model="providerData.observaciones" class="form-control" rows="3" placeholder="Observaciones generales sobre el proveedor..."></textarea>
                </div>
              </div>

              <!-- Botones de Acción -->
              <div class="row mt-4">
                <div class="col-12">
                  <div class="d-flex justify-content-end gap-2">
                    <button type="button" class="btn btn-outline-secondary" @click="closeModal">
                      <i class="fas fa-times me-1"></i>Cancelar
                    </button>
                    <button type="submit" class="btn btn-success">
                      <i :class="isEditMode ? 'fas fa-edit me-1' : 'fas fa-save me-1'"></i>
                      {{ isEditMode ? 'Actualizar Proveedor' : 'Guardar Proveedor' }}
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
  <div class="modal-backdrop fade show" v-if="showModal"></div>
</template>



<script>
import apiService from '../services/apiService.js';


export default {
  name: 'RegistrarProveedor',
  emits: ['update:showModal', 'provider-registered'],
  props: {
    
    title: { type: String, default: 'Registrar Proveedor' },
    initialRuc: { type: String, default: '' },
    id: { type: [String, Number], default: null },
    showModal: { type: Boolean, default: false }

  },
  data() {
    return {
      providerData: {
        // Campos originales (mantener funcionalidad)
        nombre: '',
        nro_documento: '',
        ruc: '',
        ci: '', 
        direccion: '',
        telefono_celular: '',
        email: '',
        nombre_fantasia: '',
        condiciones_pago: '',
        
        // Nuevos campos - Información comercial
        tipo_entidad: 'SIN DATO',
        estado_relacion_id: 1,
        tipo_proveedor_id: 1,
        rubro: '',
        anios_en_mercado: 0,
        sitio_web: '',
        telefono_corporativo: '',
        email_corporativo: '',
        whatsapp_link: '',
        riesgo_proveedor: 'SIN DATO',
        estatus_auditoria: 'SIN DATO',
        observaciones: '',
        
        // Campo para contacto principal (simple)
        contacto_principal: '',
        
        // Nuevos campos - Contacto estructurado
        contacto: {
          contactos: [],
          redes: []
        },
        
        // Nuevos campos - Direcciones estructuradas
        direcciones: []
      }
    };
  },
  watch: {
    id: {
      handler(newVal) {
        if (newVal) {
          console.log('ID changed to:', newVal);
          this.loadProvider();
        }
      },
      immediate: true
    },
    // al mostrarse el modal, cargar datos si es edición o limpiar si es nuevo
    showModal(newVal) {
      if (newVal) {
        console.log('Modal shown, edit mode:', this.isEditMode);
        if (this.isEditMode) {
          // Asegurar que se carguen los datos cuando se abre el modal
          this.$nextTick(() => {
            this.loadProvider();
          });
        } else {
          // Limpiar form solo en modo NUEVO
          this.providerData = {
            // Campos originales
            nombre: '',
            nro_documento: '',
            ruc: '',
            ci: '',
            direccion: '',
            telefono_celular: '',
            email: '',
            nombre_fantasia: '',
            condiciones_pago: '',
            
            // Nuevos campos - Información comercial
            tipo_entidad: 'SIN DATO',
            estado_relacion_id: 1,
            tipo_proveedor_id: 1,
            rubro: '',
            anios_en_mercado: 0,
            sitio_web: '',
            telefono_corporativo: '',
            email_corporativo: '',
            whatsapp_link: '',
            riesgo_proveedor: 'SIN DATO',
            estatus_auditoria: 'SIN DATO',
            observaciones: '',
            
            // Campo para contacto principal (simple)
            contacto_principal: '',
            
            // Nuevos campos - Contacto estructurado
            contacto: {
              contactos: [],
              redes: []
            },
            
            // Nuevos campos - Direcciones estructuradas
            direcciones: []
          };
        }
      }
    },
  },
  methods: {
    handleSave() {
      // Preparar datos para envío, mapeando contacto_principal a contacto para compatibilidad con API
      const dataToSend = {
        ...this.providerData,
        contacto: this.providerData.contacto_principal
      };
      
      if (this.isEditMode) {
        const url = `${process.env.VUE_APP_API_BASE_URL}/api/providers/${this.id}`;
        apiService.put(url, dataToSend)
          .then((response) => {
            this.$emit('provider-registered', response.data);
            this.$emit('update:showModal', false);
          })
          .catch(error => {
            console.error("Error actualizando proveedor:", error);
          });
      } else {
        const url = `${process.env.VUE_APP_API_BASE_URL}/api/providers/`;
        apiService.post(url, dataToSend)
          .then(response  => {
            // Reiniciar el formulario si es necesario
            this.providerData = {
              nombre: '',
              identificacion_fiscal: '',
              direccion: '',
              telefono_celular: '',
              email: '',
              nombre_fantasia: '',
              condiciones_pago: '',
              contacto_principal: '',
              contacto: {
                contactos: [],
                redes: []
              },
              direcciones: []
            };
            this.$emit('provider-registered', response.data);
            this.$emit('update:showModal', false);
          })
          .catch(error => {
            console.error("Error registrando proveedor:", error);
          });
      }
    },
    closeModal() {
      this.$emit('update:showModal', false);
    },
    loadProvider() {
      console.log('Loading provider with ID:', this.id);
      const url = `${process.env.VUE_APP_API_BASE_URL}/api/providers/${this.id}`;
      apiService.get(url)
        .then(response => {
          console.log('Provider data received:', response.data);
          const data = response.data;
          // Mapear campos de la respuesta a providerData
          this.providerData = {
            // Campos originales - probando estructura directa primero
            nombre: data.nombre || data.identificacion?.nombre || '',
            contacto_principal: data.contacto || data.identificacion?.contacto || '',
            nro_documento: data.nro_documento || data.identificacion?.nro_documento || data.ruc || data.ci || '',
            ruc: data.ruc || data.identificacion?.ruc || '',
            ci: data.ci || data.identificacion?.ci || '',
            direccion: data.direccion || data.identificacion?.direccion || '',
            telefono_celular: data.telefono_celular || data.identificacion?.telefono_celular || '',
            email: data.email || data.identificacion?.email || '',
            nombre_fantasia: data.nombre_fantasia || data.identificacion?.nombre_fantasia || '',
            condiciones_pago: data.condiciones_pago || data.identificacion?.condiciones_pago || '',
            
            // Nuevos campos - Información comercial
            tipo_entidad: data.tipo_entidad || data.identificacion?.tipo_entidad || 'SIN DATO',
            estado_relacion_id: data.estado_relacion_id || data.identificacion?.estado_relacion_id || 1,
            tipo_proveedor_id: data.tipo_proveedor_id || data.identificacion?.tipo_proveedor_id || 1,
            rubro: data.rubro || data.identificacion?.rubro || '',
            anios_en_mercado: data.anios_en_mercado || data.identificacion?.anios_en_mercado || 0,
            sitio_web: data.sitio_web || data.identificacion?.sitio_web || '',
            telefono_corporativo: data.telefono_corporativo || data.identificacion?.telefono_corporativo || '',
            email_corporativo: data.email_corporativo || data.identificacion?.email_corporativo || '',
            whatsapp_link: data.whatsapp_link || data.identificacion?.whatsapp_link || '',
            riesgo_proveedor: data.riesgo_proveedor || data.identificacion?.riesgo_proveedor || 'SIN DATO',
            estatus_auditoria: data.estatus_auditoria || data.identificacion?.estatus_auditoria || 'SIN DATO',
            observaciones: data.observaciones || data.identificacion?.observaciones || '',
            
            // Nuevos campos - Contacto estructurado
            contacto: {
              contactos: data.contacto?.contactos || [],
              redes: data.contacto?.redes || []
            },
            
            // Nuevos campos - Direcciones estructuradas
            direcciones: data.direcciones || []
          };
        })
        .catch(error => {
          console.error("Error al cargar proveedor:", error);
        });
    },

    // Métodos para manejar contactos
    addContacto() {
      this.providerData.contacto.contactos.push({
        contacto_id: null,
        tipo_contacto_id: 1,
        valor: '',
        es_principal: false,
        rol: '',
        observacion: ''
      });
    },
    removeContacto(index) {
      this.providerData.contacto.contactos.splice(index, 1);
    },

    // Métodos para manejar redes sociales
    addRed() {
      this.providerData.contacto.redes.push({
        proveedor_red_id: null,
        red_social_id: 1,
        handle: '',
        url: '',
        es_principal: false
      });
    },
    removeRed(index) {
      this.providerData.contacto.redes.splice(index, 1);
    },

    // Métodos para manejar direcciones
    addDireccion() {
      this.providerData.direcciones.push({
        direccion_id: null,
        tipo_direccion_id: 1,
        pais: 'Paraguay',
        departamento_id: 5,
        ciudad_id: 101,
        barrio: '',
        calle_principal: '',
        transversal_1: '',
        transversal_2: '',
        numero: '',
        codigo_postal: '',
        referencia: '',
        lat: null,
        lng: null,
        es_principal: false,
        activo: true
      });
    },
    removeDireccion(index) {
      this.providerData.direcciones.splice(index, 1);
    }
  },
  computed: {
    isEditMode() {
      const editMode = !!this.id;
      console.log('IsEditMode computed:', editMode, 'ID:', this.id);
      return editMode;
    }
  },
  mounted() {
    if (this.isEditMode) {
      this.loadProvider();
    }
  },

  close() {
      this.$router.go(-1);
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

.text-xs {
  font-size: 0.75rem;
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
