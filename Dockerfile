# Imagen base con Node.js 22
FROM node:22.13.0

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiamos solo los archivos de dependencias primero (para usar cache de Docker)
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del proyecto
COPY . .

# Exponemos el puerto usado por Vue CLI (8080 por defecto)
EXPOSE 8080

# Comando para ejecutar la app
CMD ["npm", "run", "serve"]
