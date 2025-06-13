import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

/**
 * **COMPONENTE STATS CARD EDUCATIVO** 📊
 * 
 * Tarjeta para mostrar estadísticas de manera visual.
 * Demuestra presentación de datos numéricos con iconografía.
 * 
 * Principios UX demostrados:
 * - Visualización clara de métricas
 * - Iconografía descriptiva
 * - Jerarquía visual
 * - Accesibilidad integrada
 */

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  color, 
  subtitle = null,
  style = null,
  onPress = null 
}) => {
  const theme = useTheme();

  // **ESTILOS DINÁMICOS** 🎨
  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: theme.customColors.background.card,
      borderRadius: 12,
      padding: theme.spacing.md,
      elevation: 2,
      shadowColor: theme.customColors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      minHeight: 100,
      ...(onPress && {
        borderWidth: 1,
        borderColor: 'transparent'
      })
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    icon: {
      marginRight: theme.spacing.sm,
    },
    title: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.customColors.text.secondary,
      flex: 1,
    },
    valueContainer: {
      marginBottom: theme.spacing.xs,
    },
    value: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.customColors.text.primary,
      lineHeight: 32,
    },
    subtitle: {
      fontSize: 12,
      color: theme.customColors.text.secondary,
      lineHeight: 16,
    }
  });

  const CardComponent = onPress ? Surface : View;
  const cardProps = onPress ? { 
    onTouchEnd: onPress,
    style: [dynamicStyles.container, style],
    accessible: true,
    accessibilityRole: 'button',
    accessibilityLabel: `${title}: ${value}${subtitle ? `, ${subtitle}` : ''}`
  } : {
    style: [dynamicStyles.container, style],
    accessible: true,
    accessibilityLabel: `${title}: ${value}${subtitle ? `, ${subtitle}` : ''}`
  };

  return (
    <CardComponent {...cardProps}>
      {/* **HEADER CON ICONO Y TÍTULO** */}
      <View style={dynamicStyles.header}>
        {icon && (
          <Icon 
            name={icon} 
            size={20} 
            color={color || theme.customColors.primary}
            style={dynamicStyles.icon}
          />
        )}
        <Text style={dynamicStyles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* **VALOR PRINCIPAL** */}
      <View style={dynamicStyles.valueContainer}>
        <Text style={dynamicStyles.value}>
          {value?.toString() || '0'}
        </Text>
      </View>

      {/* **SUBTÍTULO OPCIONAL** */}
      {subtitle && (
        <Text style={dynamicStyles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </CardComponent>
  );
};

// **VARIANTES PREDEFINIDAS** 🎯

export const NumberStatsCard = ({ number, ...props }) => (
  <StatsCard 
    value={number?.toLocaleString() || '0'} 
    {...props} 
  />
);

export const PercentageStatsCard = ({ percentage, ...props }) => (
  <StatsCard 
    value={`${percentage || 0}%`} 
    {...props} 
  />
);

export const CurrencyStatsCard = ({ amount, currency = '$', ...props }) => (
  <StatsCard 
    value={`${currency}${amount?.toLocaleString() || '0'}`} 
    {...props} 
  />
);

export default StatsCard;