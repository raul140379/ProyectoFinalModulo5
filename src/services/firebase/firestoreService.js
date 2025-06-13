import { 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  addDoc,
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  serverTimestamp 
} from 'firebase/firestore';

import { getFirebaseFirestore } from './firebaseConfig';

/**
 * **SERVICIO DE FIRESTORE EDUCATIVO** 🗄️
 * 
 * Este servicio demuestra patrones avanzados para trabajar con Firestore:
 * - Repository Pattern para acceso a datos
 * - Query Builder para consultas complejas
 * - Paginación y optimización
 * - Manejo de subcollections
 * - Operaciones batch y transacciones
 * 
 * Conceptos educativos demostrados:
 * - CRUD operations
 * - Consultas complejas con índices
 * - Paginación eficiente
 * - Manejo de errores específicos
 * - Logging para debugging
 */

class FirestoreService {
  constructor() {
    this.db = getFirebaseFirestore();
    console.log('🗄️ FirestoreService inicializado');
  }

  // ===================================
  // 👤 OPERACIONES DE USUARIOS
  // ===================================

  /**
   * **OBTENER USUARIO POR ID** 👤
   */
  async getUser(userId) {
    try {
      console.log('👤 FirestoreService: Obteniendo usuario', userId);
      
      const userDoc = await getDoc(doc(this.db, 'users', userId));
      
      if (userDoc.exists()) {
        return {
          success: true,
          data: { id: userDoc.id, ...userDoc.data() }
        };
      } else {
        return {
          success: false,
          error: 'Usuario no encontrado'
        };
      }
    } catch (error) {
      console.error('❌ Error obteniendo usuario:', error);
      return {
        success: false,
        error: 'Error obteniendo usuario'
      };
    }
  }

  /**
   * **ACTUALIZAR USUARIO** ✏️
   */
  async updateUser(userId, updates) {
    try {
      console.log('✏️ FirestoreService: Actualizando usuario', userId);
      
      const cleanUpdates = {
        ...updates,
        fechaUltimaModificacion: serverTimestamp()
      };

      await updateDoc(doc(this.db, 'users', userId), cleanUpdates);
      
      console.log('✅ Usuario actualizado');
      return { success: true };
    } catch (error) {
      console.error('❌ Error actualizando usuario:', error);
      return {
        success: false,
        error: 'Error actualizando usuario'
      };
    }
  }

  // ===================================
  // 📚 OPERACIONES DE LIBRERÍAS
  // ===================================

