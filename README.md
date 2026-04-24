# 🚀 API Backend con Node.js + MySQL + JWT + Docker

## 📌 Descripción del proyecto

Este proyecto es una API REST desarrollada con Node.js y Express, conectada a una base de datos MySQL en la nube (Railway).  
Incluye autenticación de usuarios mediante JWT, CRUD completo de items y contenedorización con Docker.

---

## ⚙️ Tecnologías utilizadas

- Node.js
- Express
- MySQL (Railway)
- JWT (JSON Web Token)
- bcryptjs
- Docker
- dotenv

---

## 🧠 Funcionalidades principales

### 🔐 Autenticación

- Registro de usuarios (`/register`)
- Login de usuarios (`/login`)
- Generación de token JWT
- Protección de rutas con middleware

---

### 📦 CRUD de items

- Crear item → `POST /api/items`
- Listar items → `GET /api/items`
- Obtener item por ID → `GET /api/items/:id`
- Actualizar item → `PUT /api/items/:id`
- Eliminar item → `DELETE /api/items/:id`

---

## 🔒 Seguridad

- Contraseñas encriptadas con bcrypt
- Validación de contraseñas seguras
- Rutas protegidas con JWT
- Acceso solo con token válido

---

## 🗄️ Base de datos

La base de datos MySQL contiene las siguientes tablas:

### Tabla: usuarios

- id (INT AUTO_INCREMENT PRIMARY KEY)
- email (VARCHAR)
- password (VARCHAR encriptado)

### Tabla: items

- id (INT AUTO_INCREMENT PRIMARY KEY)
- nombre (VARCHAR 100)
- descripcion (TEXT)
- estado (BOOLEAN)
- created_at (TIMESTAMP)

---

## 🐳 Docker

El proyecto está preparado para ejecutarse en contenedor Docker.

### 📄 Archivos incluidos:

- Dockerfile
- .dockerignore

### ▶️ Ejecución con Docker:

```bash
docker build -t backend-api .
docker run -p 3000:3000 backend-api
```
