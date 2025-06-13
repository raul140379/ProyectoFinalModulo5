# Proyecto Final de Modulo :RAUL MARTINEZ AGUANTA

 
> **Proyecto  de la Universidad del Valle: DIPLOMADO PROGRAMACION Y DESARROLO MOVIL


### Objetivos de la aplicacion 

- **Firebase Authentication**: Registro, login, recuperación de contraseña
- **Cloud Firestore**: Base de datos NoSQL, consultas complejas, reglas de seguridad
- **Firebase Storage**: Almacenamiento de archivos (fotos de perfil)
- **Firebase Emulator Suite**: Desarrollo local sin costos
- **Arquitectura móvil**: Patrones modernos en React Native

## Arquitectura del Proyecto

```
MyLibrary/
├── 🔥 FirebaseLocalEmulator/     # Backend Firebase con emuladores
├── 📱 ReactNativeClient/         # Cliente React Native + Expo 


### Backend Firebase

El backend utiliza **Firebase Emulator Suite** para desarrollo local, permitiendo:

- ✅ **Desarrollo offline** sin conexión a internet
- ✅ **Cero costos** durante el desarrollo
- ✅ **Datos de prueba** predefinidos
- ✅ **Reglas de seguridad** educativas comentadas

#### Servicios Implementados

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| **Authentication** | 9099 | Gestión de usuarios |
| **Firestore** | 8080 | Base de datos NoSQL |
| **Storage** | 9199 | Almacenamiento de archivos |
| **UI Console** | 4000 | Interfaz de administración |

### Clientes Móviles

El proyecto incluye dos implementaciones móviles para comparar tecnologías:

#### React Native + Expo
- **Context API** para manejo de estado
- **React Navigation** para navegación
- **React Native Paper** para UI Material Design
- **Expo** para desarrollo simplificado
 
##  Inicio Rápido

### Prerrequisitos

```bash
# Node.js (versión 18 o superior)
node --version

# Firebase CLI
npm install -g firebase-tools

# Para React Native
npm install -g @expo/cli


### 1. Clonar y Configurar

```bash
# Clonar el repositorio
git clone https://github.com/TuUsuario/UnivallePosgrado-MyLibrary.git](https://github.com/raul140379/ProyectoFinalModulo5.git
cd UnivallePosgrado-MyLibrary

# Instalar dependencias del emulador
cd FirebaseLocalEmulator
npm install
```

### 2. Iniciar Firebase Emulators

```bash
# En el directorio FirebaseLocalEmulator
npm run start

# ✅ Acceder a la UI en: http://localhost:4000
```

### 3. Ejecutar Cliente React Native

```bash
# En el directorio ReactNativeClient
cd ../ReactNativeClient
npm install
npm start

# Escanear QR con Expo Go app
```

## Funcionalidades Implementadas

### 👤 Autenticación de Usuarios
- ✅ Registro con email/contraseña
- ✅ Inicio de sesión
- ✅ Recuperación de contraseña
- ✅ Cierre de sesión
- ✅ Persistencia de sesión

### 📖 Gestión de Libros
- ✅ Búsqueda de libros (API externa)
- ✅ Visualización de detalles
- ✅ Agregar a librería personal
- ✅ Estados de carga optimizados

###  Sistema de Reseñas
- ✅ Calificación por estrellas (1-5)
- ✅ Texto de reseña
- ✅ Edición de reseñas existentes
- ✅ Visualización de reseñas propias

### 👤 Perfil de Usuario
- ✅ Edición de datos personales
- ✅ Cambio de foto de perfil
- ✅ Visualización de estadísticas
- ✅ Restablecion de contrasena

## Stack Tecnológico

### Backend
- **Firebase Authentication** - Gestión de usuarios
- **Cloud Firestore** - Base de datos NoSQL
- **Firebase Storage** - Almacenamiento de archivos
- **Firebase Emulator Suite** - Desarrollo local

### Frontend
- **React Native 0.72** + **Expo 49** 
- **Material Design 3** - Sistema de diseño
- **React Navigation 6** - Navegación (RN)
- **Provider Pattern** - Estado global

### APIs Externas
- **Books API** (Udacity) - Catálogo de libros

## Esquema de Base de Datos

### Colección: `users`
```javascript
{
  email: string,
  nombre: string,
  apellido: string,
  fotoPerfilUrl: string | null,
  fechaCreacion: timestamp,
  fechaUltimaActividad: timestamp
}
```

### Colección: `libraries/{userId}/books`
```javascript
{
  bookId: string,
  titulo: string,
  autor: string,
  portadaUrl: string,
  fechaAgregado: timestamp,
  tieneReseña: boolean
}
```

### Colección: `reviews`
```javascript
{
  userId: string,
  bookId: string,
  calificacion: number,    // 1-5
  textoReseña: string,
  fechaCreacion: timestamp,
  fechaModificacion: timestamp
}
```

## Reglas de Seguridad

El proyecto incluye reglas de seguridad que demuestran:

- **Autorización basada en usuario**: Solo acceso a datos propios
- **Validación de datos**: Tipos y formatos correctos
- **Permisos granulares**: Lectura vs escritura diferenciada

`

##  Licencia


## Autores

- Docente Ing. Carlos Oliveras.

## 🙏 Reconocimientos

- **Firebase Team** por la excelente documentación
- **Udacity** por la Books API gratuita
- **Universidad del Valle** por el programa de postgrado

## 📞 Soporte
 
---
 
