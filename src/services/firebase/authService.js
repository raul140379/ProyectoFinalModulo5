import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

import { getFirebaseAuth, getFirebaseFirestore } from './firebaseConfig';
//import { getFirebaseStorage } from './firebaseConfig';

/**
 * **SERVICIO DE AUTENTICACIÓN EDUCATIVO** 🔐
 * 
 * Este servicio demuestra el patrón Service Layer para abstraer
 * la lógica de Firebase Authentication y proporcionar una API
 * limpia para los componentes de la aplicación.
 * 
 * Patrones educativos demostrados:
 * - Service Layer Pattern
 * - Error Handling centralizado
 * - Logging para debugging
 * - Validación de datos
 * - Sincronización Auth + Firestore
 */

class AuthService {
  constructor() {
    this.auth = getFirebaseAuth();
    this.db = getFirebaseFirestore();
    //this.storage = getFirebaseStorage();
    
    console.log('🔐 AuthService inicializado');
  }

  /**
   * **INICIAR SESIÓN** 🔑
   * 
   * Autentica al usuario y actualiza su última actividad.
   * Demuestra manejo de errores específicos de Firebase.
   */
  async signIn(email, password) {
    try {
      console.log('🔐 AuthService: Iniciando sesión para', email);
      
      // Validaciones básicas
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }

      // Autenticar con Firebase
      const userCredential = await signInWithEmailAndPassword(
        this.auth, 
        email, 
        password
      );

      const user = userCredential.user;
      console.log('✅ Usuario autenticado:', user.uid);

      // Actualizar última actividad en Firestore
      await this.updateLastActivity(user.uid);

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }
      };

    } catch (error) {
      console.error('❌ Error en signIn:', error);
      return {
        success: false,
        error: this.handleAuthError(error)
      };
    }
  }

  /**
   * **REGISTRAR USUARIO** 📝
   * 
   * Crea una nueva cuenta y perfil de usuario.
   * Demuestra transacciones entre Auth y Firestore.
   */
  async signUp(email, password, profileData = {}) {
    try {
      console.log('📝 AuthService: Registrando usuario', email);

      // Validaciones
      this.validateSignUpData(email, password, profileData);

      // Crear cuenta en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      const user = userCredential.user;
      console.log('✅ Cuenta creada:', user.uid);

      // Actualizar perfil en Auth si hay displayName
      if (profileData.nombre && profileData.apellido) {
        const displayName = `${profileData.nombre} ${profileData.apellido}`;
        await updateProfile(user, { displayName });
      }

      // Crear documento de usuario en Firestore
      await this.createUserProfile(user.uid, {
        email: user.email,
        ...profileData
      });

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        }
      };

    } catch (error) {
      console.error('❌ Error en signUp:', error);
      return {
        success: false,
        error: this.handleAuthError(error)
      };
    }
  }

  /**
   * **CERRAR SESIÓN** 👋
   * 
   * Cierra la sesión del usuario actual.
   */
  async signOut() {
    try {
      console.log('👋 AuthService: Cerrando sesión');
      
      await signOut(this.auth);
      
      console.log('✅ Sesión cerrada');
      return { success: true };

    } catch (error) {
      console.error('❌ Error en signOut:', error);
      return {
        success: false,
        error: 'Error cerrando sesión'
      };
    }
  }

  /**
   * **RECUPERAR CONTRASEÑA** 🔐
   * 
   * Envía email de recuperación de contraseña.
   */
  async resetPassword(email) {
    try {
      console.log('📧 AuthService: Enviando reset para', email);

      if (!email) {
        throw new Error('Email es requerido');
      }

      await sendPasswordResetEmail(this.auth, email);
      
      console.log('✅ Email de recuperación enviado');
      return { success: true };

    } catch (error) {
      console.error('❌ Error en resetPassword:', error);
      return {
        success: false,
        error: this.handleAuthError(error)
      };
    }
  }

  /**
   * **CREAR PERFIL DE USUARIO** 👤
   * 
   * Crea el documento de usuario en Firestore.
   * Demuestra estructura de datos consistente.
   */
  async createUserProfile(userId, userData) {
    try {
      console.log('👤 AuthService: Creando perfil para', userId);

      const userProfile = {
        email: userData.email,
        nombre: userData.nombre || '',
        apellido: userData.apellido || '',
        fotoPerfilUrl: null,
        fechaCreacion: serverTimestamp(),
        fechaUltimaActividad: serverTimestamp(),
        // Campos adicionales opcionales
        telefono: userData.telefono || null,
        fechaNacimiento: userData.fechaNacimiento || null,
        genero: userData.genero || null
      };

      await setDoc(doc(this.db, 'users', userId), userProfile);
      
      console.log('✅ Perfil de usuario creado');
      return userProfile;

    } catch (error) {
      console.error('❌ Error creando perfil:', error);
      throw error;
    }
  }

  /**
   * **OBTENER PERFIL DE USUARIO** 👤
   * 
   * Obtiene el perfil del usuario desde Firestore.
   */
  async getUserProfile(userId) {
    try {
      console.log('👤 AuthService: Obteniendo perfil para', userId);

      const userDoc = await getDoc(doc(this.db, 'users', userId));
      
      if (userDoc.exists()) {
        const profileData = userDoc.data();
        console.log('✅ Perfil obtenido');
        return {
          success: true,
          profile: profileData
        };
      } else {
        console.log('⚠️ Perfil no encontrado');
        return {
          success: false,
          error: 'Perfil no encontrado'
        };
      }

    } catch (error) {
      console.error('❌ Error obteniendo perfil:', error);
      return {
        success: false,
        error: 'Error obteniendo perfil'
      };
    }
  }

  /**
   * **ACTUALIZAR PERFIL** ✏️
   * 
   * Actualiza los datos del perfil del usuario.
   */
  async updateUserProfile(userId, updates) {
    try {
      console.log('✏️ AuthService: Actualizando perfil para', userId);

      // Validar updates
      const allowedFields = ['nombre', 'apellido', 'telefono', 'fechaNacimiento', 'genero'];
      const cleanUpdates = {};
      
      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          cleanUpdates[key] = value;
        }
      }

      // Agregar timestamp de modificación
      cleanUpdates.fechaUltimaModificacion = serverTimestamp();

      await updateDoc(doc(this.db, 'users', userId), cleanUpdates);
      
      console.log('✅ Perfil actualizado');
      return { success: true };

    } catch (error) {
      console.error('❌ Error actualizando perfil:', error);
      return {
        success: false,
        error: 'Error actualizando perfil'
      };
    }
  }

  /**
   * **ACTUALIZAR ÚLTIMA ACTIVIDAD** ⏰
   * 
   * Actualiza el timestamp de última actividad del usuario.
   */
  async updateLastActivity(userId) {
    try {
      await updateDoc(doc(this.db, 'users', userId), {
        fechaUltimaActividad: serverTimestamp()
      });
    } catch (error) {
      console.warn('⚠️ No se pudo actualizar última actividad:', error);
      // No lanzar error, es una operación secundaria
    }
  }

  /**
   * **VALIDAR DATOS DE REGISTRO** ✅
   * 
   * Valida los datos antes del registro.
   * Demuestra validación del lado del cliente.
   */
  validateSignUpData(email, password, profileData) {
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw new Error('Email inválido');
    }

    // Validar contraseña
    if (!password || password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    // Validar nombre y apellido si se proporcionan
    if (profileData.nombre && profileData.nombre.length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }

    if (profileData.apellido && profileData.apellido.length < 2) {
      throw new Error('El apellido debe tener al menos 2 caracteres');
    }
  }

  /**
   * **MANEJO DE ERRORES DE FIREBASE** 🚨
   * 
   * Convierte códigos de error de Firebase a mensajes amigables.
   * Patrón educativo para manejo centralizado de errores.
   */
  handleAuthError(error) {
    console.log('🚨 Código de error Firebase:', error.code);

    const errorMessages = {
      // Errores de autenticación
      'auth/user-not-found': 'No existe una cuenta con este email',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-email': 'Email inválido',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
      'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde',
      
      // Errores de registro
      'auth/email-already-in-use': 'Ya existe una cuenta con este email',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/operation-not-allowed': 'Operación no permitida',
      
      // Errores de red
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
      'auth/timeout': 'La operación ha expirado. Intenta de nuevo',
      
      // Errores generales
      'auth/invalid-credential': 'Credenciales inválidas',
      'auth/account-exists-with-different-credential': 'Ya existe una cuenta con este email'
    };

    return errorMessages[error.code] || error.message || 'Error desconocido';
  }

  /**
   * **OBTENER USUARIO ACTUAL** 👤
   * 
   * Retorna el usuario actualmente autenticado.
   */
  getCurrentUser() {
    return this.auth.currentUser;
  }

  /**
   * **VERIFICAR SI EL USUARIO ESTÁ AUTENTICADO** ✅
   * 
   * Retorna true si hay un usuario autenticado.
   */
  isAuthenticated() {
    return !!this.auth.currentUser;
  }
}

// **EXPORTAR INSTANCIA SINGLETON** 🎯
// Crear una sola instancia del servicio para toda la app
export const authService = new AuthService();

// Exportar también la clase para testing
export { AuthService };