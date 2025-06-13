import React from 'react';
import { StyleSheet } from 'react-native';
import { Button as PaperButton, ActivityIndicator } from 'react-native-paper';
import { useTheme } from 'react-native-paper';

/**
 * **COMPONENTE BUTTON EDUCATIVO** 🔘
 * 
 * Botón customizado que extiende React Native Paper Button
 * con funcionalidades adicionales para la experiencia educativa.
 * 
 * Principios UX demostrados:
 * - Estados claros (normal, loading, disabled)
 * - Feedback visual inmediato
 * - Variantes para diferentes contextos
 * - Accesibilidad completa
 * - Tamaños responsive
 */

const Button = ({
  children,
  loading = false,
  disabled = false,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'text', 'danger'
  size = 'medium', // 'small', 'medium', 'large'
  fullWidth = false,
  icon = null,
  style = null,
  onPress = () => {},
  ...props
}) => {
  const theme = useTheme();

  // **CONFIGURACIÓN DE VARIANTES** 🎨
  const getVariantConfig = () => {
    const configs = {
      primary: {
        mode: 'contained',
        buttonColor: theme.customColors.primary,
        textColor: 'white'
      },
      secondary: {
        mode: 'contained',
        buttonColor: theme.customColors.secondary,
        textColor: 'white'
      },
      outline: {
        mode: 'outlined',
        buttonColor: 'transparent',
        textColor: theme.customColors.primary
      },
      text: {
        mode: 'text',
        buttonColor: 'transparent',
        textColor: theme.customColors.primary
      },
      danger: {
        mode: 'contained',
        buttonColor: theme.customColors.error,
        textColor: 'white'
      }
    };
    
    return configs[variant] || configs.primary;
  };

  // **CONFIGURACIÓN DE TAMAÑOS** 📏
  const getSizeConfig = () => {
    const configs = {
      small: {
        height: 36,
        paddingHorizontal: 16,
        fontSize: 14,
        iconSize: 16
      },
      medium: {
        height: 48,
        paddingHorizontal: 24,
        fontSize: 16,
        iconSize: 20
      },
      large: {
        height: 56,
        paddingHorizontal: 32,
        fontSize: 18,
        iconSize: 24
      }
    };
    
    return configs[size] || configs.medium;
  };

  const variantConfig = getVariantConfig();
  const sizeConfig = getSizeConfig();

  // **ESTADOS DEL BOTÓN** 📊
  const isDisabled = disabled || loading;
  const showLoadingSpinner = loading && variant !== 'text';

  // **ESTILOS DINÁMICOS** 🎨
  const dynamicStyles = StyleSheet.create({
    button: {
      height: sizeConfig.height,
      justifyContent: 'center',
      borderRadius: 12,
      ...(fullWidth && { width: '100%' }),
    },
    content: {
      height: sizeConfig.height,
      paddingHorizontal: sizeConfig.paddingHorizontal,
    },
    label: {
      fontSize: sizeConfig.fontSize,
      fontWeight: '600',
      letterSpacing: 0.5,
    }
  });

  // **MANEJAR PRESS** 👆
  const handlePress = () => {
    if (!isDisabled && onPress) {
      onPress();
    }
  };

  // **RENDERIZAR ICONO** 🎭
  const renderIcon = () => {
    if (showLoadingSpinner) {
      return () => <ButtonSpinner color={variantConfig.textColor} size={sizeConfig.iconSize} />;
    }
    return icon;
  };

  return (
    <PaperButton
      mode={variantConfig.mode}
      onPress={handlePress}
      disabled={isDisabled}
      loading={false} // Manejamos nuestro propio loading
      icon={renderIcon()}
      buttonColor={variantConfig.buttonColor}
      textColor={variantConfig.textColor}
      style={[dynamicStyles.button, style]}
      contentStyle={dynamicStyles.content}
      labelStyle={dynamicStyles.label}
      accessible={true}
      accessibilityLabel={typeof children === 'string' ? children : 'Botón'}
      accessibilityRole="button"
      accessibilityState={{
        disabled: isDisabled,
        busy: loading
      }}
      {...props}
    >
      {children}
    </PaperButton>
  );
};

// **VARIANTES PREDEFINIDAS** 🎯

export const PrimaryButton = (props) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton = (props) => (
  <Button variant="secondary" {...props} />
);

export const OutlineButton = (props) => (
  <Button variant="outline" {...props} />
);

export const TextButton = (props) => (
  <Button variant="text" {...props} />
);

export const DangerButton = (props) => (
  <Button variant="danger" {...props} />
);

// **BOTONES DE TAMAÑO** 📏

export const SmallButton = (props) => (
  <Button size="small" {...props} />
);

export const LargeButton = (props) => (
  <Button size="large" {...props} />
);

export const FullWidthButton = (props) => (
  <Button fullWidth {...props} />
);

// **BOTONES ESPECIALIZADOS** ⚡

export const LoadingButton = ({ loading, children, ...props }) => (
  <Button loading={loading} disabled={loading} {...props}>
    {loading ? 'Cargando...' : children}
  </Button>
);

export const IconButton = ({ icon, children, ...props }) => (
  <Button icon={icon} {...props}>
    {children}
  </Button>
);

export const FloatingActionButton = ({ icon, onPress, style, ...props }) => {
  const theme = useTheme();
  
  const fabStyle = StyleSheet.create({
    fab: {
      position: 'absolute',
      bottom: 16,
      right: 16,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.customColors.primary,
      elevation: 6,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    }
  });

  return (
    <PaperButton
      mode="contained"
      onPress={onPress}
      icon={icon}
      style={[fabStyle.fab, style]}
      contentStyle={{ width: 56, height: 56 }}
      accessible={true}
      accessibilityLabel="Botón de acción flotante"
      accessibilityRole="button"
      {...props}
    />
  );
};

// **SPINNER PARA BOTONES** 🔘
export const ButtonSpinner = ({ color = 'white', size = 20 }) => {
  return (
    <ActivityIndicator 
      size={size}
      color={color}
      style={{ marginRight: 8 }}
    />
  );
};

export default Button;