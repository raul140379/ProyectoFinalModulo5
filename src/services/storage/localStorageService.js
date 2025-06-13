import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * **SERVICIO DE ALMACENAMIENTO LOCAL EDUCATIVO** 💾
 * 
 * Este servicio demuestra el uso de AsyncStorage para persistencia local:
 * - Cache de datos para offline
 * - Configuraciones de usuario
 * - Estado de la aplicación
 * - Manejo de errores de storage
 * - Serialización segura de datos
 * 
 * Patrones educativos demostrados:
 * - AsyncStorage wrapper
 * - Error handling robusto
 * - Data serialization
 * - Prefix organization
 * - Cache management
 */

class LocalStorageService {
  constructor() {
    // Prefijos para organizar las claves
    this.prefixes = {
      USER: 'user_',
      CACHE: 'cache_',
      CONFIG: 'config_',
      TEMP: 'temp_'
    };
    
    // Configuración de timeouts para cache
    this.defaultCacheTimeout = 24 * 60 * 60 * 1000; // 24 horas
    
    console.log('💾 LocalStorageService inicializado');
  }

  // ===================================
  // 🔧 OPERACIONES BÁSICAS
  // ===================================

  /**
   * **GUARDAR DATOS** 💾
   * 
   * Guarda datos en AsyncStorage con manejo de errores.
   */
  async setItem(key, value) {
    try {
      console.log('💾 LocalStorage: Guardando', key);
      
      // Serializar datos a JSON
      const serializedValue = JSON.stringify({
        data: value,
        timestamp: Date.now(),
        version: '1.0'
      });
      
      await AsyncStorage.setItem(key, serializedValue);
      
      console.log('✅ Datos guardados exitosamente');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error guardando datos:', error);
      return {
        success: false,
        error: 'Error guardando datos localmente'
      };
    }
  }

  /**
   * **OBTENER DATOS** 📥
   * 
   * Obtiene datos de AsyncStorage con deserialización segura.
   */
  async getItem(key) {
    try {
      console.log('📥 LocalStorage: Obteniendo', key);
      
      const serializedValue = await AsyncStorage.getItem(key);
      
      if (serializedValue === null) {
        return {
          success: false,
          error: 'Datos no encontrados'
        };
      }
      
      // Deserializar datos
      const parsed = JSON.parse(serializedValue);
      
      return {
        success: true,
        data: parsed.data,
        timestamp: parsed.timestamp,
        version: parsed.version
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo datos:', error);
      return {
        success: false,
        error: 'Error obteniendo datos locales'
      };
    }
  }

  /**
   * **ELIMINAR DATOS** 🗑️
   */
  async removeItem(key) {
    try {
      console.log('🗑️ LocalStorage: Eliminando', key);
      
      await AsyncStorage.removeItem(key);
      
      console.log('✅ Datos eliminados');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error eliminando datos:', error);
      return {
        success: false,
        error: 'Error eliminando datos'
      };
    }
  }

  /**
   * **VERIFICAR EXISTENCIA** ✅
   */
  async hasItem(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null;
    } catch (error) {
      console.error('❌ Error verificando existencia:', error);
      return false;
    }
  }

  // ===================================
  // 👤 DATOS DE USUARIO
  // ===================================

  /**
   * **GUARDAR PERFIL DE USUARIO** 👤💾
   */
  async saveUserProfile(userId, profileData) {
    const key = `${this.prefixes.USER}profile_${userId}`;
    return await this.setItem(key, profileData);
  }

  /**
   * **OBTENER PERFIL DE USUARIO** 👤📥
   */
  async getUserProfile(userId) {
    const key = `${this.prefixes.USER}profile_${userId}`;
    return await this.getItem(key);
  }

  /**
   * **GUARDAR CONFIGURACIONES DE USUARIO** ⚙️
   */
  async saveUserSettings(userId, settings) {
    const key = `${this.prefixes.USER}settings_${userId}`;
    return await this.setItem(key, settings);
  }

  /**
   * **OBTENER CONFIGURACIONES DE USUARIO** ⚙️
   */
  async getUserSettings(userId) {
    const key = `${this.prefixes.USER}settings_${userId}`;
    const result = await this.getItem(key);
    
    // Devolver configuraciones por defecto si no existen
    if (!result.success) {
      return {
        success: true,
        data: this.getDefaultUserSettings()
      };
    }
    
    return result;
  }

