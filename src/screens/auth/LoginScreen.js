import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Button, 
  PrimaryButton, 
  TextButton,
  LoadingOverlay 
} from '../../components/common';
import { 
  EmailInput, 
  PasswordInput, 
  useInputValidation, 
  validators 
} from '../../components/forms/Input';

/**
 * **PANTALLA DE LOGIN EDUCATIVA** 🔐
 * 
 * Pantalla que demuestra las mejores prácticas de UX para autenticación:
 * - Formulario con validación en tiempo real
 * - Estados de carga claros
 * - Manejo de errores específicos
 * - Navegación intuitiva
 * - Accesibilidad completa
 * 
 * Principios UX demostrados:
 * - Simplicidad en el formulario
 * - Feedback inmediato
 * - Recuperación de errores
 * - Call-to-action claros
 * - Consistencia visual
 */

const LoginScreen = ({ navigation }) => {
  const theme = useTheme();
  const { signIn, loading, error, clearError } = useAuth();
  const { showLoginSuccess, showError } = useToast();
  
  // **REFS PARA NAVEGACIÓN DE INPUTS** 📱
  const passwordRef = useRef(null);

  // **VALIDACIÓN DE INPUTS** ✅
  const email = useInputValidation('', [
    validators.required('Email es requerido'),
    validators.email()
  ]);

  const password = useInputValidation('', [
    validators.required('Contraseña es requerida'),
    validators.minLength(6, 'Contraseña debe tener al menos 6 caracteres')
  ]);

  // **ESTADO LOCAL** 📊
  const [showPassword, setShowPassword] = useState(false);

  // **ESTILOS DINÁMICOS** 🎨
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.customColors.background.primary,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.xxl,
    },
    header: {
      alignItems: 'center',
      marginBottom: theme.spacing.xxl,
    },
    logo: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.customColors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    logoText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: 'white',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.customColors.text.primary,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: 16,
      color: theme.customColors.text.secondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    form: {
      width: '100%',
      marginBottom: theme.spacing.xl,
    },
    inputContainer: {
      marginBottom: theme.spacing.md,
    },
    loginButton: {
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },
    forgotPassword: {
      alignSelf: 'center',
      marginBottom: theme.spacing.xl,
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: theme.spacing.lg,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.customColors.border.light,
    },
    dividerText: {
      marginHorizontal: theme.spacing.md,
      fontSize: 14,
      color: theme.customColors.text.secondary,
    },
    footer: {
      alignItems: 'center',
      marginTop: theme.spacing.xl,
    },
    signupContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    signupText: {
      fontSize: 16,
      color: theme.customColors.text.secondary,
    },
    demoSection: {
      marginTop: theme.spacing.xl,
      padding: theme.spacing.md,
      backgroundColor: theme.customColors.background.secondary,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.customColors.border.light,
    },
    demoTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.customColors.text.primary,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    demoText: {
      fontSize: 12,
      color: theme.customColors.text.secondary,
      textAlign: 'center',
      lineHeight: 18,
    }
  });

  // **VALIDAR FORMULARIO** ✅
  const isFormValid = () => {
    return email.isValid && password.isValid && email.value && password.value;
  };

  // **MANEJAR LOGIN** 🔐
  const handleLogin = async () => {
    // Limpiar errores previos
    clearError();

    // Validar formulario
    const isEmailValid = email.validate();
    const isPasswordValid = password.validate();

    if (!isEmailValid || !isPasswordValid) {
      showError('Por favor corrige los errores en el formulario');
      return;
    }

    try {
      const result = await signIn(email.value, password.value);
      
      if (result.success) {
        // Extraer nombre del email para personalizar mensaje
        const userName = email.value.split('@')[0];
        showLoginSuccess(userName);
        
        // La navegación se maneja automáticamente por el AuthContext
      } else {
        showError(result.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      showError('Error inesperado. Intenta de nuevo.');
    }
  };

  // **NAVEGACIÓN A OTRAS PANTALLAS** 🧭
  const handleForgotPassword = () => {
   // navigation.navigate('PasswordReset', { email: email.value });}
    navigation.navigate('PasswordReset');
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  const handleDemoLogin = () => {
    email.setValue('estudiante1@example.com');
    password.setValue('password123');
    
    // Auto login después de un momento para mostrar el efecto
    setTimeout(() => {
      handleLogin();
    }, 500);
  };

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={dynamicStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* **HEADER CON LOGO** 🎨 */}
          <View style={dynamicStyles.header}>
            <View style={dynamicStyles.logo}>
              <Text style={dynamicStyles.logoText}>📚</Text>
            </View>
            
            <Text style={dynamicStyles.title}>
              Bienvenido
            </Text>
            
            <Text style={dynamicStyles.subtitle}>
              Inicia sesión para acceder a tu librería personal
            </Text>
          </View>

          {/* **FORMULARIO DE LOGIN** 📝 */}
          <View style={dynamicStyles.form}>
            <View style={dynamicStyles.inputContainer}>
              <EmailInput
                label="Email"
                value={email.value}
                onChangeText={email.handleChangeText}
                onBlur={email.handleBlur}
                error={email.touched ? email.error : null}
                required
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                testID="login-email-input"
              />
            </View>

            <View style={dynamicStyles.inputContainer}>
              <PasswordInput
                ref={passwordRef}
                label="Contraseña"
                value={password.value}
                onChangeText={password.handleChangeText}
                onBlur={password.handleBlur}
                error={password.touched ? password.error : null}
                required
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                testID="login-password-input"
              />
            </View>

            <PrimaryButton
              onPress={handleLogin}
              loading={loading}
              disabled={!isFormValid() || loading}
              style={dynamicStyles.loginButton}
              testID="login-button"
            >
              Iniciar Sesión
            </PrimaryButton>

            <TextButton
              onPress={handleForgotPassword}
              style={dynamicStyles.forgotPassword}
              testID="forgot-password-button"
            >
              ¿Olvidaste tu contraseña?
            </TextButton>
          </View>

          {/* **DIVIDER** ➖ */}
          <View style={dynamicStyles.dividerContainer}>
            <View style={dynamicStyles.dividerLine} />
          </View>

          {/* **FOOTER CON REGISTRO** 👤 */}
          <View style={dynamicStyles.footer}>
            <View style={dynamicStyles.signupContainer}>
              <Text style={dynamicStyles.signupText}>
                ¿No tienes cuenta? 
              </Text>
              <TextButton
                onPress={handleSignup}
                testID="signup-navigation-button"
              >
                Regístrate
              </TextButton>
            </View>
          </View>
        </ScrollView>

        {/* **OVERLAY DE CARGA** ⏳ */}
        {loading && (
          <LoadingOverlay
            message="Iniciando sesión..."
            testID="login-loading-overlay"
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;