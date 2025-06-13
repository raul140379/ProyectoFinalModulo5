import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useTheme } from 'react-native-paper';

/**
 * **COMPONENTE TOAST EDUCATIVO** 📢
 * 
 * Sistema de notificaciones no intrusivas que demuestra:
 * - Feedback temporal para acciones
 * - Diferentes tipos de mensajes (éxito, error, info)
 * - Animaciones suaves
 * - Auto-dismiss con posibilidad de cierre manual
 * 
 * Principios UX demostrados:
 * - Feedback no bloqueante
 * - Jerarquía visual por tipo de mensaje
 * - Posicionamiento contextual
 * - Accesibilidad completa
 */

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Toast = ({
  visible = false,
  message = '',
  type = 'info', // 'success', 'error', 'warning', 'info'
  duration = 3000,
  position = 'bottom', // 'top', 'bottom'
  onDismiss = () => {},
  showCloseButton = false,
  style = null
}) => {
  const theme = useTheme();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef(null);

  // **CONFIGURACIÓN DE TIPOS** 🎨
  const getTypeConfig = () => {
    const configs = {
      success: {
        backgroundColor: theme.customColors.success,
        icon: 'check-circle',
        textColor: 'white'
      },
      error: {
        backgroundColor: theme.customColors.error,
        icon: 'alert-circle',
        textColor: 'white'
      },
      warning: {
        backgroundColor: theme.customColors.warning,
        icon: 'alert',
        textColor: 'white'
      },
      info: {
        backgroundColor: theme.customColors.info,
        icon: 'information',
        textColor: 'white'
      }
    };
    
    return configs[type] || configs.info;
  };

  const typeConfig = getTypeConfig();

  // **EFECTOS DE ANIMACIÓN** ✨
  useEffect(() => {
    if (visible) {
      // Limpiar timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Animar entrada
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss
      if (duration > 0) {
        timeoutRef.current = setTimeout(() => {
          handleDismiss();
        }, duration);
      }
    } else {
      handleDismiss();
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible, duration]);

  // **FUNCIÓN DE CIERRE** 👋
  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  // **ESTILOS DINÁMICOS** 🎨
  const dynamicStyles = StyleSheet.create({
    container: {
      position: 'absolute',
      left: theme.spacing.md,
      right: theme.spacing.md,
      zIndex: 9999,
      ...(position === 'top' ? 
        { top: 60 } : 
        { bottom: 100 }
      ),
    },
    toast: {
      backgroundColor: typeConfig.backgroundColor,
      borderRadius: 12,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 56,
      ...theme.shadows.medium,
    },
    contentContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconContainer: {
      marginRight: theme.spacing.sm,
    },
    textContainer: {
      flex: 1,
    },
    message: {
      color: typeConfig.textColor,
      fontSize: 16,
      lineHeight: 22,
    },
    closeButton: {
      marginLeft: theme.spacing.sm,
    }
  });

  // **TRANSFORMACIONES DE ANIMACIÓN** 🎭
  const slideTransform = position === 'top' 
    ? slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-100, 0],
      })
    : slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [100, 0],
      });

  if (!visible && slideAnim._value === 0) {
    return null;
  }

  return (
    <View style={[dynamicStyles.container, style]} pointerEvents="box-none">
      <Animated.View
        style={[
          dynamicStyles.toast,
          {
            opacity: opacityAnim,
            transform: [{ translateY: slideTransform }],
          },
        ]}
        accessible={true}
        accessibilityLabel={`${type}: ${message}`}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
      >
        <View style={dynamicStyles.contentContainer}>
          <View style={dynamicStyles.iconContainer}>
            <IconButton
              icon={typeConfig.icon}
              iconColor={typeConfig.textColor}
              size={24}
              style={{ margin: 0 }}
            />
          </View>
          
          <View style={dynamicStyles.textContainer}>
            <Text style={dynamicStyles.message} numberOfLines={3}>
              {message}
            </Text>
          </View>
        </View>

        {showCloseButton && (
          <IconButton
            icon="close"
            iconColor={typeConfig.textColor}
            size={20}
            onPress={handleDismiss}
            style={dynamicStyles.closeButton}
            accessibilityLabel="Cerrar notificación"
          />
        )}
      </Animated.View>
    </View>
  );
};

// **COMPONENTES DE CONVENIENCIA** 🎯

export const SuccessToast = (props) => (
  <Toast type="success" {...props} />
);

export const ErrorToast = (props) => (
  <Toast type="error" {...props} />
);

export const WarningToast = (props) => (
  <Toast type="warning" {...props} />
);

export const InfoToast = (props) => (
  <Toast type="info" {...props} />
);

// **HOOK PARA MANEJO DE TOAST** 🪝
export const useToast = () => {
  const [toastState, setToastState] = React.useState({
    visible: false,
    message: '',
    type: 'info',
    duration: 3000
  });

  const showToast = React.useCallback((message, type = 'info', duration = 3000) => {
    setToastState({
      visible: true,
      message,
      type,
      duration
    });
  }, []);

  const hideToast = React.useCallback(() => {
    setToastState(prev => ({ ...prev, visible: false }));
  }, []);

  const showSuccess = React.useCallback((message, duration) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const showError = React.useCallback((message, duration) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const showWarning = React.useCallback((message, duration) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  const showInfo = React.useCallback((message, duration) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  return {
    toastState,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    ToastComponent: () => (
      <Toast
        visible={toastState.visible}
        message={toastState.message}
        type={toastState.type}
        duration={toastState.duration}
        onDismiss={hideToast}
      />
    )
  };
};

export default Toast;