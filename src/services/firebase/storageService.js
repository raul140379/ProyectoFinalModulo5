import { 
  ref, 
  uploadBytes, 
  uploadBytesResumable,
  getDownloadURL, 
  deleteObject,
  getMetadata 
} from 'firebase/storage';

import { getFirebaseStorage } from './firebaseConfig';

/**
 * **SERVICIO DE FIREBASE STORAGE EDUCATIVO** 📁
 * 
 * Este servicio demuestra cómo trabajar con Firebase Storage para:
 * - Subida de archivos con progress tracking
 * - Gestión de fotos de perfil
 * - Optimización de imágenes
 * - Manejo de metadatos
 * - Eliminación segura de archivos
 * 
 * Patrones educativos demostrados:
 * - File upload with progress
 * - Error handling específico para Storage
 * - Validación de tipos de archivo
 * - Organización de archivos por carpetas
 * - Cleanup de archivos huérfanos
 */

class StorageService {
  constructor() {
    this.storage = getFirebaseStorage();
    
    // Configuraciones para archivos
    this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.profileImagePath = 'profile-images';
    this.tempImagePath = 'temp-images';
    
    console.log('📁 StorageService inicializado');
  }

  // ===================================
  // 🖼️ GESTIÓN DE FOTOS DE PERFIL
  // ===================================

