import React, { useState, forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Text, HelperText, IconButton } from 'react-native-paper';
import { useTheme } from 'react-native-paper';

/**
 * **COMPONENTE INPUT EDUCATIVO** 📝
 * 
 * Input personalizado que demuestra mejores prácticas de UX:
 * - Validación en tiempo real
 * - Estados visuales claros (normal, error, focus)
 * - Accesibilidad completa
 * - Diferentes tipos de input
 * - Feedback visual inmediato
 * 
 * Principios UX demostrados:
 * - Prevención de errores
 * - Feedback inmediato
 * - Claridad en estados
 * - Jerarquía visual
 * - Consistencia en la experiencia
 */

const Input = forwardRef(({
  label,
  value,
  onChangeText,
  onBlur,
  onFocus,
  placeholder,
  error = null,
  helperText = null,
  required = false,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  maxLength = null,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  secureTextEntry = false,
  showPasswordToggle = false,
  leftIcon = null,
  rightIcon = null,
  variant = 'outlined', // 'outlined', 'flat'
  style = null,
  inputStyle = null,
  testID = null,
  ...props
}, ref) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  // **ESTADO DEL INPUT** 📊
  const hasError = Boolean(error);
  const hasValue = Boolean(value && value.length > 0);
  const isPasswordInput = secureTextEntry || showPasswordToggle;

  // **CONFIGURACIÓN DINÁMICA** ⚙️
  const getInputMode = () => {
    if (variant === 'flat') return 'flat';
    return 'outlined';
  };

  // **COLORES DINÁMICOS** 🎨
  const getColors = () => {
    if (hasError) {
      return {
        outline: theme.customColors.error,
        text: theme.customColors.text.primary,
        placeholder: theme.customColors.text.secondary,
        background: theme.customColors.background.primary
      };
    }

    if (isFocused) {
      return {
        outline: theme.customColors.primary,
        text: theme.customColors.text.primary,
        placeholder: theme.customColors.text.secondary,
        background: theme.customColors.background.primary
      };
    }

    return {
      outline: theme.customColors.border.medium,
      text: theme.customColors.text.primary,
      placeholder: theme.customColors.text.secondary,
      background: theme.customColors.background.primary
    };
  };

  const colors = getColors();

  // **ESTILOS DINÁMICOS** 🎨
  const dynamicStyles = StyleSheet.create({
    container: {
      marginVertical: theme.spacing.xs,
    },
    inputContainer: {
      position: 'relative',
    },
    input: {
      fontSize: 16,
      lineHeight: multiline ? 22 : undefined,
      paddingRight: (rightIcon || isPasswordInput) ? 48 : 12,
      paddingLeft: leftIcon ? 48 : 12,
    },
    iconContainer: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      justifyContent: 'center',
      zIndex: 1,
    },
    leftIconContainer: {
      left: 4,
    },
    rightIconContainer: {
      right: 4,
    },
    labelContainer: {
      flexDirection: 'row',
      marginBottom: theme.spacing.xs,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.customColors.text.primary,
    },
    requiredMark: {
      color: theme.customColors.error,
      marginLeft: 2,
    },
    helperContainer: {
      marginTop: theme.spacing.xs,
      marginHorizontal: 12,
    },
    helperText: {
      fontSize: 12,
      color: theme.customColors.text.secondary,
    },
    errorText: {
      fontSize: 12,
      color: theme.customColors.error,
    },
    characterCount: {
      fontSize: 12,
      color: theme.customColors.text.secondary,
      textAlign: 'right',
      marginTop: 4,
    }
  });

  // **MANEJADORES DE EVENTOS** 🎯
  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const handleChangeText = (text) => {
    if (maxLength && text.length > maxLength) return;
    if (onChangeText) onChangeText(text);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // **RENDERIZAR LABEL PERSONALIZADO** 🏷️
  const renderLabel = () => {
    if (!label) return null;

    return (
      <View style={dynamicStyles.labelContainer}>
        <Text style={dynamicStyles.label}>
          {label}
        </Text>
        {required && (
          <Text style={dynamicStyles.requiredMark}>*</Text>
        )}
      </View>
    );
  };

  // **RENDERIZAR ICONOS** 🎭
  const renderLeftIcon = () => {
    if (!leftIcon) return null;

    return (
      <View style={[dynamicStyles.iconContainer, dynamicStyles.leftIconContainer]}>
        <IconButton
          icon={leftIcon}
          size={20}
          iconColor={colors.placeholder}
          style={{ margin: 0 }}
        />
      </View>
    );
  };

  const renderRightIcon = () => {
    // Prioridad: toggle de password > icono personalizado
    if (isPasswordInput) {
      return (
        <View style={[dynamicStyles.iconContainer, dynamicStyles.rightIconContainer]}>
          <IconButton
            icon={isPasswordVisible ? 'eye-off' : 'eye'}
            size={20}
            iconColor={colors.placeholder}
            onPress={togglePasswordVisibility}
            style={{ margin: 0 }}
            accessibilityLabel={isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          />
        </View>
      );
    }

    if (!rightIcon) return null;

    return (
      <View style={[dynamicStyles.iconContainer, dynamicStyles.rightIconContainer]}>
        <IconButton
          icon={rightIcon}
          size={20}
          iconColor={colors.placeholder}
          style={{ margin: 0 }}
        />
      </View>
    );
  };

  // **RENDERIZAR HELPER TEXT** 💬
  const renderHelperText = () => {
    const showCharacterCount = maxLength && hasValue;
    const showHelper = helperText && !hasError;
    const showError = hasError && error;

    if (!showCharacterCount && !showHelper && !showError) return null;

    return (
      <View style={dynamicStyles.helperContainer}>
        {showError && (
          <HelperText type="error" style={dynamicStyles.errorText}>
            {error}
          </HelperText>
        )}
        
        {showHelper && (
          <Text style={dynamicStyles.helperText}>
            {helperText}
          </Text>
        )}
        
        {showCharacterCount && (
          <Text style={dynamicStyles.characterCount}>
            {value?.length || 0} / {maxLength}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={[dynamicStyles.container, style]} testID={testID}>
      {renderLabel()}
      
      <View style={dynamicStyles.inputContainer}>
        {renderLeftIcon()}
        
        <TextInput
          ref={ref}
          mode={getInputMode()}
          label={!label ? placeholder : undefined} // Solo usar label interno si no hay label externo
          placeholder={placeholder}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          error={hasError}
          disabled={disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          secureTextEntry={isPasswordInput && !isPasswordVisible}
          style={[dynamicStyles.input, inputStyle]}
          theme={{
            colors: {
              outline: colors.outline,
              onSurfaceVariant: colors.placeholder,
              onSurface: colors.text,
              surface: colors.background,
            }
          }}
          accessible={true}
          accessibilityLabel={label || placeholder}
          accessibilityRole="text"
          accessibilityState={{
            disabled,
            invalid: hasError
          }}
          accessibilityHint={helperText}
          {...props}
        />
        
        {renderRightIcon()}
      </View>
      
      {renderHelperText()}
    </View>
  );
});

// **VARIANTES PREDEFINIDAS** 🎯

export const EmailInput = (props) => (
  <Input
    keyboardType="email-address"
    autoCapitalize="none"
    autoCorrect={false}
    leftIcon="email"
    {...props}
  />
);

export const PasswordInput = (props) => (
  <Input
    secureTextEntry={true}
    showPasswordToggle={true}
    autoCapitalize="none"
    autoCorrect={false}
    leftIcon="lock"
    {...props}
  />
);

export const SearchInput = (props) => (
  <Input
    leftIcon="magnify"
    placeholder="Buscar..."
    autoCapitalize="none"
    {...props}
  />
);

export const TextAreaInput = (props) => (
  <Input
    multiline={true}
    numberOfLines={4}
    {...props}
  />
);

export const BasicInput = (props) => (
  <Input
    autoCapitalize="none"
    {...props}
  />
);

export const PhoneInput = (props) => (
  <Input
    keyboardType="phone-pad"
    leftIcon="phone"
    {...props}
  />
);

export const NumberInput = (props) => (
  <Input
    keyboardType="numeric"
    {...props}
  />
);

// **HOOK PARA VALIDACIÓN** 🪝
export const useInputValidation = (initialValue = '', validationRules = []) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState(false);

  const validate = (inputValue = value) => {
    for (const rule of validationRules) {
      const result = rule(inputValue);
      if (result !== true) {
        setError(result);
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleChangeText = (text) => {
    setValue(text);
    if (touched) {
      validate(text);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    validate();
  };

  return {
    value,
    error,
    touched,
    isValid: !error && touched,
    setValue,
    setError,
    handleChangeText,
    handleBlur,
    validate
  };
};

// **VALIDADORES COMUNES** ✅
export const validators = {
  required: (message = 'Este campo es requerido') => (value) => {
    return value && value.trim().length > 0 ? true : message;
  },
  
  email: (message = 'Email inválido') => (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !value || emailRegex.test(value) ? true : message;
  },
  
  minLength: (min, message) => (value) => {
    const msg = message || `Debe tener al menos ${min} caracteres`;
    return !value || value.length >= min ? true : msg;
  },
  
  maxLength: (max, message) => (value) => {
    const msg = message || `No puede exceder ${max} caracteres`;
    return !value || value.length <= max ? true : msg;
  },
  
  password: (message = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número') => (value) => {
    if (!value) return true;
    const hasLength = value.length >= 8;
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    return hasLength && hasUpper && hasLower && hasNumber ? true : message;
  }
};

Input.displayName = 'Input';

export default Input;