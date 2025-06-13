import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

/**
 * **COMPONENTE EMPTY STATE EDUCATIVO** 📭
 * 
 * Componente para mostrar estados vacíos de manera amigable.
 * Demuestra cómo comunicar ausencia de contenido sin frustrar al usuario.
 * 
 * Principios UX demostrados:
 * - Comunicación empática
 * - Guía hacia acciones constructivas
 * - Iconografía explicativa
 * - Diseño positivo y motivacional
 */

const EmptyState = ({ 
  icon = 'help-circle-outline',
  title = 'No hay datos',
  message = 'No se encontró información para mostrar.',
  actionText = null,
  onAction = null,
  style = null,
  compact = false 
}) => {
  const theme = useTheme();

  // **ESTILOS DINÁMICOS** 🎨
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
      minHeight: compact ? 200 : 300,
    },
    iconContainer: {
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: compact ? 18 : 22,
      fontWeight: '600',
      color: theme.customColors.text.primary,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    message: {
      fontSize: compact ? 14 : 16,
      color: theme.customColors.text.secondary,
      textAlign: 'center',
      lineHeight: compact ? 20 : 24,
      maxWidth: 280,
      marginBottom: theme.spacing.lg,
    },
    actionButton: {
      marginTop: theme.spacing.md,
    }
  });

  return (
    <View style={[dynamicStyles.container, style]}>
      {/* **ICONO** */}
      <View style={dynamicStyles.iconContainer}>
        <Icon 
          name={icon} 
          size={compact ? 48 : 64} 
          color={theme.customColors.text.disabled}
        />
      </View>

      {/* **TÍTULO** */}
      <Text style={dynamicStyles.title}>
        {title}
      </Text>

      {/* **MENSAJE** */}
      <Text style={dynamicStyles.message}>
        {message}
      </Text>

      {/* **ACCIÓN OPCIONAL** */}
      {actionText && onAction && (
        <Button
          mode="contained"
          onPress={onAction}
          style={dynamicStyles.actionButton}
        >
          {actionText}
        </Button>
      )}
    </View>
  );
};

// **ESTADOS ESPECÍFICOS** 🎯

export const EmptySearchState = ({ searchTerm, onClearSearch }) => (
  <EmptyState
    icon="magnify"
    title="Sin resultados"
    message={searchTerm 
      ? `No encontramos libros que coincidan con "${searchTerm}".`
      : 'Realiza una búsqueda para encontrar libros.'
    }
    actionText={searchTerm ? "Limpiar búsqueda" : "Explorar catálogo"}
    onAction={onClearSearch}
  />
);

export const EmptyLibraryState = ({ onAddFirstBook }) => (
  <EmptyState
    icon="bookshelf"
    title="Tu librería está vacía"
    message="¡Comienza tu colección agregando tu primer libro! Explora nuestro catálogo y encuentra algo que te interese."
    actionText="Explorar libros"
    onAction={onAddFirstBook}
  />
);

export const EmptyReviewsState = ({ onWriteReview }) => (
  <EmptyState
    icon="star-outline"
    title="Sin reseñas"
    message="Este libro aún no tiene reseñas. ¡Sé el primero en compartir tu opinión!"
    actionText="Escribir reseña"
    onAction={onWriteReview}
  />
);

export const ErrorState = ({ error, onRetry }) => (
  <EmptyState
    icon="alert-circle-outline"
    title="Oops, algo salió mal"
    message={error || "Ocurrió un error inesperado. Por favor, inténtalo de nuevo."}
    actionText="Reintentar"
    onAction={onRetry}
  />
);

export const NoInternetState = ({ onRetry }) => (
  <EmptyState
    icon="wifi-off"
    title="Sin conexión"
    message="Verifica tu conexión a internet e inténtalo nuevamente."
    actionText="Reintentar"
    onAction={onRetry}
  />
);

export const LoadingFailedState = ({ onRetry }) => (
  <EmptyState
    icon="cloud-off-outline"
    title="Error de carga"
    message="No se pudieron cargar los datos. Revisa tu conexión e inténtalo de nuevo."
    actionText="Reintentar"
    onAction={onRetry}
  />
);

export const SuccessState = ({ title, message, actionText, onAction }) => (
  <EmptyState
    icon="check-circle-outline"
    title={title || "¡Éxito!"}
    message={message || "La operación se completó correctamente."}
    actionText={actionText}
    onAction={onAction}
  />
);

export const WelcomeState = ({ onGetStarted }) => (
  <EmptyState
    icon="book-open-page-variant"
    title="¡Bienvenido a MyLibrary!"
    message="Descubre, organiza y reseña tus libros favoritos. Comienza explorando nuestro catálogo para crear tu biblioteca personal."
    actionText="Explorar libros"
    onAction={onGetStarted}
  />
);

export const FirstBookState = ({ onAddFirstBook }) => (
  <EmptyState
    icon="book-plus"
    title="Agrega tu primer libro"
    message="¡Estás a un paso de comenzar tu biblioteca digital! Busca y agrega libros que te interesen."
    actionText="Buscar libros"
    onAction={onAddFirstBook}
  />
);

export const BookDetailEmptyState = ({ onGoBack }) => (
  <EmptyState
    icon="book-open-outline"
    title="Libro no encontrado"
    message="No se pudo cargar la información de este libro. Puede que haya sido eliminado o movido."
    actionText="Volver atrás"
    onAction={onGoBack}
    compact={true}
  />
);

export const ReviewsEmptyState = ({ bookTitle, onWriteFirst }) => (
  <EmptyState
    icon="star-plus-outline"
    title="Primeras reseñas"
    message={`"${bookTitle}" espera tu primera reseña. Comparte qué te pareció este libro.`}
    actionText="Escribir reseña"
    onAction={onWriteFirst}
    compact={true}
  />
);

// **HOOK PARA MANEJAR ESTADOS** 🎣
export const useEmptyState = (data, loading, error) => {
  if (loading) return { type: 'loading' };
  if (error) return { type: 'error', error };
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return { type: 'empty' };
  }
  return { type: 'data', data };
};

export default EmptyState;