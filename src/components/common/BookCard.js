import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Surface, Text, Button, Chip } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

/**
 * **COMPONENTE BOOK CARD EDUCATIVO** 📚
 * 
 * Tarjeta para mostrar información de libros de manera atractiva.
 * Demuestra presentación de contenido multimedia con acciones.
 * 
 * Principios UX demostrados:
 * - Diseño orientado a contenido
 * - Jerarquía de información clara
 * - Acciones contextuales
 * - Feedback visual de estado
 */

const BookCard = ({ 
  book,
  onPress,
  onAddToLibrary,
  isInLibrary = false,
  imageSize = 'medium',
  style = null,
  showActions = true,
  compact = false 
}) => {
  const theme = useTheme();

  // **CONFIGURACIÓN DE TAMAÑOS** 📏
  const getImageSize = () => {
    switch (imageSize) {
      case 'small':
        return { width: 60, height: 90 };
      case 'large':
        return { width: 120, height: 180 };
      default:
        return { width: 80, height: 120 };
    }
  };

  const imgSize = getImageSize();

  // **ESTILOS DINÁMICOS** 🎨
  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: theme.customColors.background.card,
      borderRadius: 12,
      overflow: 'hidden',
      elevation: 2,
      shadowColor: theme.customColors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    content: {
      flexDirection: 'row',
      padding: theme.spacing.md,
    },
    imageContainer: {
      marginRight: theme.spacing.md,
    },
    image: {
      width: imgSize.width,
      height: imgSize.height,
      borderRadius: 8,
      backgroundColor: theme.customColors.background.secondary,
    },
    imagePlaceholder: {
      width: imgSize.width,
      height: imgSize.height,
      borderRadius: 8,
      backgroundColor: theme.customColors.background.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.customColors.border.light,
    },
    textContent: {
      flex: 1,
      justifyContent: 'space-between',
    },
    titleContainer: {
      marginBottom: theme.spacing.xs,
    },
    title: {
      fontSize: compact ? 16 : 18,
      fontWeight: '600',
      color: theme.customColors.text.primary,
      lineHeight: compact ? 20 : 24,
    },
    author: {
      fontSize: 14,
      color: theme.customColors.text.secondary,
      marginBottom: theme.spacing.sm,
    },
    synopsis: {
      fontSize: 13,
      color: theme.customColors.text.secondary,
      lineHeight: 18,
      marginBottom: theme.spacing.sm,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    addButton: {
      minWidth: 100,
    },
    inLibraryChip: {
      backgroundColor: theme.customColors.success + '20',
    }
  });

  // **MANEJAR PRENSA DE TARJETA** 📱
  const handleCardPress = () => {
    if (onPress) {
      onPress(book);
    }
  };

  // **RENDERIZAR IMAGEN O PLACEHOLDER** 🖼️
  const renderImage = () => {
    if (book.portadaUrl) {
      return (
        <Image
          source={{ uri: book.portadaUrl }}
          style={dynamicStyles.image}
          resizeMode="cover"
        />
      );
    }

    return (
      <View style={dynamicStyles.imagePlaceholder}>
        <Icon 
          name="book-open-page-variant" 
          size={imgSize.width * 0.4} 
          color={theme.customColors.text.disabled}
        />
      </View>
    );
  };

  // **RENDERIZAR ACCIONES** ⚡
  const renderActions = () => {
    if (!showActions) return null;

    return (
      <View style={dynamicStyles.actionsContainer}>
        {isInLibrary ? (
          <Chip 
            icon="check"
            style={dynamicStyles.inLibraryChip}
            textStyle={{ color: theme.customColors.success }}
            compact
          >
            En tu librería
          </Chip>
        ) : (
          <Button
            mode="outlined"
            onPress={() => onAddToLibrary?.(book)}
            style={dynamicStyles.addButton}
            compact
            icon="plus"
          >
            Agregar
          </Button>
        )}
      </View>
    );
  };

  return (
    <Surface style={[dynamicStyles.container, style]}>
      <TouchableOpacity 
        onPress={handleCardPress}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Libro: ${book.titulo} por ${book.autor}`}
      >
        <View style={dynamicStyles.content}>
          {/* **IMAGEN DEL LIBRO** */}
          <View style={dynamicStyles.imageContainer}>
            {renderImage()}
          </View>

          {/* **CONTENIDO TEXTUAL** */}
          <View style={dynamicStyles.textContent}>
            {/* **TÍTULO Y AUTOR** */}
            <View style={dynamicStyles.titleContainer}>
              <Text 
                style={dynamicStyles.title} 
                numberOfLines={compact ? 2 : 3}
              >
                {book.titulo}
              </Text>
              
              {book.autor && (
                <Text 
                  style={dynamicStyles.author} 
                  numberOfLines={1}
                >
                  por {book.autor}
                </Text>
              )}
            </View>

            {/* **SINOPSIS (solo si no es compacto)** */}
            {!compact && book.sinopsis && (
              <Text 
                style={dynamicStyles.synopsis} 
                numberOfLines={3}
              >
                {book.sinopsis}
              </Text>
            )}

            {/* **ACCIONES** */}
            {renderActions()}
          </View>
        </View>
      </TouchableOpacity>
    </Surface>
  );
};

// **VARIANTES PREDEFINIDAS** 🎯

export const CompactBookCard = (props) => (
  <BookCard compact={true} imageSize="small" {...props} />
);

export const DetailedBookCard = (props) => (
  <BookCard imageSize="large" {...props} />
);

export const SimpleBookCard = (props) => (
  <BookCard showActions={false} {...props} />
);

export default BookCard;