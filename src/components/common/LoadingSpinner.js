import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useTheme } from 'react-native-paper';

/**
 * **COMPONENTE LOADING SPINNER EDUCATIVO** ⏳
 * 
 * Componente reutilizable para mostrar estados de carga.
 * Demuestra patrones de UX para feedback de carga.
 * 
 * Principios UX demostrados:
 * - Feedback visual inmediato
 * - Mensajes contextuales
 * - Diferentes tamaños según contexto
 * - Accesibilidad integrada
 */

const LoadingSpinner = ({ 
  size = 'medium', 
  message = null, 
  overlay = false,
  style = null 
}) => {
  const theme = useTheme();

  // **CONFIGURACIÓN DE TAMAÑOS** 📏
  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return { size: 20, textVariant: 'bodySmall' };
      case 'large':
        return { size: 40, textVariant: 'titleMedium' };
      default:
        return { size: 30, textVariant: 'bodyMedium' };
    }
  };

  const sizeConfig = getSizeConfig();

  // **ESTILOS DINÁMICOS** 🎨
  const dynamicStyles = StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.md,
      ...(overlay && {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 1000,
      }),
    },
    messageContainer: {
      marginTop: theme.spacing.sm,
      alignItems: 'center',
    },
    message: {
      color: theme.customColors.text.secondary,
      textAlign: 'center',
      maxWidth: 250,
    }
  });

  return (
    <View 
      style={[dynamicStyles.container, style]}
      accessible={true}
      accessibilityLabel={message || 'Cargando'}
      accessibilityRole="progressbar"
    >
      <ActivityIndicator 
        size={sizeConfig.size}
        color={theme.customColors.primary}
        animating={true}
      />
      
      {message && (
        <View style={dynamicStyles.messageContainer}>
          <Text 
            variant={sizeConfig.textVariant}
            style={dynamicStyles.message}
          >
            {message}
          </Text>
        </View>
      )}
    </View>
  );
};

export default LoadingSpinner;