  /**
   * **CONFIGURACIONES POR DEFECTO** ⚙️
   */
  getDefaultUserSettings() {
    return {
      notifications: true,
      darkMode: false,
      language: 'es',
      autoSync: true,
      cacheImages: true,
      offlineMode: false
    };
  }

  // ===================================
  // 📦 CACHE DE DATOS
  // ===================================

  /**
   * **GUARDAR EN CACHE** 📦💾
   */
  async setCache(cacheKey, data, customTimeout = null) {
    const key = `${this.prefixes.CACHE}${cacheKey}`;
    const timeout = customTimeout || this.defaultCacheTimeout;
    
    const cacheData = {
      ...data,
      expiresAt: Date.now() + timeout
    };
    
    return await this.setItem(key, cacheData);
  }

  /**
   * **OBTENER DE CACHE** 📦📥
   */
  async getCache(cacheKey) {
    const key = `${this.prefixes.CACHE}${cacheKey}`;
    const result = await this.getItem(key);
    
    if (!result.success) {
      return result;
    }
    
    // Verificar si el cache ha expirado
    const now = Date.now();
    if (result.data.expiresAt && now > result.data.expiresAt) {
      console.log('⏰ Cache expirado, eliminando...');
      await this.removeItem(key);
      return {
        success: false,
        error: 'Cache expirado'
      };
    }
    
    return {
      success: true,
      data: result.data
    };
  }

  /**
   * **CACHE DE BÚSQUEDAS DE LIBROS** 📚📦
   */
  async cacheBookSearch(query, results) {
    const cacheKey = `book_search_${query.toLowerCase().replace(/\s+/g, '_')}`;
    return await this.setCache(cacheKey, { query, results, searchDate: Date.now() });
  }

  /**
   * **OBTENER CACHE DE BÚSQUEDA** 📚📥
   */
  async getCachedBookSearch(query) {
    const cacheKey = `book_search_${query.toLowerCase().replace(/\s+/g, '_')}`;
    return await this.getCache(cacheKey);
  }

  /**
   * **CACHE DE DETALLES DE LIBRO** 📖📦
   */
  async cacheBookDetails(bookId, details) {
    const cacheKey = `book_details_${bookId}`;
    return await this.setCache(cacheKey, details);
  }

  /**
   * **OBTENER CACHE DE DETALLES** 📖📥
   */
  async getCachedBookDetails(bookId) {
    const cacheKey = `book_details_${bookId}`;
    return await this.getCache(cacheKey);
  }

  // ===================================
  // 🔧 CONFIGURACIONES GLOBALES
  // ===================================

  /**
   * **GUARDAR CONFIGURACIÓN DE APP** 🔧
   */
  async saveAppConfig(config) {
    const key = `${this.prefixes.CONFIG}app`;
    return await this.setItem(key, config);
  }

  /**
   * **OBTENER CONFIGURACIÓN DE APP** 🔧
   */
  async getAppConfig() {
    const key = `${this.prefixes.CONFIG}app`;
    const result = await this.getItem(key);
    
    if (!result.success) {
      return {
        success: true,
        data: this.getDefaultAppConfig()
      };
    }
    
    return result;
  }

  /**
   * **CONFIGURACIÓN POR DEFECTO DE APP** 🔧
   */
  getDefaultAppConfig() {
    return {
      apiTimeout: 10000,
      cacheTimeout: 24 * 60 * 60 * 1000,
      maxCacheSize: 50,
      debugMode: __DEV__,
      useEmulators: __DEV__
    };
  }

  // ===================================
  // 📊 ESTADO DE LA APLICACIÓN
  // ===================================

  /**
   * **GUARDAR ÚLTIMO ESTADO** 📊
   */
  async saveAppState(state) {
    const key = `${this.prefixes.CONFIG}last_state`;
    return await this.setItem(key, {
      ...state,
      savedAt: Date.now()
    });
  }

  /**
   * **OBTENER ÚLTIMO ESTADO** 📊
   */
  async getLastAppState() {
    const key = `${this.prefixes.CONFIG}last_state`;
    return await this.getItem(key);
  }

  /**
   * **GUARDAR ÚLTIMA BÚSQUEDA** 🔍
   */
  async saveLastSearch(query) {
    const key = `${this.prefixes.CONFIG}last_search`;
    return await this.setItem(key, { query, timestamp: Date.now() });
  }

  /**
   * **OBTENER ÚLTIMA BÚSQUEDA** 🔍
   */
  async getLastSearch() {
    const key = `${this.prefixes.CONFIG}last_search`;
    return await this.getItem(key);
  }