  /**
   * **SUBIR FOTO DE PERFIL** 🖼️⬆️
   * 
   * Sube una foto de perfil con validación y progress tracking.
   * Demuestra upload con monitoreo de progreso.
   */
  async cargarProfileImage(userId, imageUri){
    try {
      console.log('🖼️⬆️ StorageService: Subiendo foto de perfil para', userId);
      ///Paso alternativo
        
       // Obtener el blob del archivo
          const response = await fetch(imageUri);
         const blob = await response.blob();
      
      // Validar el archivo
      this.validateImageFile(blob);

      const imageRef = ref(this.storage, `profile_images/${userId.uid}.jpg`);
      await uploadBytes(imageRef, blob);      
      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL
      /* return {
        success: true,
        data: { downloadURL }
       
      }; */

    }catch (error) {
      console.error('❌ Error subiendo foto de perfil:', error);
      return {
        success: false,
        error: error.message || 'Error subiendo imagen'
      };
    }

  }
  async uploadProfileImage(userId, imageUri, onProgress = null) {
    try {
      console.log('🖼️⬆️ StorageService: Subiendo foto de perfil para', userId);
      
      // Obtener el blob del archivo
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Validar el archivo
      this.validateImageFile(blob);
      
      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const extension = this.getFileExtension(blob.type);
      const fileName = `profile_${timestamp}.${extension}`;
      
      // Crear referencia al archivo
      const storageRef = ref(
        this.storage, 
        `${this.profileImagePath}/${userId}/${fileName}`
      );
      
      // Configurar metadatos
      const metadata = {
        contentType: blob.type,
        customMetadata: {
          uploadedBy: userId,
          uploadDate: new Date().toISOString(),
          purpose: 'profile-image'
        }
      };

      // Subir archivo con tracking de progreso
      const uploadTask = uploadBytesResumable(storageRef, blob, metadata);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          // Progress callback
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`📊 Progress: ${progress.toFixed(1)}%`);
            
            if (onProgress) {
              onProgress(progress);
            }
          },
          // Error callback
          (error) => {
            console.error('❌ Error en upload:', error);
            reject({
              success: false,
              error: this.handleStorageError(error)
            });
          },
          // Success callback
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              
              console.log('✅ Foto de perfil subida exitosamente');
              resolve({
                success: true,
                data: {
                  downloadURL,
                  fileName,
                  path: uploadTask.snapshot.ref.fullPath,
                  size: uploadTask.snapshot.totalBytes
                }
              });
            } catch (error) {
              reject({
                success: false,
                error: 'Error obteniendo URL de descarga'
              });
            }
          }
        );
      });

    } catch (error) {
      console.error('❌ Error subiendo foto de perfil:', error);
      return {
        success: false,
        error: error.message || 'Error subiendo imagen'
      };
    }
  }

  /**
   * **OBTENER URL DE FOTO DE PERFIL** 🖼️📥
   */
  async getProfileImageURL(userId, fileName) {
    try {
      console.log('🖼️📥 StorageService: Obteniendo URL de foto de perfil');
      
      const storageRef = ref(
        this.storage, 
        `${this.profileImagePath}/${userId}/${fileName}`
      );
      
      const downloadURL = await getDownloadURL(storageRef);
      
      return {
        success: true,
        data: { downloadURL }
      };

    } catch (error) {
      console.error('❌ Error obteniendo URL de foto:', error);
      return {
        success: false,
        error: this.handleStorageError(error)
      };
    }
  }

  /**
   * **ELIMINAR FOTO DE PERFIL ANTERIOR** 🖼️🗑️
   * 
   * Elimina la foto de perfil anterior para evitar archivos huérfanos.
   */
  async deleteProfileImage(userId, fileName) {
    try {
      console.log('🖼️🗑️ StorageService: Eliminando foto de perfil anterior');
      
      const storageRef = ref(
        this.storage, 
        `${this.profileImagePath}/${userId}/${fileName}`
      );
      
      await deleteObject(storageRef);
      
      console.log('✅ Foto anterior eliminada');
      return { success: true };

    } catch (error) {
      console.error('❌ Error eliminando foto anterior:', error);
      // No lanzar error, es una operación de limpieza
      return {
        success: false,
        error: this.handleStorageError(error)
      };
    }
  }

  // ===================================
  // 📄 GESTIÓN DE ARCHIVOS TEMPORALES
  // ===================================

  /**
   * **SUBIR IMAGEN TEMPORAL** 📄⬆️
   * 
   * Para previews o archivos temporales durante el desarrollo.
   */
  async uploadTempImage(imageUri, onProgress = null) {
    try {
      console.log('📄⬆️ StorageService: Subiendo imagen temporal');
      
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      this.validateImageFile(blob);
      
      const timestamp = Date.now();
      const extension = this.getFileExtension(blob.type);
      const fileName = `temp_${timestamp}.${extension}`;
      
      const storageRef = ref(
        this.storage, 
        `${this.tempImagePath}/${fileName}`
      );
      
      // Upload simple sin metadatos complejos
      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('✅ Imagen temporal subida');
      return {
        success: true,
        data: {
          downloadURL,
          fileName,
          path: snapshot.ref.fullPath
        }
      };

    } catch (error) {
      console.error('❌ Error subiendo imagen temporal:', error);
      return {
        success: false,
        error: error.message || 'Error subiendo imagen temporal'
      };
    }
  }

  // ===================================
  // 📊 METADATOS Y INFORMACIÓN
  // ===================================

  /**
   * **OBTENER METADATOS DE ARCHIVO** 📊
   */
  async getFileMetadata(filePath) {
    try {
      console.log('📊 StorageService: Obteniendo metadatos de', filePath);
      
      const storageRef = ref(this.storage, filePath);
      const metadata = await getMetadata(storageRef);
      
      return {
        success: true,
        data: {
          name: metadata.name,
          size: metadata.size,
          contentType: metadata.contentType,
          timeCreated: metadata.timeCreated,
          updated: metadata.updated,
          customMetadata: metadata.customMetadata
        }
      };

    } catch (error) {
      console.error('❌ Error obteniendo metadatos:', error);
      return {
        success: false,
        error: this.handleStorageError(error)
      };
    }
  }

  // ===================================
  // 🛠️ FUNCIONES DE VALIDACIÓN Y UTILIDAD
  // ===================================

  /**
   * **VALIDAR ARCHIVO DE IMAGEN** ✅
   */
  validateImageFile(blob) {
    // Validar tipo de archivo
    if (!this.allowedImageTypes.includes(blob.type)) {
      throw new Error(
        `Tipo de archivo no permitido. Tipos permitidos: ${this.allowedImageTypes.join(', ')}`
      );
    }

    // Validar tamaño
    if (blob.size > this.maxFileSize) {
      const maxSizeMB = (this.maxFileSize / (1024 * 1024)).toFixed(1);
      throw new Error(`El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`);
    }

    // Validar que realmente sea una imagen (verificación básica)
    if (blob.size === 0) {
      throw new Error('El archivo está vacío');
    }

    console.log('✅ Archivo validado correctamente');
  }

  /**
   * **OBTENER EXTENSIÓN DE ARCHIVO** 📎
   */
  getFileExtension(mimeType) {
    const extensions = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp'
    };
    
    return extensions[mimeType] || 'jpg';
  }

  /**
   * **GENERAR PATH ÚNICO** 🔗
   */
  generateUniqueFileName(userId, prefix = 'file', extension = 'jpg') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}_${userId}_${timestamp}_${random}.${extension}`;
  }

  /**
   * **FORMATEAR TAMAÑO DE ARCHIVO** 📏
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * **MANEJO DE ERRORES DE STORAGE** 🚨
   */
  handleStorageError(error) {
    console.log('🚨 Código de error Storage:', error.code);

    const errorMessages = {
      // Errores de permisos
      'storage/unauthorized': 'No tienes permisos para acceder a este archivo',
      'storage/canceled': 'Operación cancelada por el usuario',
      
      // Errores de archivo
      'storage/unknown': 'Error desconocido del servidor',
      'storage/object-not-found': 'Archivo no encontrado',
      'storage/bucket-not-found': 'Bucket de storage no encontrado',
      'storage/project-not-found': 'Proyecto no encontrado',
      
      // Errores de cuota
      'storage/quota-exceeded': 'Cuota de almacenamiento excedida',
      'storage/unauthenticated': 'Usuario no autenticado',
      
      // Errores de red
      'storage/retry-limit-exceeded': 'Límite de reintentos excedido',
      'storage/invalid-checksum': 'Checksum del archivo inválido',
      'storage/canceled': 'Upload cancelado',
      
      // Errores de configuración
      'storage/invalid-event-name': 'Nombre de evento inválido',
      'storage/invalid-url': 'URL inválida',
      'storage/invalid-argument': 'Argumento inválido',
      'storage/no-default-bucket': 'No hay bucket por defecto configurado',
      'storage/cannot-slice-blob': 'No se puede procesar el archivo',
      'storage/server-file-wrong-size': 'Tamaño de archivo incorrecto'
    };

    return errorMessages[error.code] || error.message || 'Error de almacenamiento';
  }

  /**
   * **LIMPIAR ARCHIVOS TEMPORALES** 🧹
   * 
   * Función para limpiar archivos temporales (usar con Cloud Functions en producción).
   */
  async cleanupTempFiles(olderThanHours = 24) {
    console.log(`🧹 StorageService: Limpieza de archivos temporales (older than ${olderThanHours}h)`);
    
    // En una implementación real, esto se haría con Cloud Functions
    // y Storage triggers para eliminar archivos automáticamente
    
    console.log('ℹ️ La limpieza automática requiere Cloud Functions en producción');
  }

  /**
   * **OBTENER CONFIGURACIÓN ACTUAL** ⚙️
   */
  getConfiguration() {
    return {
      allowedTypes: this.allowedImageTypes,
      maxFileSize: this.maxFileSize,
      maxFileSizeFormatted: this.formatFileSize(this.maxFileSize),
      profileImagePath: this.profileImagePath,
      tempImagePath: this.tempImagePath
    };
  }
}

// **EXPORTAR INSTANCIA SINGLETON** 🎯
export const storageService = new StorageService();

// Exportar también la clase para testing
export { StorageService };