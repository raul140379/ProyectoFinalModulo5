import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

import { getFirebaseAuth, getFirebaseFirestore, getFirebaseStorage } from '../services/firebase/firebaseConfig';

import { booksApiService } from '../services/api/booksApiService';

/**
 * **CONTEXT DE AUTENTICACIÓN EDUCATIVO** 👤
 * 
 * Este Context demuestra cómo manejar la autenticación de usuarios
 * con Firebase Auth y sincronizar datos de perfil con Firestore.
 * 
 * Conceptos educativos demostrados:
 * - Context API para estado global
 * - Firebase Authentication
 * - Sincronización Auth + Firestore
 * - Manejo de estados de carga
 * - Gestión de errores
 */

// Crear el contexto
const AuthContext = createContext({});

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

/**
 * **PROVIDER DE AUTENTICACIÓN** 🔐
 * 
 * Componente que envuelve la app y proporciona funcionalidades de autenticación.
 */
export const AuthProvider = ({ children }) => {
  // **ESTADO DEL CONTEXTO** 📊
  const [user, setUser] = useState(null);              // Usuario actual de Firebase
  const [userProfile, setUserProfile] = useState(null); // Perfil desde Firestore
  const [loading, setLoading] = useState(true);         // Estado de carga inicial
  const [error, setError] = useState(null);             // Errores de autenticación

  // Instancias de Firebase
  const auth = getFirebaseAuth();
  const db = getFirebaseFirestore(); 

  /**
   * **EFECTO DE ESCUCHA DE AUTENTICACIÓN** 👂
   * 
   * Se ejecuta cuando cambia el estado de autenticación del usuario.
   * Demuestra el patrón de observer con Firebase Auth.
   */
  useEffect(() => {
    console.log('🔐 Configurando listener de autenticación...');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          console.log('✅ Usuario autenticado:', firebaseUser.email);
          setUser(firebaseUser);
          
          // Configurar email en BooksApiService para autorización
          booksApiService.setUserEmail(firebaseUser.email);
          
          // Cargar perfil del usuario desde Firestore
          await loadUserProfile(firebaseUser.uid);
          
          // Actualizar última actividad
          await updateLastActivity(firebaseUser.uid);
          
        } else {
          console.log('👋 Usuario no autenticado');
          setUser(null);
          setUserProfile(null);
          
          // Limpiar autorización en BooksApiService
          booksApiService.clearAuthorization();
        }
      } catch (error) {
        console.error('❌ Error en listener de auth:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup del listener
    return () => {
      console.log('🧹 Limpiando listener de autenticación');
      unsubscribe();
    };
  }, []);

  /**
   * **CARGAR PERFIL DE USUARIO** 👤
   * 
   * Obtiene los datos del perfil desde Firestore.
   * Demuestra cómo sincronizar Auth con Firestore.
   */
  const loadUserProfile = async (userId) => {
    try {
      console.log('📄 Cargando perfil del usuario:', userId);
      
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const profileData = userDoc.data();
        setUserProfile(profileData);
        console.log('✅ Perfil cargado:', profileData.email);
      } else {
        console.log('⚠️ Perfil no encontrado, creando perfil básico...');
        // Si no existe perfil, crear uno básico
        await createUserProfile(userId);
      }
    } catch (error) {
      console.error('❌ Error cargando perfil:', error);
      throw error;
    }
  };

  /**
   * **CREAR PERFIL DE USUARIO** 👤➕
   * 
   * Crea un nuevo perfil en Firestore cuando un usuario se registra.
   */
  const createUserProfile = async (userId, additionalData = {}) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No hay usuario autenticado');

      const userProfile = {
        email: user.email,
        nombre: additionalData.nombre || '',
        apellido: additionalData.apellido || '',
        fotoPerfilUrl: null,
        fechaCreacion: serverTimestamp(),
        fechaUltimaActividad: serverTimestamp(),
        ...additionalData
      };

      await setDoc(doc(db, 'users', userId), userProfile);
      setUserProfile(userProfile);
      
      console.log('✅ Perfil de usuario creado');
      return userProfile;
    } catch (error) {
      console.error('❌ Error creando perfil:', error);
      throw error;
    }
  };

  /**
   * **ACTUALIZAR ÚLTIMA ACTIVIDAD** ⏰
   * 
   * Actualiza el timestamp de última actividad del usuario.
   */
  const updateLastActivity = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        fechaUltimaActividad: serverTimestamp()
      });
    } catch (error) {
      console.warn('⚠️ No se pudo actualizar última actividad:', error);
      // No lanzar error, es una operación secundaria
    }
  };