  // ===================================
  // 🧹 LIMPIEZA Y MANTENIMIENTO
  // ===================================

  /**
   * **LIMPIAR CACHE EXPIRADO** 🧹
   */
  async cleanExpiredCache() {
    try {
      console.log('🧹 LocalStorage: Limpiando cache expirado...');
      
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith(this.prefixes.CACHE));
      
      let cleanedCount = 0;
      const now = Date.now();
      
      for (const key of cacheKeys) {
        try {
          const result = await this.getItem(key);
          if (result.success && result.data.expiresAt && now > result.data.expiresAt) {
            await this.removeItem(key);
            cleanedCount++;
          }
        } catch (error) {
          // Si hay error leyendo, eliminar el item corrupto
          await this.removeItem(key);
          cleanedCount++;
        }
      }
      
      console.log(`✅ Limpieza completada. ${cleanedCount} items eliminados`);
      return { success: true, cleanedItems: cleanedCount };
      
    } catch (error) {
      console.error('❌ Error limpiando cache:', error);
      return {
        success: false,
        error: 'Error limpiando cache'
      };
    }
  }

  /**
   * **LIMPIAR DATOS DE USUARIO** 👤🧹
   */
  async clearUserData(userId) {
    try {
      console.log('👤🧹 LocalStorage: Limpiando datos de usuario', userId);
      
      const allKeys = await AsyncStorage.getAllKeys();
      const userKeys = allKeys.filter(key => 
        key.includes(`_${userId}`) || 
        key.startsWith(`${this.prefixes.USER}`) && key.includes(userId)
      );
      
      await AsyncStorage.multiRemove(userKeys);
      
      console.log(`✅ ${userKeys.length} datos de usuario eliminados`);
      return { success: true, removedItems: userKeys.length };
      
    } catch (error) {
      console.error('❌ Error limpiando datos de usuario:', error);
      return {
        success: false,
        error: 'Error limpiando datos de usuario'
      };
    }
  }

  /**
   * **LIMPIAR TODO EL STORAGE** 🗑️
   */
  async clearAll() {
    try {
      console.log('🗑️ LocalStorage: Limpiando todo el storage...');
      
      await AsyncStorage.clear();
      
      console.log('✅ Todo el storage limpiado');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error limpiando storage:', error);
      return {
        success: false,
        error: 'Error limpiando storage'
      };
    }
  }

  // ===================================
  // 📊 ESTADÍSTICAS Y DIAGNÓSTICO
  // ===================================

  /**
   * **OBTENER ESTADÍSTICAS DE STORAGE** 📊
   */
  async getStorageStats() {
    try {
      console.log('📊 LocalStorage: Obteniendo estadísticas...');
      
      const allKeys = await AsyncStorage.getAllKeys();
      
      const stats = {
        totalItems: allKeys.length,
        userItems: allKeys.filter(key => key.startsWith(this.prefixes.USER)).length,
        cacheItems: allKeys.filter(key => key.startsWith(this.prefixes.CACHE)).length,
        configItems: allKeys.filter(key => key.startsWith(this.prefixes.CONFIG)).length,
        tempItems: allKeys.filter(key => key.startsWith(this.prefixes.TEMP)).length,
        keys: allKeys
      };
      
      console.log('📊 Storage stats:', stats);
      return { success: true, data: stats };
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return {
        success: false,
        error: 'Error obteniendo estadísticas'
      };
    }
  }

  /**
   * **EXPORTAR TODOS LOS DATOS** 📤
   */
  async exportAllData() {
    try {
      console.log('📤 LocalStorage: Exportando todos los datos...');
      
      const allKeys = await AsyncStorage.getAllKeys();
      const allData = await AsyncStorage.multiGet(allKeys);
      
      const exportData = {};
      allData.forEach(([key, value]) => {
        try {
          exportData[key] = JSON.parse(value);
        } catch (error) {
          exportData[key] = value; // Si no es JSON válido, guardar como string
        }
      });
      
      return {
        success: true,
        data: {
          exportDate: new Date().toISOString(),
          itemCount: allKeys.length,
          data: exportData
        }
      };
      
    } catch (error) {
      console.error('❌ Error exportando datos:', error);
      return {
        success: false,
        error: 'Error exportando datos'
      };
    }
  }
}

// **EXPORTAR INSTANCIA SINGLETON** 🎯
export const localStorageService = new LocalStorageService();

// Exportar también la clase para testing
export { LocalStorageService };