<template>
    <div class="login-page">
      <div class="login-container">
        <h2 class="login-title">Bienvenido</h2>
        <form @submit.prevent="login">
          <div class="form-group">
            <label for="username">Nombre de Usuario</label>
            <div class="input-container">
              <i class="fas fa-user"></i>
              <input
                type="text"
                id="username"
                v-model="username"
                placeholder="Ingresa tu nombre de usuario"
                required
              />
            </div>
            <div v-if="usernameError" class="error-message">{{ usernameError }}</div>
          </div>
          <div class="form-group">
            <label for="password">Contraseña</label>
            <div class="input-container">
              <i class="fas fa-lock"></i>
              <input
                type="password"
                id="password"
                v-model="password"
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>
            <div v-if="passwordError" class="error-message">{{ passwordError }}</div>
          </div>
          <button type="submit" class="login-btn">Iniciar Sesión</button>
        </form>
      </div>
    </div>
</template>
  
<script>
import apiService from '@/services/apiService';

  export default {
    name: "LoginView",
    data() {
      return {
        username: "",
        password: "",
        usernameError: "",
        passwordError: ""
      };
    },
    methods: {
      login() {
        // Resetear mensajes de error
        this.usernameError = "";
        this.passwordError = "";
  
        // Validación de campos vacíos
        let hasError = false;
  
        if (!this.username) {
          this.usernameError = "Por favor, ingresa un nombre de usuario.";
          hasError = true;
        }
        if (!this.password) {
          this.passwordError = "Por favor, ingresa una contraseña.";
          hasError = true;
        }
  
        // Validación de formato de usuario y contraseña
        const usernameRegex = /^\S{3,}$/;
        if (!hasError && !usernameRegex.test(this.username)) {
          this.usernameError =
            "El nombre de usuario debe tener al menos 3 caracteres y no debe contener espacios.";
          hasError = true;
        }
        if (!hasError && this.password.length < 5) {
          this.passwordError = "La contraseña debe tener al menos 5 caracteres.";
          hasError = true;
        }
  
        if (!hasError) {
          // Datos para la solicitud al backend
          
          const loginData = {
            usuario: this.username,
            password: this.password
          };
  
          apiService.post(`${process.env.VUE_APP_LOGIN_URL}auth/login`, loginData)
            .then(response => {
              const data = response.data;
              if (data.token) {
                // Guardamos el token con la clave "authToken" para que el interceptor lo reconozca
                localStorage.setItem("authToken", data.token);
                localStorage.setItem("rol_id", data.rol_id);
                console.log(data);
                this.$router.push("/pantalla-inicio");
              } else {
                this.passwordError = "Usuario o contraseña incorrectos.";
              }
            })
            .catch(error => {
              console.error("Error:", error);
              this.passwordError = "Ocurrió un error al intentar iniciar sesión.";
            });
          }
            

        }
    },
    mounted() {
      // Limpiar sesión al cargar la pantalla de login
      localStorage.removeItem("token");
      localStorage.removeItem("rol_id");
    }
  };
</script>
  
<style scoped>
/* Centrado de la página de inicio de sesión */
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: white;
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Contenedor del formulario */
.login-container {
  background-color: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
  animation: fadeIn 0.8s ease-in-out;
}

/* Animación del formulario */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Título del formulario */
.login-title {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: black;
}

/* Etiquetas */
label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  font-weight: bold;
  color: black;
}

/* Contenedor para los iconos */
.input-container {
  position: relative;
  width: 100%;
}

.input-container i {
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  color: black;
}

input {
  width: 100%;
  padding: 0.9rem 1.5rem 0.9rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

input:focus {
  border-color: #6e8efb;
  box-shadow: 0 0 8px rgba(110, 142, 251, 0.5);
  outline: none;
}

/* Botón de inicio de sesión */
.login-btn {
  width: 100%;
  padding: 0.9rem;
  background-color: black;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
  margin-top: 1.5rem;
}

/* Efecto hover */
.login-btn:hover {
  background-color: gray;
  transform: scale(1.05);
}

/* Mensajes de error */
.error-message {
  color: red;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

</style>