/**Actualizar Photo de Usuario */
   const updatePhotoUser = async (userId,PhotoURL) => {
    try {
        await updateDoc(doc(db, 'users', userId), {
          fotoPerfilUrl: PhotoURL
        });
    } catch (error) {
      console.warn('⚠️ No se pudo actualizar la foto de perfil:', error);
      // No lanzar error, es una operación secundaria
    }
  };
  /**
   * **INICIAR SESIÓN** 🔑
   * 
   * Autentica al usuario con email y contraseña.
   * Demuestra manejo de errores específicos de Firebase Auth.
   */
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔐 Intentando iniciar sesión:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Configurar email en BooksApiService para autorización
      booksApiService.setUserEmail(userCredential.user.email);
      
      console.log('✅ Sesión iniciada exitosamente');
      return { success: true, user: userCredential.user };
      
    } catch (error) {
      console.error('❌ Error en inicio de sesión:', error);
      
      // Manejar errores específicos de Firebase Auth
      let errorMessage = 'Error desconocido';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No existe una cuenta con este email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Contraseña incorrecta';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Esta cuenta ha sido deshabilitada';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos fallidos. Intenta más tarde';
          break;
        default:
          errorMessage = error.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * **REGISTRAR USUARIO** 📝
   * 
   * Crea una nueva cuenta y perfil de usuario.
   */
  const signUp = async (email, password, additionalData = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📝 Registrando nuevo usuario:', email);
      
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Crear perfil en Firestore
      await createUserProfile(userCredential.user.uid, additionalData);
      
      console.log('✅ Usuario registrado exitosamente');
      return { success: true, user: userCredential.user };
      
    } catch (error) {
      console.error('❌ Error en registro:', error);
      
      let errorMessage = 'Error en el registro';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Ya existe una cuenta con este email';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña debe tener al menos 6 caracteres';
          break;
        default:
          errorMessage = error.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * **CERRAR SESIÓN** 👋
   * 
   * Cierra la sesión del usuario actual.
   */
  const logout = async () => {
    try {
      setLoading(true);
      console.log('👋 Cerrando sesión...');
      
      await signOut(auth);
      
      console.log('✅ Sesión cerrada exitosamente');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error cerrando sesión:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * **RECUPERAR CONTRASEÑA** 🔐
   * 
   * Envía email de recuperación de contraseña.
   */
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📧 Enviando email de recuperación a:', email);
      
      await sendPasswordResetEmail(auth, email);
      
      console.log('✅ Email de recuperación enviado');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error enviando email de recuperación:', error);
      
      let errorMessage = 'Error enviando email de recuperación';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No existe una cuenta con este email';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        default:
          errorMessage = error.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * **VALOR DEL CONTEXTO** 📦
   * 
   * Todas las funciones y estados que se proporcionan a los componentes hijos.
   */
  const value = {
    // Estado
    user,
    userProfile,
    loading,
    error,
    
    // Funciones de autenticación
    signIn,
    signUp,
    logout,
    resetPassword,
    updatePhotoUser,
    // Funciones de perfil
    loadUserProfile,
    createUserProfile,
    
    // Estados derivados
    isAuthenticated: !!user,
    isLoading: loading,
    hasError: !!error,
    
    // Función para limpiar errores
    clearError: () => setError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};