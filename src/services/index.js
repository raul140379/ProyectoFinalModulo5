/**
 * **ÍNDICE DE SERVICIOS EDUCATIVO** 🎯
 * 
 * Este archivo centraliza todas las exportaciones de servicios
 * para facilitar las importaciones en otros módulos.
 * 
 * Patrón educativo demostrado:
 * - Barrel exports
 * - Organización modular
 * - API unificada
 * - Documentación centralizada
 */

// ===================================
// 🔥 SERVICIOS DE FIREBASE
// ===================================

// Configuración base de Firebase
export { 
  getFirebaseAuth, 
  getFirebaseFirestore, 
  getFirebaseStorage,
  getFirebaseApp,
  initializeFirebase 
} from './firebase/firebaseConfig';

// Servicio de autenticación
export { 
  authService, 
  AuthService 
} from './firebase/authService';

// Servicio de Firestore
export { 
  firestoreService, 
  FirestoreService 
} from './firebase/firestoreService';

// Servicio de Storage
export { 
  storageService, 
  StorageService 
} from './firebase/storageService';

// ===================================
// 🌐 SERVICIOS DE API EXTERNA
// ===================================

// Servicio de API de libros
export { 
  booksApiService, 
  BooksApiService 
} from './api/booksApiService';

// ===================================
// 💾 SERVICIOS DE ALMACENAMIENTO LOCAL
// ===================================

// Servicio de AsyncStorage
export { 
  localStorageService, 
  LocalStorageService 
} from './storage/localStorageService';

// ===================================
// 🛠️ SERVICIOS COMPUESTOS Y UTILIDADES
// ===================================

/**
 * **CLASE DE SERVICIOS UNIFICADOS** 🎯
 * 
 * Proporciona acceso unificado a todos los servicios.
 * Útil para dependency injection y testing.
 */
export class MyLibraryServices {
  constructor() {
    // Servicios Firebase
    this.auth = authService;
    this.firestore = firestoreService;
    this.storage = storageService;
    
    // Servicios externos
    this.booksApi = booksApiService;
    
    // Servicios locales
    this.localStorage = localStorageService;
    
    console.log('🎯 MyLibraryServices inicializado');
  }

  /**
   * **VERIFICAR DISPONIBILIDAD DE SERVICIOS** ✅
   */
  async checkServicesHealth() {
    const results = {
      firebase: true,
      booksApi: false,
      localStorage: false,
      timestamp: Date.now()
    };

    try {
      // Verificar Books API
      const apiTest = await this.booksApi.testConnection();
      results.booksApi = apiTest.success;

      // Verificar localStorage
      const storageTest = await this.localStorage.setItem('health_check', 'ok');
      results.localStorage = storageTest.success;
      if (storageTest.success) {
        await this.localStorage.removeItem('health_check');
      }

    } catch (error) {
      console.error('❌ Error en health check:', error);
    }

    return results;
  }

  /**
   * **INICIALIZAR TODOS LOS SERVICIOS** 🚀
   */
  async initializeAll() {
    console.log('🚀 Inicializando todos los servicios...');
    
    try {
      // Limpiar cache expirado
      await this.localStorage.cleanExpiredCache();
      
      // Verificar salud de servicios
      const health = await this.checkServicesHealth();
      
      console.log('✅ Servicios inicializados:', health);
      return { success: true, health };
      
    } catch (error) {
      console.error('❌ Error inicializando servicios:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * **LIMPIAR TODOS LOS DATOS** 🧹
   */
  async clearAllData(userId = null) {
    console.log('🧹 Limpiando todos los datos...');
    
    try {
      // Cerrar sesión
      await this.auth.signOut();
      
      // Limpiar cache de API
      this.booksApi.clearAllCache();
      
      // Limpiar storage local
      if (userId) {
        await this.localStorage.clearUserData(userId);
      } else {
        await this.localStorage.clearAll();
      }
      
      console.log('✅ Todos los datos limpiados');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error limpiando datos:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * **OBTENER ESTADÍSTICAS GENERALES** 📊
   */
  async getGeneralStats() {
    try {
      const stats = {
        timestamp: Date.now(),
        services: {}
      };

      // Stats de localStorage
      const storageStats = await this.localStorage.getStorageStats();
      if (storageStats.success) {
        stats.services.localStorage = storageStats.data;
      }

      // Stats de cache de API
      stats.services.booksApi = this.booksApi.getCacheStats();

      // Health check
      stats.health = await this.checkServicesHealth();

      return { success: true, data: stats };
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return { success: false, error: error.message };
    }
  }
}

// **INSTANCIA SINGLETON DE SERVICIOS UNIFICADOS** 🎯
export const myLibraryServices = new MyLibraryServices();

// ===================================
// 📚 DOCUMENTACIÓN DE USO
// ===================================

/**
 * **EJEMPLOS DE USO** 📝
 * 
 * // Importar servicios individuales
 * import { authService, booksApiService } from '@/services';
 * 
 * // Usar servicios
 * const result = await authService.signIn(email, password);
 * const books = await booksApiService.searchBooks('JavaScript');
 * 
 * // Importar servicios unificados
 * import { myLibraryServices } from '@/services';
 * 
 * // Verificar salud de servicios
 * const health = await myLibraryServices.checkServicesHealth();
 * 
 * // Limpiar todos los datos
 * await myLibraryServices.clearAllData();
 */

// ===================================
// 🧪 UTILIDADES PARA TESTING
// ===================================

/**
 * **MOCK DE SERVICIOS PARA TESTING** 🧪
 */
export const createMockServices = () => ({
  auth: {
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    getCurrentUser: jest.fn(),
    isAuthenticated: jest.fn()
  },
  firestore: {
    getUser: jest.fn(),
    updateUser: jest.fn(),
    getUserLibrary: jest.fn(),
    addBookToLibrary: jest.fn(),
    saveReview: jest.fn()
  },
  storage: {
    uploadProfileImage: jest.fn(),
    getProfileImageURL: jest.fn(),
    deleteProfileImage: jest.fn()
  },
  booksApi: {
    searchBooks: jest.fn(),
    getBookDetails: jest.fn(),
    testConnection: jest.fn()
  },
  localStorage: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clearAll: jest.fn()
  }
});

// ===================================
// 🔧 CONFIGURACIÓN DE SERVICIOS
// ===================================

/**
 * **CONFIGURAR SERVICIOS PARA DESARROLLO** 🔧
 */
export const configureServicesForDevelopment = () => {
  console.log('🔧 Configurando servicios para desarrollo...');
  
  // Habilitar logs detallados
  if (__DEV__) {
    // Configurar timeouts más largos para debugging
    booksApiService.updateConfiguration({
      timeout: 30000, // 30 segundos
      cacheTimeout: 60000 // 1 minuto
    });
    
    console.log('🔧 Servicios configurados para desarrollo');
  }
};

/**
 * **CONFIGURAR SERVICIOS PARA PRODUCCIÓN** 🔧
 */
export const configureServicesForProduction = () => {
  console.log('🔧 Configurando servicios para producción...');
  
  // Configurar timeouts optimizados
  booksApiService.updateConfiguration({
    timeout: 10000, // 10 segundos
    cacheTimeout: 5 * 60 * 1000 // 5 minutos
  });
  
  console.log('🔧 Servicios configurados para producción');
};