  /**
   * **OBTENER LIBRERÍA DEL USUARIO** 📚
   * 
   * Demuestra consultas en subcollections con paginación.
   */
  async getUserLibrary(userId, options = {}) {
    try {
      console.log('📚 FirestoreService: Obteniendo librería para', userId);
      
      const { 
        limitCount = 20, 
        lastDocument = null, 
        orderByField = 'fechaAgregado',
        orderDirection = 'desc'
      } = options;
      //autenticacion del usuario
      //const user = auth.currentUser;
      if (!userId) return;
      // Construir query base
      let queryRef = collection(this.db, 'libraries', userId, 'books');
      

      // Agregar ordenamiento
      queryRef = query(queryRef, orderBy(orderByField, orderDirection));
      
      // Agregar límite
      queryRef = query(queryRef, limit(limitCount));
      
      // Agregar paginación si hay último documento
      if (lastDocument) {
        queryRef = query(queryRef, startAfter(lastDocument));
      }

      const querySnapshot = await getDocs(queryRef);
      
      
      const books = [];
      querySnapshot.forEach((doc) => {
        books.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log(`✅ Obtenidos ${books.length} libros de la librería`);
      
      return {
        success: true,
        data: books,
        lastDocument: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
        hasMore: querySnapshot.docs.length === limitCount
      };

    } catch (error) {
      console.error('❌ Error obteniendo librería:', error);
      return {
        success: false,
        error: 'Error obteniendo librería'
      };
    }
  }

  /**
   * **AGREGAR LIBRO A LIBRERÍA** 📖➕
   * 
   * Demuestra escritura en subcollections con validación.
   */
  async addBookToLibrary(userId, bookData) {
    try {
      console.log('📖➕ FirestoreService: Agregando libro a librería', bookData.titulo);
      
      // Validar datos del libro
      this.validateBookData(bookData);

      // Verificar si el libro ya existe en la librería
      const existingBook = await this.getBookFromLibrary(userId, bookData.bookId);
      if (existingBook.success) {
        return {
          success: false,
          error: 'El libro ya está en tu librería'
        };
      }

      // Preparar datos del libro para Firestore
      const bookDoc = {
        bookId: bookData.bookId,
        titulo: bookData.titulo,
        autor: bookData.autor,
        portadaUrl: bookData.portadaUrl || null,
        sinopsis: bookData.sinopsis || null,
        anoPublicacion: bookData.anoPublicacion || null,
        generos: bookData.generos || [],
        isbn: bookData.isbn || null,
        editorial: bookData.editorial || null,
        fechaAgregado: serverTimestamp(),
        tieneReseña: false
      };

      // Usar ID del libro como ID del documento para facilitar consultas
      await setDoc(
        doc(this.db, 'libraries', userId, 'books', bookData.bookId),
        bookDoc
      );

      console.log('✅ Libro agregado a la librería');
      return { success: true, data: bookDoc };

    } catch (error) {
      console.error('❌ Error agregando libro:', error);
      return {
        success: false,
        error: error.message || 'Error agregando libro'
      };
    }
  }

  /**
   * **OBTENER LIBRO DE LIBRERÍA** 📖
   */
  async getBookFromLibrary(userId, bookId) {
    try {
      const bookDoc = await getDoc(
        doc(this.db, 'libraries', userId, 'books', bookId)
      );
      
      if (bookDoc.exists()) {
        return {
          success: true,
          data: { id: bookDoc.id, ...bookDoc.data() }
        };
      } else {
        return {
          success: false,
          error: 'Libro no encontrado en la librería'
        };
      }
    } catch (error) {
      console.error('❌ Error obteniendo libro:', error);
      return {
        success: false,
        error: 'Error obteniendo libro'
      };
    }
  }

  /**
   * **ELIMINAR LIBRO DE LIBRERÍA** 📖❌
   */
  async removeBookFromLibrary(userId, bookId) {
    try {
      console.log('📖❌ FirestoreService: Eliminando libro', bookId);
      
      await deleteDoc(doc(this.db, 'libraries', userId, 'books', bookId));
      
      console.log('✅ Libro eliminado de la librería');
      return { success: true };

    } catch (error) {
      console.error('❌ Error eliminando libro:', error);
      return {
        success: false,
        error: 'Error eliminando libro'
      };
    }
  }

  // ===================================
  // ⭐ OPERACIONES DE RESEÑAS
  // ===================================

  /**
   * **CREAR/ACTUALIZAR RESEÑA** ⭐
   * 
   * Demuestra operaciones con referencias entre documentos.
   */
  async saveReview(userId, bookId, reviewData) {
    try {
      console.log('⭐ FirestoreService: Guardando reseña para libro', bookId);
      
      // Validar datos de la reseña
      this.validateReviewData(reviewData);

      // Verificar si ya existe una reseña
      const existingReview = await this.getUserReviewForBook(userId, bookId);
      
      const reviewDoc = {
        userId,
        bookId,
        calificacion: reviewData.calificacion,
        textoReseña: reviewData.textoReseña,
        fechaModificacion: serverTimestamp()
      };

      let reviewId;
      
      if (existingReview.success) {
        // Actualizar reseña existente
        reviewId = existingReview.data.id;
        await updateDoc(doc(this.db, 'reviews', reviewId), reviewDoc);
        console.log('✅ Reseña actualizada');
      } else {
        // Crear nueva reseña
        reviewDoc.fechaCreacion = serverTimestamp();
        const docRef = await addDoc(collection(this.db, 'reviews'), reviewDoc);
        reviewId = docRef.id;
        console.log('✅ Nueva reseña creada');
      }

      // Actualizar flag en el libro de la librería
      await this.updateBookReviewStatus(userId, bookId, true);

      return { 
        success: true, 
        data: { id: reviewId, ...reviewDoc } 
      };

    } catch (error) {
      console.error('❌ Error guardando reseña:', error);
      return {
        success: false,
        error: error.message || 'Error guardando reseña'
      };
    }
  }

  /**
   * **OBTENER RESEÑA DEL USUARIO PARA UN LIBRO** ⭐
   */
  async getUserReviewForBook(userId, bookId) {
    try {
      const q = query(
        collection(this.db, 'reviews'),
        where('userId', '==', userId),
        where('bookId', '==', bookId),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          success: true,
          data: { id: doc.id, ...doc.data() }
        };
      } else {
        return {
          success: false,
          error: 'Reseña no encontrada'
        };
      }
    } catch (error) {
      console.error('❌ Error obteniendo reseña:', error);
      return {
        success: false,
        error: 'Error obteniendo reseña'
      };
    }
  }

  /**
   * **OBTENER RESEÑAS DE UN LIBRO** ⭐
   * 
   * Demuestra consultas con ordenamiento y paginación.
   */
  async getBookReviews(bookId, options = {}) {
    try {
      console.log('⭐ FirestoreService: Obteniendo reseñas para libro', bookId);
      
      const { limitCount = 10, lastDocument = null } = options;

      let q = query(
        collection(this.db, 'reviews'),
        where('bookId', '==', bookId),
        orderBy('fechaCreacion', 'desc'),
        limit(limitCount)
      );

      if (lastDocument) {
        q = query(q, startAfter(lastDocument));
      }

      const querySnapshot = await getDocs(q);
      
      const reviews = [];
      querySnapshot.forEach((doc) => {
        reviews.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log(`✅ Obtenidas ${reviews.length} reseñas`);
      
      return {
        success: true,
        data: reviews,
        lastDocument: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
        hasMore: querySnapshot.docs.length === limitCount
      };

    } catch (error) {
      console.error('❌ Error obteniendo reseñas:', error);
      return {
        success: false,
        error: 'Error obteniendo reseñas'
      };
    }
  }

  /**
   * **OBTENER RESEÑAS DEL USUARIO** ⭐
   */
  async getUserReviews(userId, options = {}) {
    try {
      console.log('⭐ FirestoreService: Obteniendo reseñas del usuario', userId);
      
      const { limitCount = 10, lastDocument = null } = options;

      let q = query(
        collection(this.db, 'reviews'),
        where('userId', '==', userId),
        orderBy('fechaCreacion', 'desc'),
        limit(limitCount)
      );

      if (lastDocument) {
        q = query(q, startAfter(lastDocument));
      }

      const querySnapshot = await getDocs(q);
      
      const reviews = [];
      querySnapshot.forEach((doc) => {
        reviews.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log(`✅ Obtenidas ${reviews.length} reseñas del usuario`);
      
      return {
        success: true,
        data: reviews,
        lastDocument: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
        hasMore: querySnapshot.docs.length === limitCount
      };

    } catch (error) {
      console.error('❌ Error obteniendo reseñas del usuario:', error);
      return {
        success: false,
        error: 'Error obteniendo reseñas del usuario'
      };
    }
  }

  /**
   * **ELIMINAR RESEÑA** ⭐❌
   */
  async deleteReview(reviewId, userId, bookId) {
    try {
      console.log('⭐❌ FirestoreService: Eliminando reseña', reviewId);
      
      await deleteDoc(doc(this.db, 'reviews', reviewId));
      
      // Actualizar flag en el libro de la librería
      await this.updateBookReviewStatus(userId, bookId, false);
      
      console.log('✅ Reseña eliminada');
      return { success: true };

    } catch (error) {
      console.error('❌ Error eliminando reseña:', error);
      return {
        success: false,
        error: 'Error eliminando reseña'
      };
    }
  }

  // ===================================
  // 🛠️ FUNCIONES AUXILIARES
  // ===================================

  /**
   * **ACTUALIZAR ESTADO DE RESEÑA EN LIBRO** 🛠️
   */
  async updateBookReviewStatus(userId, bookId, hasReview) {
    try {
      await updateDoc(
        doc(this.db, 'libraries', userId, 'books', bookId),
        { tieneReseña: hasReview }
      );
    } catch (error) {
      console.warn('⚠️ No se pudo actualizar estado de reseña:', error);
      // No lanzar error, es una operación secundaria
    }
  }

  /**
   * **VALIDAR DATOS DE LIBRO** ✅
   */
  validateBookData(bookData) {
    if (!bookData.bookId) {
      throw new Error('ID del libro es requerido');
    }
    if (!bookData.titulo) {
      throw new Error('Título del libro es requerido');
    }
    if (!bookData.autor) {
      throw new Error('Autor del libro es requerido');
    }
  }

  /**
   * **VALIDAR DATOS DE RESEÑA** ✅
   */
  validateReviewData(reviewData) {
    if (!reviewData.calificacion || reviewData.calificacion < 1 || reviewData.calificacion > 5) {
      throw new Error('Calificación debe ser entre 1 y 5 estrellas');
    }
    if (!reviewData.textoReseña || reviewData.textoReseña.trim().length < 10) {
      throw new Error('El texto de la reseña debe tener al menos 10 caracteres');
    }
    if (reviewData.textoReseña.length > 1000) {
      throw new Error('El texto de la reseña no puede exceder 1000 caracteres');
    }
  }

  /**
   * **OBTENER ESTADÍSTICAS DEL USUARIO** 📊
   * 
   * Demuestra agregaciones simples (en producción usar Cloud Functions).
   */
  async getUserStats(userId) {
    try {
      console.log('📊 FirestoreService: Obteniendo estadísticas para', userId);
      
      // Contar libros en la librería
      const librarySnapshot = await getDocs(
        collection(this.db, 'libraries', userId, 'books')
      );
      
      // Contar reseñas del usuario
      const reviewsSnapshot = await getDocs(
        query(collection(this.db, 'reviews'), where('userId', '==', userId))
      );

      const stats = {
        totalLibros: librarySnapshot.size,
        totalReseñas: reviewsSnapshot.size,
        promedioCalificacion: 0
      };

      // Calcular promedio de calificaciones
      if (reviewsSnapshot.size > 0) {
        let sumaCalificaciones = 0;
        reviewsSnapshot.forEach((doc) => {
          sumaCalificaciones += doc.data().calificacion;
        });
        stats.promedioCalificacion = sumaCalificaciones / reviewsSnapshot.size;
      }

      console.log('✅ Estadísticas obtenidas:', stats);
      return { success: true, data: stats };

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return {
        success: false,
        error: 'Error obteniendo estadísticas'
      };
    }
  }

  // ===================================
  // 🔧 MÉTODOS ADICIONALES REQUERIDOS
  // ===================================

  /**
   * **ACTUALIZAR LIBRO EN LIBRERÍA** 📖✏️
   */
  async updateBookInLibrary(userId, bookId, updateData) {
    try {
      console.log('📖✏️ FirestoreService: Actualizando libro en librería', bookId);
      
      await updateDoc(
        doc(this.db, 'libraries', userId, 'books', bookId),
        {
          ...updateData,
          fechaActualizacion: serverTimestamp()
        }
      );
      
      console.log('✅ Libro actualizado en la librería');
      return { success: true };

    } catch (error) {
      console.error('❌ Error actualizando libro:', error);
      return {
        success: false,
        error: 'Error actualizando libro en la librería'
      };
    }
  }

  /**
   * **CREAR RESEÑA** ⭐➕
   */
  async createReview(reviewData) {
    try {
      console.log('⭐➕ FirestoreService: Creando nueva reseña');
      console.log('Datos de reseña:', reviewData);
      
      // Validar campos requeridos
      if (!reviewData.userId) {
        throw new Error('userId es requerido');
      }
      if (!reviewData.bookId) {
        throw new Error('bookId es requerido');
      }
      if (!reviewData.calificacion || reviewData.calificacion < 1 || reviewData.calificacion > 5) {
        throw new Error('calificacion debe estar entre 1 y 5');
      }
      if (!reviewData.texto || reviewData.texto.trim().length < 10) {
        throw new Error('texto debe tener al menos 10 caracteres');
      }
      
      const reviewDoc = {
        ...reviewData,
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp()
      };

      const docRef = await addDoc(collection(this.db, 'reviews'), reviewDoc);
      
      console.log('✅ Reseña creada con ID:', docRef.id);
      return { success: true, data: { id: docRef.id, ...reviewDoc } };

    } catch (error) {
      console.error('❌ Error creando reseña:', error);
      return {
        success: false,
        error: error.message || 'Error creando reseña'
      };
    }
  }

  /**
   * **ACTUALIZAR RESEÑA** ⭐✏️
   */
  async updateReview(reviewId, updateData) {
    try {
      console.log('⭐✏️ FirestoreService: Actualizando reseña', reviewId);
      
      await updateDoc(
        doc(this.db, 'reviews', reviewId),
        {
          ...updateData,
          fechaActualizacion: serverTimestamp()
        }
      );
      
      console.log('✅ Reseña actualizada');
      return { success: true };

    } catch (error) {
      console.error('❌ Error actualizando reseña:', error);
      return {
        success: false,
        error: 'Error actualizando reseña'
      };
    }
  }

  /**
   * **ELIMINAR RESEÑA (SOBRESCRIBIR MÉTODO)** ⭐❌
   */
  async deleteReview(reviewId) {
    try {
      console.log('⭐❌ FirestoreService: Eliminando reseña', reviewId);
      
      await deleteDoc(doc(this.db, 'reviews', reviewId));
      
      console.log('✅ Reseña eliminada');
      return { success: true };

    } catch (error) {
      console.error('❌ Error eliminando reseña:', error);
      return {
        success: false,
        error: 'Error eliminando reseña'
      };
    }
  }

  /**
   * **ACTUALIZAR PERFIL DE USUARIO** 👤✏️
   */
  async updateUserProfile(userId, updateData) {
    try {
      console.log('👤✏️ FirestoreService: Actualizando perfil de usuario', userId);
      
      await updateDoc(
        doc(this.db, 'users', userId),
        {
          ...updateData,
          fechaActualizacion: serverTimestamp()
        }
      );
      
      console.log('✅ Perfil de usuario actualizado');
      return { success: true };

    } catch (error) {
      console.error('❌ Error actualizando perfil:', error);
      return {
        success: false,
        error: 'Error actualizando perfil de usuario'
      };
    }
  }
}

// **EXPORTAR INSTANCIA SINGLETON** 🎯
export const firestoreService = new FirestoreService();

// Exportar también la clase para testing
export { FirestoreService };