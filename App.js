// Polyfill para URL en Hermes
import 'react-native-url-polyfill/auto';

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';

// Context Providers
import { AuthProvider } from './src/context/AuthContext';
import { ToastProvider } from './src/context/ToastContext';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Theme
import { theme } from './src/constants/theme';

/**
 * **COMPONENTE PRINCIPAL DE LA APP MYLIBRARY** 📱
 * 
 * Esta es la entrada principal de la aplicación React Native.
 * Demuestra el patrón de Provider/Context para manejo de estado global.
 * 
 * Conceptos educativos demostrados:
 * - Context API para estado global
 * - Navigation setup
 * - Provider pattern
 * - Theme configuration
 */
export default function App() {
  return (
    <PaperProvider theme={theme}>
      {/* 
        **PATRÓN DE PROVIDERS ANIDADOS** 🎯
        Los providers se anidan para proporcionar diferentes contextos:
        1. AuthProvider: Estado de autenticación global
        2. ToastProvider: Sistema de notificaciones
      */}
      <AuthProvider>
        <ToastProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </ToastProvider>
      </AuthProvider>
    </PaperProvider>
  );
}