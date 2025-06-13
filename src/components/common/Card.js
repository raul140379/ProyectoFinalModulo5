import React from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Card as PaperCard, Text, IconButton } from 'react-native-paper';
import { useTheme } from 'react-native-paper';

/**
 * **COMPONENTE CARD EDUCATIVO** 🃏
 * 
 * Componente de tarjeta flexible que demuestra:
 * - Jerarquía visual clara
 * - Estados interactivos (press, hover)
 * - Layouts responsive
 * - Acciones contextuales
 * - Elevación y shadows
 * 
 * Principios UX demostrados:
 * - Agrupación lógica de información
 * - Feedback visual en interacciones
 * - Espaciado consistente
 * - Accesibilidad completa
 */

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Card = ({
  children,
  title = null,
  subtitle = null,
  onPress = null,
  onLongPress = null,
  actions = null,
  variant = 'default', // 'default', 'outlined', 'elevated'
  padding = 'medium', // 'none', 'small', 'medium', 'large'
  style = null,
  contentStyle = null,
  disabled = false,
  testID = null,
  ...props
}) => {
  const theme = useTheme();

  // **CONFIGURACIÓN DE VARIANTES** 🎨
  const getVariantConfig = () => {
    const configs = {
      default: {
        elevation: 2,
        borderWidth: 0,
        backgroundColor: theme.customColors.background.card,
      },
      outlined: {
        elevation: 0,
        borderWidth: 1,
        borderColor: theme.customColors.border.medium,
        backgroundColor: theme.customColors.background.card,
      },
      elevated: {
        elevation: 8,
        borderWidth: 0,
        backgroundColor: theme.customColors.background.card,
      }
    };
    
    return configs[variant] || configs.default;
  };

  // **CONFIGURACIÓN DE PADDING** 📏
  const getPaddingConfig = () => {
    const configs = {
      none: 0,
      small: theme.spacing.sm,
      medium: theme.spacing.md,
      large: theme.spacing.lg,
    };
    
    return configs[padding] || configs.medium;
  };

  const variantConfig = getVariantConfig();
  const paddingValue = getPaddingConfig();

  // **ESTADOS INTERACTIVOS** 💫
  const isInteractive = !disabled && (onPress || onLongPress);

  // **ESTILOS DINÁMICOS** 🎨
  const dynamicStyles = StyleSheet.create({
    card: {
      backgroundColor: variantConfig.backgroundColor,
      borderRadius: 12,
      borderWidth: variantConfig.borderWidth,
      borderColor: variantConfig.borderColor,
      ...theme.shadows.medium,
      elevation: variantConfig.elevation,
      overflow: 'hidden',
    },
    pressable: {
      borderRadius: 12,
    },
    header: {
      paddingHorizontal: paddingValue,
      paddingTop: paddingValue,
      paddingBottom: title && subtitle ? theme.spacing.sm : paddingValue,
    },
    titleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    textContainer: {
      flex: 1,
      marginRight: actions ? theme.spacing.sm : 0,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.customColors.text.primary,
      marginBottom: subtitle ? 4 : 0,
    },
    subtitle: {
      fontSize: 14,
      color: theme.customColors.text.secondary,
      lineHeight: 20,
    },
    content: {
      padding: paddingValue,
    },
    actionsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    disabledOverlay: {
      opacity: 0.5,
    }
  });

  // **RENDERIZAR HEADER** 📝
  const renderHeader = () => {
    if (!title && !subtitle && !actions) return null;

    return (
      <View style={dynamicStyles.header}>
        <View style={dynamicStyles.titleContainer}>
          <View style={dynamicStyles.textContainer}>
            {title && (
              <Text style={dynamicStyles.title} numberOfLines={2}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={dynamicStyles.subtitle} numberOfLines={2}>
                {subtitle}
              </Text>
            )}
          </View>
          
          {actions && (
            <View style={dynamicStyles.actionsContainer}>
              {actions}
            </View>
          )}
        </View>
      </View>
    );
  };

  // **RENDERIZAR CONTENIDO** 📄
  const renderContent = () => {
    if (!children) return null;

    return (
      <View style={[dynamicStyles.content, contentStyle]}>
        {children}
      </View>
    );
  };

  // **MANEJAR PRESS** 👆
  const handlePress = () => {
    if (!disabled && onPress) {
      onPress();
    }
  };

  const handleLongPress = () => {
    if (!disabled && onLongPress) {
      onLongPress();
    }
  };

  // **CONTENIDO DE LA CARD** 🏗️
  const cardContent = (
    <View style={[disabled && dynamicStyles.disabledOverlay]}>
      {renderHeader()}
      {renderContent()}
    </View>
  );

  // **RENDERIZAR CON O SIN INTERACTIVIDAD** 🔀
  if (isInteractive) {
    return (
      <View style={[dynamicStyles.card, style]} testID={testID}>
        <Pressable
          onPress={handlePress}
          onLongPress={handleLongPress}
          style={dynamicStyles.pressable}
          android_ripple={{
            color: theme.customColors.primary + '20',
            borderless: false,
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={title || 'Tarjeta interactiva'}
          accessibilityState={{ disabled }}
          {...props}
        >
          {cardContent}
        </Pressable>
      </View>
    );
  }

  return (
    <View 
      style={[dynamicStyles.card, style]} 
      testID={testID}
      accessible={true}
      accessibilityRole="text"
      {...props}
    >
      {cardContent}
    </View>
  );
};

// **VARIANTES PREDEFINIDAS** 🎯

export const DefaultCard = (props) => (
  <Card variant="default" {...props} />
);

export const OutlinedCard = (props) => (
  <Card variant="outlined" {...props} />
);

export const ElevatedCard = (props) => (
  <Card variant="elevated" {...props} />
);

// **CARDS ESPECIALIZADAS** ⚡

export const BookCard = ({ 
  book, 
  onPress, 
  onAddToLibrary, 
  isInLibrary = false,
  imageSize = 'medium',
  showActions = true 
}) => {
  const theme = useTheme();

  const imageSizes = {
    small: { width: 60, height: 90 },
    medium: { width: 80, height: 120 },
    large: { width: 100, height: 150 }
  };

  const imageStyle = imageSizes[imageSize] || imageSizes.medium;

  const cardStyles = StyleSheet.create({
    bookCard: {
      marginVertical: theme.spacing.xs,
    },
    bookContent: {
      flexDirection: 'row',
    },
    imageContainer: {
      marginRight: theme.spacing.md,
    },
    image: {
      ...imageStyle,
      borderRadius: 8,
      backgroundColor: theme.customColors.background.secondary,
    },
    bookInfo: {
      flex: 1,
    },
    bookTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.customColors.text.primary,
      marginBottom: 4,
    },
    bookAuthor: {
      fontSize: 14,
      color: theme.customColors.text.secondary,
      marginBottom: 8,
    },
    bookDescription: {
      fontSize: 13,
      color: theme.customColors.text.secondary,
      lineHeight: 18,
    },
    actionButton: {
      alignSelf: 'flex-start',
      marginTop: 8,
    }
  });

  const actions = showActions ? (
    <IconButton
      icon={isInLibrary ? "check" : "plus"}
      iconColor={isInLibrary ? theme.customColors.success : theme.customColors.primary}
      size={20}
      onPress={onAddToLibrary}
      disabled={isInLibrary}
    />
  ) : null;

  return (
    <Card
      variant="default"
      onPress={onPress}
      actions={actions}
      style={cardStyles.bookCard}
      testID={`book-card-${book.bookId}`}
    >
      <View style={cardStyles.bookContent}>
        <View style={cardStyles.imageContainer}>
          <View style={cardStyles.image} />
        </View>
        
        <View style={cardStyles.bookInfo}>
          <Text style={cardStyles.bookTitle} numberOfLines={2}>
            {book.titulo}
          </Text>
          <Text style={cardStyles.bookAuthor} numberOfLines={1}>
            {book.autor}
          </Text>
          {book.sinopsis && (
            <Text style={cardStyles.bookDescription} numberOfLines={3}>
              {book.sinopsis}
            </Text>
          )}
        </View>
      </View>
    </Card>
  );
};

export const StatsCard = ({ title, value, icon, color, subtitle = null }) => {
  const theme = useTheme();

  const statsStyles = StyleSheet.create({
    statsContent: {
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
    },
    iconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: color + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    value: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.customColors.text.primary,
      marginBottom: 4,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.customColors.text.primary,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: theme.customColors.text.secondary,
      textAlign: 'center',
      marginTop: 4,
    }
  });

  return (
    <ElevatedCard>
      <View style={statsStyles.statsContent}>
        <View style={statsStyles.iconContainer}>
          <IconButton
            icon={icon}
            iconColor={color}
            size={28}
            style={{ margin: 0 }}
          />
        </View>
        <Text style={statsStyles.value}>{value}</Text>
        <Text style={statsStyles.title}>{title}</Text>
        {subtitle && (
          <Text style={statsStyles.subtitle}>{subtitle}</Text>
        )}
      </View>
    </ElevatedCard>
  );
};

export default Card;