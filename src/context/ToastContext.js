import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/common/Toast';

/**
 * **CONTEXT DE TOAST EDUCATIVO** 📢
 * 
 * Context global para manejar notificaciones toast en toda la aplicación.
 * Demuestra patrones de UX para feedback no intrusivo.
 * 
 * Conceptos educativos demostrados:
 * - Context API para estado global
 * - Queue de notificaciones
 * - Manejo de múltiples toast
 * - Auto-dismiss inteligente
 * - API simple y consistente
 */

// Crear el contexto
const ToastContext = createContext({});

// Hook personalizado para usar el contexto
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de un ToastProvider');
  }
  return context;
};

/**
 * **PROVIDER DE TOAST** 📢
 * 
 * Componente que envuelve la app y proporciona funcionalidades de toast.
 */
export const ToastProvider = ({ children }) => {
  // **ESTADO DEL TOAST** 📊
  const [toastState, setToastState] = useState({
    visible: false,
    message: '',
    type: 'info',
    duration: 3000,
    showCloseButton: false
  });

  // **QUEUE DE NOTIFICACIONES** 🗂️
  const [toastQueue, setToastQueue] = useState([]);

  // **FUNCIÓN PRINCIPAL PARA MOSTRAR TOAST** 📢
  const showToast = useCallback((message, type = 'info', options = {}) => {
    const {
      duration = 3000,
      showCloseButton = false,
      position = 'bottom'
    } = options;

    const newToast = {
      id: Date.now() + Math.random(),
      message,
      type,
      duration,
      showCloseButton,
      position
    };

    // Si ya hay un toast visible, agregarlo a la queue
    if (toastState.visible) {
      setToastQueue(prev => [...prev, newToast]);
      return;
    }

    // Mostrar toast inmediatamente
    setToastState({
      visible: true,
      ...newToast
    });
  }, [toastState.visible]);

  // **OCULTAR TOAST ACTUAL** 👋
  const hideToast = useCallback(() => {
    setToastState(prev => ({ ...prev, visible: false }));

    // Mostrar siguiente toast en queue después de un delay
    setTimeout(() => {
      setToastQueue(prev => {
        if (prev.length > 0) {
          const nextToast = prev[0];
          setToastState({
            visible: true,
            ...nextToast
          });
          return prev.slice(1);
        }
        return prev;
      });
    }, 300); // Delay para animación de salida
  }, []);

  // **MÉTODOS DE CONVENIENCIA** 🎯
  const showSuccess = useCallback((message, options) => {
    showToast(message, 'success', { duration: 2500, ...options });
  }, [showToast]);

  const showError = useCallback((message, options) => {
    showToast(message, 'error', { 
      duration: 4000, 
      showCloseButton: true, 
      ...options 
    });
  }, [showToast]);

  const showWarning = useCallback((message, options) => {
    showToast(message, 'warning', { duration: 3500, ...options });
  }, [showToast]);

  const showInfo = useCallback((message, options) => {
    showToast(message, 'info', { duration: 3000, ...options });
  }, [showToast]);

  // **MÉTODOS ESPECIALIZADOS PARA LA APP** 📚
  const showBookAdded = useCallback((bookTitle) => {
    showSuccess(`"${bookTitle}" agregado a tu librería`, {
      duration: 2000
    });
  }, [showSuccess]);

  const showBookRemoved = useCallback((bookTitle) => {
    showInfo(`"${bookTitle}" eliminado de tu librería`, {
      duration: 2000
    });
  }, [showInfo]);

  const showReviewSaved = useCallback((bookTitle) => {
    showSuccess(`Tu reseña de "${bookTitle}" ha sido guardada`, {
      duration: 2500
    });
  }, [showSuccess]);

  const showLoginSuccess = useCallback((userName) => {
    showSuccess(`¡Bienvenido${userName ? `, ${userName}` : ''}!`, {
      duration: 2000
    });
  }, [showSuccess]);

  const showLogoutSuccess = useCallback(() => {
    showInfo('Sesión cerrada correctamente', {
      duration: 2000
    });
  }, [showInfo]);

  const showNetworkError = useCallback(() => {
    showError('Error de conexión. Verifica tu internet e intenta de nuevo.', {
      duration: 5000,
      showCloseButton: true
    });
  }, [showError]);

  const showUnexpectedError = useCallback(() => {
    showError('Ha ocurrido un error inesperado. Intenta de nuevo.', {
      duration: 4000,
      showCloseButton: true
    });
  }, [showError]);

  // **LIMPIAR QUEUE** 🧹
  const clearQueue = useCallback(() => {
    setToastQueue([]);
    hideToast();
  }, [hideToast]);

  // **VALOR DEL CONTEXTO** 📦
  const value = {
    // Estado actual
    toastState,
    queueLength: toastQueue.length,
    
    // Métodos básicos
    showToast,
    hideToast,
    clearQueue,
    
    // Métodos de conveniencia por tipo
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // Métodos especializados de la app
    showBookAdded,
    showBookRemoved,
    showReviewSaved,
    showLoginSuccess,
    showLogoutSuccess,
    showNetworkError,
    showUnexpectedError,
    
    // Estados derivados
    isVisible: toastState.visible,
    hasQueue: toastQueue.length > 0
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      {/* **COMPONENTE TOAST GLOBAL** 🌍 */}
      <Toast
        visible={toastState.visible}
        message={toastState.message}
        type={toastState.type}
        duration={toastState.duration}
        position={toastState.position}
        showCloseButton={toastState.showCloseButton}
        onDismiss={hideToast}
      />
    </ToastContext.Provider>
  );
};

// **HOOK CON FUNCIONALIDADES ADICIONALES** 🪝
export const useToastWithQueue = () => {
  const toast = useToast();
  
  // **MOSTRAR MÚLTIPLES MENSAJES EN SECUENCIA** 📝
  const showSequence = useCallback((messages) => {
    messages.forEach((msg, index) => {
      setTimeout(() => {
        if (typeof msg === 'string') {
          toast.showInfo(msg);
        } else {
          toast.showToast(msg.message, msg.type, msg.options);
        }
      }, index * 200); // Delay entre mensajes
    });
  }, [toast]);

  // **MOSTRAR TOAST CON CONFIRMACIÓN** ✅
  const showWithConfirmation = useCallback((message, onConfirm, type = 'info') => {
    toast.showToast(message, type, {
      duration: 0, // No auto-dismiss
      showCloseButton: true,
      onAction: onConfirm
    });
  }, [toast]);

  return {
    ...toast,
    showSequence,
    showWithConfirmation
  };
};

// **TIPOS DE TOAST PREDEFINIDOS** 📋
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export const TOAST_DURATIONS = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 4000,
  VERY_LONG: 5000,
  PERSISTENT: 0 // No auto-dismiss
};