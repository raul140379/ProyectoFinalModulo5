import { BOOKS_API } from '../../constants/firebase';

/**
 * **SERVICIO DE API DE LIBROS EDUCATIVO** 📚
 * 
 * Este servicio demuestra cómo integrar APIs externas en aplicaciones Firebase:
 * - Manejo de requests HTTP con fetch
 * - Cache local para optimización
 * - Error handling robusto
 * - Transformación de datos
 * - Rate limiting y timeouts
 * 
 * Patrones educativos demostrados:
 * - API Service Layer
 * - Response transformation
 * - Cache strategy
 * - Error recovery
 * - Request optimization
 */

class BooksApiService {
  constructor() {
    this.baseURL = BOOKS_API.BASE_URL;
    this.endpoints = BOOKS_API.ENDPOINTS;
    this.timeout = BOOKS_API.TIMEOUT;
    this.maxResults = BOOKS_API.MAX_RESULTS;
    
    // Cache simple en memoria (en producción usar AsyncStorage o Redux Persist)
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    
    // Email del usuario para autorización
    this.userEmail = null;
    
    console.log('📚 BooksApiService inicializado');
  }

  // ===================================
  // 🔐 CONFIGURACIÓN DE AUTORIZACIÓN
  // ===================================

  /**
   * **ESTABLECER EMAIL DEL USUARIO** 👤
   * 
   * Configura el email del usuario para incluir en el header Authorization.
   */
  setUserEmail(email) {
    this.userEmail = email;
    console.log('🔐 Email de usuario configurado para autorización:', email ? email.substring(0, 3) + '***' : 'null');
  }

  /**
   * **LIMPIAR AUTORIZACIÓN** 🧹
   * 
   * Limpia el email del usuario (al cerrar sesión).
   */
  clearAuthorization() {
    this.userEmail = null;
    console.log('🧹 Autorización limpiada');
  }

  // ===================================
  // 🔍 BÚSQUEDA DE LIBROS
  // ===================================

  /**
   * **BUSCAR LIBROS** 🔍
   * 
   * Busca libros usando la API externa con cache y validación.
   */
  async searchBooks(query, options = {}) {
    try {
      console.log('🔍 BooksApiService: Buscando libros para:', query);
      
      // Validar entrada
      if (!query || query.trim().length < 2) {
        return {
          success: false,
          error: 'La búsqueda debe tener al menos 2 caracteres'
        };
      }

      const cleanQuery = query.trim();
      const { maxResults = this.maxResults, useCache = true } = options;
      
      // Verificar cache
      const cacheKey = `search_${cleanQuery}_${maxResults}`;
      if (useCache && this.isValidCache(cacheKey)) {
        console.log('📦 Usando resultado de cache');
        return {
          success: true,
          data: this.cache.get(cacheKey).data,
          fromCache: true
        };
      }

      // Preparar request
      const requestBody = {
        query: cleanQuery,
        maxResults
      };

      // Realizar búsqueda
      const response = await this.makeRequest('POST', this.endpoints.SEARCH, requestBody);
      
      if (!response.success) {
        return response;
      }

      // Transformar y validar datos
      const transformedBooks = this.transformBooksData(response.data.books || []);
      
      // Guardar en cache
      if (useCache) {
        this.setCache(cacheKey, transformedBooks);
      }

      console.log(`✅ Encontrados ${transformedBooks.length} libros`);
      
      return {
        success: true,
        data: transformedBooks,
        totalItems: response.data.totalItems || transformedBooks.length,
        fromCache: false
      };

    } catch (error) {
      console.error('❌ Error en búsqueda de libros:', error);
      return {
        success: false,
        error: 'Error buscando libros. Intenta de nuevo.'
      };
    }
  }

  /**
   * **OBTENER TODOS LOS LIBROS** 📚
   * 
   * Obtiene el catálogo completo de libros disponibles.
   */
  async getAllBooks(useCache = true) {
    try {
      console.log('📚 BooksApiService: Obteniendo todos los libros');
      
      const cacheKey = 'all_books';
      
      // Verificar cache
      if (useCache && this.isValidCache(cacheKey)) {
        console.log('📦 Usando catálogo de cache');
        return {
          success: true,
          data: this.cache.get(cacheKey).data,
          fromCache: true
        };
      }

      // Obtener libros
      const response = await this.makeRequest('GET', this.endpoints.GET_ALL);
      
      if (!response.success) {
        return response;
      }

      // Transformar datos
      const transformedBooks = this.transformBooksData(response.data.books || []);
      
      // Guardar en cache
      if (useCache) {
        this.setCache(cacheKey, transformedBooks);
      }

      console.log(`✅ Obtenidos ${transformedBooks.length} libros del catálogo`);
      
      return {
        success: true,
        data: transformedBooks,
        fromCache: false
      };

    } catch (error) {
      console.error('❌ Error obteniendo catálogo:', error);
      return {
        success: false,
        error: 'Error obteniendo catálogo de libros'
      };
    }
  }

