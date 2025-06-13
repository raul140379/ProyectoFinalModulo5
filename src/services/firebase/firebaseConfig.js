import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Importar configuraciones
import { getFirebaseConfig, getEmulatorConfig } from '../../constants/firebase';

/**
 * **INICIALIZACIÓN DE FIREBASE EDUCATIVA** 🔥
 * 
 * Este archivo demuestra cómo configurar Firebase correctamente,
 * incluyendo la conexión a emuladores para desarrollo local.
 * 
 * Conceptos educativos:
 * - Inicialización condicional (emuladores vs producción)
 * - Singleton pattern para la app de Firebase
 * - Configuración de diferentes servicios de Firebase
 */

let app;
let auth;
let db;
let storage;

/**
 * **FUNCIÓN PRINCIPAL DE INICIALIZACIÓN** 🚀
 * 
 * Inicializa Firebase y configura los emuladores si estamos en desarrollo.
 * Esta función se ejecuta una sola vez (patrón Singleton).
 */
export const initializeFirebase = () => {
  try {
    // Verificar si Firebase ya fue inicializado (patrón Singleton)
    if (getApps().length === 0) {
      console.log('🔥 Inicializando Firebase...');
      
      // Obtener configuración según el entorno
      const config = getFirebaseConfig();
      app = initializeApp(config);
      
      console.log('✅ Firebase inicializado correctamente');
    } else {
      console.log('♻️ Firebase ya estaba inicializado');
      app = getApps()[0];
    }

    // Inicializar servicios de Firebase
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    // Configurar emuladores si estamos en desarrollo
    const emulatorConfig = getEmulatorConfig();
    if (emulatorConfig) {
      setupEmulators(emulatorConfig);
    }

    return { app, auth, db, storage };
    
  } catch (error) {
    console.error('❌ Error inicializando Firebase:', error);
    throw error;
  }
};

/**
 * **CONFIGURACIÓN DE EMULADORES** 🛠️
 * 
 * Conecta los servicios de Firebase a los emuladores locales.
 * Solo se ejecuta en modo desarrollo.
 */
const setupEmulators = (config) => {
  try {
    console.log('🔧 Configurando emuladores de Firebase...');

    // Configurar emulador de Authentication
    try {
      connectAuthEmulator(auth, config.AUTH_URL, { disableWarnings: true });
      console.log('   ✅ Auth Emulator conectado en', config.AUTH_URL);
    } catch (authError) {
      console.log('   ⚠️ Auth Emulator ya conectado:', authError.message);
    }

    // Configurar emulador de Firestore
    try {
      // Extraer host y puerto de la URL
      const firestoreHost = config.FIRESTORE_URL.replace('http://', '').split(':')[0];
      const firestorePort = parseInt(config.FIRESTORE_URL.split(':')[2] || '8080');
      connectFirestoreEmulator(db, firestoreHost, firestorePort);
      console.log('   ✅ Firestore Emulator conectado en', config.FIRESTORE_URL);
    } catch (firestoreError) {
      console.log('   ⚠️ Firestore Emulator ya conectado:', firestoreError.message);
    }

    // Configurar emulador de Storage
    try {
      // Extraer host y puerto de la URL
      const storageHost = config.STORAGE_URL.replace('http://', '').split(':')[0];
      const storagePort = parseInt(config.STORAGE_URL.split(':')[2] || '9199');
      connectStorageEmulator(storage, storageHost, storagePort);
      console.log('   ✅ Storage Emulator conectado en', config.STORAGE_URL);
    } catch (storageError) {
      console.log('   ⚠️ Storage Emulator ya conectado:', storageError.message);
    }

    console.log('🎉 Emuladores configurados correctamente');
    
  } catch (error) {
    console.warn('⚠️ Warning configurando emuladores:', error.message);
    // No lanzar error, los emuladores podrían ya estar conectados
  }
};

/**
 * **EXPORTACIONES EDUCATIVAS** 📤
 * 
 * Estas funciones permiten acceder a los servicios de Firebase
 * desde cualquier parte de la aplicación.
 */

// Función para obtener la instancia de Auth
export const getFirebaseAuth = () => {
  if (!auth) {
    initializeFirebase();
  }
  return auth;
};

// Función para obtener la instancia de Firestore
export const getFirebaseFirestore = () => {
  if (!db) {
    initializeFirebase();
  }
  return db;
};

// Función para obtener la instancia de Storage
export const getFirebaseStorage = () => {
  if (!storage) {
    initializeFirebase();
  }
  return storage;
};

// Función para obtener la app de Firebase
export const getFirebaseApp = () => {
  if (!app) {
    initializeFirebase();
  }
  return app;
};

// **INICIALIZACIÓN AUTOMÁTICA** ⚡
// Inicializar Firebase al importar este módulo
initializeFirebase();