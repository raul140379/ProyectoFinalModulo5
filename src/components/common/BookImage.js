import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Surface, ActivityIndicator } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { Image } from 'expo-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

/**
 * **COMPONENTE BOOK IMAGE EDUCATIVO** 📷
 * 
 * Componente especializado para mostrar imágenes de libros con:
 * - Fallback para imágenes que no cargan
 * - Placeholder mientras carga
 * - Soporte para diferentes tamaños
 * - Optimización de rendimiento con expo-image
 * - Estados de error y carga
 * 
 * Conceptos educativos demostrados:
 * - Manejo de estados de carga de imágenes
 * - Fallbacks y placeholders
 * - Optimización de imágenes
 * - Props flexibles para reutilización
 * - Cache automático de imágenes
 */

const { width: screenWidth } = Dimensions.get('window');

const BookImage = ({ 
  source, 
  style = {}, 
  placeholder = true,
  fallback = true,
  resizeMode = 'cover',
  blurRadius = 0,
  ...props 
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // **ESTILOS DINÁMICOS** 🎨
  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: theme.customColors.background.card,
      borderRadius: 8,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
      ...style,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    placeholder: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.customColors.background.secondary,
    },
    fallbackContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.customColors.background.secondary,
      width: '100%',
      height: '100%',
    },
    fallbackIcon: {
      opacity: 0.3,
    },
  });

  // **MANEJAR CARGA** 📥
  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  // **OBTENER TAMAÑO DEL ÍCONO SEGÚN DIMENSIONES** 📏
  const getIconSize = () => {
    const containerWidth = style.width || 120;
    const containerHeight = style.height || 180;
    const avgSize = (containerWidth + containerHeight) / 2;
    
    if (avgSize > 200) return 64;
    if (avgSize > 100) return 48;
    if (avgSize > 60) return 32;
    return 24;
  };

  // **RENDERIZAR PLACEHOLDER** ⏳
  const renderPlaceholder = () => {
    if (!placeholder || !loading) return null;
    
    return (
      <View style={dynamicStyles.placeholder}>
        <ActivityIndicator 
          size="small" 
          color={theme.customColors.primary}
        />
      </View>
    );
  };

  // **RENDERIZAR FALLBACK** 📚
  const renderFallback = () => {
    if (!fallback || !error) return null;
    
    return (
      <View style={dynamicStyles.fallbackContainer}>
        <Icon 
          name="book" 
          size={getIconSize()} 
          color={theme.customColors.text.secondary}
          style={dynamicStyles.fallbackIcon}
        />
      </View>
    );
  };

  // **VALIDAR URL DE IMAGEN** 🔍
  const getImageSource = () => {
    if (!source || typeof source !== 'string') return null;
    
    // Si es una URL válida
    if (source.startsWith('http://') || source.startsWith('https://')) {
      return { uri: source };
    }
    
    // Si es un asset local
    return source;
  };

  const imageSource = getImageSource();

  // **RENDERIZAR SIN IMAGEN** 📭
  if (!imageSource) {
    return (
      <Surface style={dynamicStyles.container} {...props}>
        {renderFallback()}
      </Surface>
    );
  }

  // **RENDERIZAR CON IMAGEN** 🖼️
  return (
    <Surface style={dynamicStyles.container} {...props}>
      <Image
        source={imageSource}
        style={dynamicStyles.image}
        contentFit={resizeMode}
        blurRadius={blurRadius}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        cachePolicy="memory-disk"
        transition={200}
      />
      
      {renderPlaceholder()}
      {renderFallback()}
    </Surface>
  );
};

/**
 * **VARIANTES ESPECIALIZADAS** 🎯
 */

// Imagen pequeña para listas
export const SmallBookImage = (props) => (
  <BookImage
    style={{ width: 60, height: 90 }}
    {...props}
  />
);

// Imagen mediana para cards
export const MediumBookImage = (props) => (
  <BookImage
    style={{ width: 120, height: 180 }}
    {...props}
  />
);

// Imagen grande para detalles
export const LargeBookImage = (props) => (
  <BookImage
    style={{ width: 200, height: 300 }}
    {...props}
  />
);

// Imagen cuadrada para avatar de libro
export const SquareBookImage = (props) => (
  <BookImage
    style={{ width: 80, height: 80 }}
    {...props}
  />
);

// Imagen hero para pantallas de detalle
export const HeroBookImage = (props) => (
  <BookImage
    style={{ width: screenWidth, height: 400 }}
    resizeMode="cover"
    {...props}
  />
);

/**
 * **HOOK PERSONALIZADO PARA GESTIÓN DE IMÁGENES** 🪝
 */
export const useBookImage = (source) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [loadedSource, setLoadedSource] = useState(null);

  React.useEffect(() => {
    if (!source) {
      setLoading(false);
      setError(true);
      return;
    }

    setLoading(true);
    setError(false);

    // Simular validación de imagen
    const timer = setTimeout(() => {
      setLoadedSource(source);
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [source]);

  return {
    loading,
    error,
    source: loadedSource,
    reload: () => {
      setLoading(true);
      setError(false);
      setLoadedSource(source);
    }
  };
};

export default BookImage;