  /**
   * **OBTENER DETALLES DE LIBRO** 📖
   * 
   * Obtiene información detallada de un libro específico.
   */
  async getBookDetails(bookId, useCache = true) {
    try {
      console.log('📖 BooksApiService: Obteniendo detalles para libro:', bookId);
      
      if (!bookId) {
        return {
          success: false,
          error: 'ID de libro es requerido'
        };
      }

      const cacheKey = `book_${bookId}`;
      
      // Verificar cache
      if (useCache && this.isValidCache(cacheKey)) {
        console.log('📦 Usando detalles de cache');
        return {
          success: true,
          data: this.cache.get(cacheKey).data,
          fromCache: true
        };
      }

      // Obtener detalles
      const response = await this.makeRequest('GET', `${this.endpoints.GET_BOOK}/${bookId}`);
      
      if (!response.success) {
        return response;
      }

      // Transformar datos del libro individual
      const transformedBook = this.transformBookData(response.data);
      
      // Guardar en cache
      if (useCache) {
        this.setCache(cacheKey, transformedBook);
      }

      console.log('✅ Detalles de libro obtenidos');
      
      return {
        success: true,
        data: transformedBook,
        fromCache: false
      };

    } catch (error) {
      console.error('❌ Error obteniendo detalles del libro:', error);
      return {
        success: false,
        error: 'Error obteniendo detalles del libro'
      };
    }
  }

  // ===================================
  // 🛠️ MÉTODOS AUXILIARES
  // ===================================

  /**
   * **REALIZAR REQUEST HTTP** 🌐
   * 
   * Método centralizado para todas las peticiones HTTP.
   * Incluye automáticamente el header Authorization con el email del usuario.
   */
  async makeRequest(method, endpoint, body = null) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const url = `${this.baseURL}${endpoint}`;
      console.log(`🌐 ${method} ${url}`);

      // Configurar headers base
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      // Agregar Authorization header si hay usuario autenticado
      if (this.userEmail) {
        headers['Authorization'] = this.userEmail;
        console.log('🔐 Authorization header incluido:', this.userEmail.substring(0, 3) + '***');
      } else {
        console.warn('⚠️ No hay email de usuario para Authorization header');
      }

      const config = {
        method,
        headers,
        signal: controller.signal
      };

      if (body) {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      // Verificar status HTTP
      if (!response.ok) {
        return {
          success: false,
          error: `Error HTTP ${response.status}: ${response.statusText}`
        };
      }

      // Parsear JSON
      const data = await response.json();
      
      return {
        success: true,
        data
      };

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.error('❌ Request timeout');
        return {
          success: false,
          error: 'La petición ha expirado. Verifica tu conexión.'
        };
      }

      console.error('❌ Request failed:', error);
      return {
        success: false,
        error: 'Error de conexión. Verifica tu internet.'
      };
    }
  }

  /**
   * **TRANSFORMAR DATOS DE LIBROS** 🔄
   * 
   * Normaliza los datos de la API a nuestro formato interno.
   */
  transformBooksData(books) {
    if (!Array.isArray(books)) {
      console.warn('⚠️ Datos de libros no es array:', books);
      return [];
    }

    return books.map(book => this.transformBookData(book)).filter(Boolean);
  }

  /**
   * **TRANSFORMAR DATOS DE LIBRO INDIVIDUAL** 🔄
   */
  transformBookData(book) {
    if (!book || !book.id) {
      console.warn('⚠️ Datos de libro inválidos:', book);
      return null;
    }

    try {
      // Extraer información de ImageLinks
      const imageLinks = book.imageLinks || {};
      const portadaUrl = imageLinks.thumbnail || 
                        imageLinks.smallThumbnail || 
                        imageLinks.medium || 
                        imageLinks.large || 
                        null;

      // Extraer autores (puede ser array o string)
      let autores = book.authors || [];
      if (typeof autores === 'string') {
        autores = [autores];
      }
      const autor = autores.join(', ') || 'Autor desconocido';

      // Extraer categorías/géneros
      let generos = book.categories || [];
      if (typeof generos === 'string') {
        generos = [generos];
      }

      // Extraer identificadores
      const industryIdentifiers = book.industryIdentifiers || [];
      const isbn = industryIdentifiers.find(id => 
        id.type === 'ISBN_13' || id.type === 'ISBN_10'
      )?.identifier || null;

      // Crear objeto normalizado
      return {
        // Datos básicos
        bookId: book.id,
        titulo: book.title || 'Título no disponible',
        autor,
        
        // Imágenes
        portadaUrl,
        imageLinks: {
          thumbnail: imageLinks.thumbnail,
          small: imageLinks.smallThumbnail,
          medium: imageLinks.medium,
          large: imageLinks.large
        },
        
        // Detalles
        sinopsis: book.description || null,
        anoPublicacion: this.extractYear(book.publishedDate),
        fechaPublicacion: book.publishedDate || null,
        editorial: book.publisher || null,
        idioma: book.language || 'es',
        numeroPaginas: book.pageCount || null,
        
        // Clasificación
        generos,
        categorias: book.categories || [],
        
        // Identificadores
        isbn,
        industryIdentifiers,
        
        // Metadatos
        previewLink: book.previewLink || null,
        infoLink: book.infoLink || null,
        rating: book.averageRating || null,
        ratingsCount: book.ratingsCount || 0,
        
        // Timestamp de transformación para debugging
        transformedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error transformando libro:', error, book);
      return null;
    }
  }

  /**
   * **EXTRAER AÑO DE FECHA** 📅
   */
  extractYear(dateString) {
    if (!dateString) return null;
    
    // Intentar extraer año de diferentes formatos
    const yearMatch = dateString.match(/(\d{4})/);
    return yearMatch ? parseInt(yearMatch[1], 10) : null;
  }

  // ===================================
  // 📦 MANEJO DE CACHE
  // ===================================

  /**
   * **VERIFICAR VALIDEZ DE CACHE** 📦
   */
  isValidCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    const now = Date.now();
    const isValid = (now - cached.timestamp) < this.cacheTimeout;
    
    if (!isValid) {
      this.cache.delete(key);
    }
    
    return isValid;
  }

  /**
   * **GUARDAR EN CACHE** 📦
   */
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // Limpiar cache si tiene muchas entradas
    if (this.cache.size > 100) {
      this.clearOldCache();
    }
  }

  /**
   * **LIMPIAR CACHE ANTIGUO** 🧹
   */
  clearOldCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if ((now - value.timestamp) > this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
    console.log(`🧹 Cache limpiado. Entradas restantes: ${this.cache.size}`);
  }

  /**
   * **LIMPIAR TODO EL CACHE** 🗑️
   */
  clearAllCache() {
    this.cache.clear();
    console.log('🗑️ Todo el cache ha sido limpiado');
  }

  /**
   * **OBTENER ESTADÍSTICAS DE CACHE** 📊
   */
  getCacheStats() {
    const stats = {
      entries: this.cache.size,
      maxSize: 100,
      timeoutMinutes: this.cacheTimeout / (60 * 1000)
    };
    
    console.log('📊 Cache stats:', stats);
    return stats;
  }

  // ===================================
  // 🔧 UTILIDADES Y CONFIGURACIÓN
  // ===================================

  /**
   * **OBTENER CONFIGURACIÓN** ⚙️
   */
  getConfiguration() {
    return {
      baseURL: this.baseURL,
      endpoints: this.endpoints,
      timeout: this.timeout,
      maxResults: this.maxResults,
      cacheTimeout: this.cacheTimeout,
      cacheSize: this.cache.size
    };
  }

  /**
   * **ACTUALIZAR CONFIGURACIÓN** ⚙️
   */
  updateConfiguration(config) {
    if (config.timeout) this.timeout = config.timeout;
    if (config.maxResults) this.maxResults = config.maxResults;
    if (config.cacheTimeout) this.cacheTimeout = config.cacheTimeout;
    
    console.log('⚙️ Configuración actualizada:', this.getConfiguration());
  }

  /**
   * **VALIDAR CONECTIVIDAD** 🌐
   */
  async testConnection() {
    try {
      console.log('🌐 Probando conectividad con Books API...');
      
      const response = await this.makeRequest('GET', this.endpoints.GET_ALL + '?maxResults=1');
      
      if (response.success) {
        console.log('✅ API Books está disponible');
        return { success: true, message: 'Conexión exitosa' };
      } else {
        console.log('❌ API Books no responde correctamente');
        return { success: false, error: response.error };
      }
      
    } catch (error) {
      console.error('❌ Error probando conectividad:', error);
      return { success: false, error: 'Error de conectividad' };
    }
  }
}

// **EXPORTAR INSTANCIA SINGLETON** 🎯
export const booksApiService = new BooksApiService();

// Exportar también la clase para testing
export { BooksApiService };