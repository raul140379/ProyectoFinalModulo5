import React, { useEffect } from 'react';
import { View, StyleSheet, BackHandler, Dimensions } from 'react-native';
import { Modal as RNModal, Portal, Text, IconButton } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import Button from './Button';

/**
 * **COMPONENTE MODAL EDUCATIVO** 🪟
 * 
 * Modal flexible que demuestra patrones de UX para ventanas modales:
 * - Overlay semi-transparente
 * - Animaciones suaves de entrada/salida
 * - Gestión del back button (Android)
 * - Diferentes tamaños y posiciones
 * - Acciones personalizables
 * 
 * Principios UX demostrados:
 * - Enfoque en el contenido principal
 * - Escape fácil y claro
 * - Responsive design
 * - Accesibilidad completa
 * - Jerarquía visual clara
 */

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const Modal = ({
  visible = false,
  onDismiss = () => {},
  title = null,
  children,
  actions = null,
  size = 'medium', // 'small', 'medium', 'large', 'fullscreen'
  position = 'center', // 'center', 'bottom', 'top'
  dismissable = true,
  showCloseButton = true,
  style = null,
  contentContainerStyle = null,
  testID = null,
  ...props
}) => {
  const theme = useTheme();

  // **MANEJO DEL BACK BUTTON (ANDROID)** 📱
  useEffect(() => {
    if (!visible) return;

    const handleBackPress = () => {
      if (dismissable) {
        onDismiss();
        return true; // Prevenir el comportamiento por defecto
      }
      return true; // Bloquear back button si no es dismissable
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    
    return () => {
      backHandler.remove();
    };
  }, [visible, dismissable, onDismiss]);

  // **CONFIGURACIÓN DE TAMAÑOS** 📏
  const getSizeConfig = () => {
    const configs = {
      small: {
        width: Math.min(SCREEN_WIDTH * 0.8, 300),
        maxHeight: SCREEN_HEIGHT * 0.5,
        borderRadius: 16,
      },
      medium: {
        width: Math.min(SCREEN_WIDTH * 0.9, 400),
        maxHeight: SCREEN_HEIGHT * 0.7,
        borderRadius: 16,
      },
      large: {
        width: Math.min(SCREEN_WIDTH * 0.95, 500),
        maxHeight: SCREEN_HEIGHT * 0.8,
        borderRadius: 16,
      },
      fullscreen: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        borderRadius: 0,
      }
    };
    
    return configs[size] || configs.medium;
  };

  // **CONFIGURACIÓN DE POSICIÓN** 📍
  const getPositionConfig = () => {
    const configs = {
      center: {
        justifyContent: 'center',
        alignItems: 'center',
      },
      bottom: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 20,
      },
      top: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 60,
      }
    };
    
    return configs[position] || configs.center;
  };

  const sizeConfig = getSizeConfig();
  const positionConfig = getPositionConfig();

  // **ESTILOS DINÁMICOS** 🎨
  const dynamicStyles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      ...positionConfig,
    },
    container: {
      backgroundColor: theme.customColors.background.primary,
      borderRadius: sizeConfig.borderRadius,
      width: sizeConfig.width,
      maxHeight: sizeConfig.maxHeight,
      ...(sizeConfig.height && { height: sizeConfig.height }),
      ...theme.shadows.large,
      elevation: 8,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.customColors.border.light,
      minHeight: 60,
    },
    titleContainer: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.customColors.text.primary,
    },
    closeButton: {
      margin: 0,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    scrollContent: {
      flexGrow: 1,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.customColors.border.light,
      gap: theme.spacing.sm,
    },
    fullscreenContent: {
      flex: 1,
    }
  });

  // **MANEJAR CIERRE** 👋
  const handleDismiss = () => {
    if (dismissable) {
      onDismiss();
    }
  };

  // **RENDERIZAR HEADER** 📝
  const renderHeader = () => {
    if (!title && !showCloseButton) return null;

    return (
      <View style={dynamicStyles.header}>
        <View style={dynamicStyles.titleContainer}>
          {title && (
            <Text style={dynamicStyles.title} numberOfLines={2}>
              {title}
            </Text>
          )}
        </View>
        
        {showCloseButton && (
          <IconButton
            icon="close"
            size={24}
            onPress={handleDismiss}
            style={dynamicStyles.closeButton}
            accessibilityLabel="Cerrar modal"
          />
        )}
      </View>
    );
  };

  // **RENDERIZAR CONTENIDO** 📄
  const renderContent = () => {
    if (size === 'fullscreen') {
      return (
        <View style={dynamicStyles.fullscreenContent}>
          {children}
        </View>
      );
    }

    return (
      <View style={dynamicStyles.content}>
        {children}
      </View>
    );
  };

  // **RENDERIZAR FOOTER** 🦶
  const renderFooter = () => {
    if (!actions || size === 'fullscreen') return null;

    return (
      <View style={dynamicStyles.footer}>
        {actions}
      </View>
    );
  };

  return (
    <Portal>
      <RNModal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={[
          dynamicStyles.overlay,
          style
        ]}
        dismissable={dismissable}
        {...props}
      >
        <View 
          style={[dynamicStyles.container, contentContainerStyle]}
          testID={testID}
          accessible={true}
          accessibilityRole="dialog"
          accessibilityLabel={title || 'Modal'}
          accessibilityViewIsModal={true}
        >
          {renderHeader()}
          {renderContent()}
          {renderFooter()}
        </View>
      </RNModal>
    </Portal>
  );
};

// **VARIANTES PREDEFINIDAS** 🎯

export const ConfirmationModal = ({
  visible,
  onDismiss,
  onConfirm,
  title = 'Confirmar acción',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmVariant = 'primary',
  loading = false,
  ...props
}) => {
  const actions = (
    <>
      <Button
        variant="text"
        onPress={onDismiss}
        disabled={loading}
      >
        {cancelText}
      </Button>
      <Button
        variant={confirmVariant}
        onPress={onConfirm}
        loading={loading}
      >
        {confirmText}
      </Button>
    </>
  );

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      title={title}
      actions={actions}
      size="small"
      dismissable={!loading}
      {...props}
    >
      <Text style={{ fontSize: 16, lineHeight: 24 }}>
        {message}
      </Text>
    </Modal>
  );
};

export const AlertModal = ({
  visible,
  onDismiss,
  title = 'Información',
  message,
  buttonText = 'Entendido',
  ...props
}) => {
  const actions = (
    <Button variant="primary" onPress={onDismiss}>
      {buttonText}
    </Button>
  );

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      title={title}
      actions={actions}
      size="small"
      {...props}
    >
      <Text style={{ fontSize: 16, lineHeight: 24 }}>
        {message}
      </Text>
    </Modal>
  );
};

export const BottomSheetModal = (props) => (
  <Modal
    position="bottom"
    size="medium"
    {...props}
  />
);

export const FullscreenModal = (props) => (
  <Modal
    size="fullscreen"
    showCloseButton={true}
    {...props}
  />
);

// **HOOK PARA MANEJO DE MODALES** 🪝
export const useModal = (initialState = false) => {
  const [visible, setVisible] = React.useState(initialState);

  const showModal = React.useCallback(() => {
    setVisible(true);
  }, []);

  const hideModal = React.useCallback(() => {
    setVisible(false);
  }, []);

  const toggleModal = React.useCallback(() => {
    setVisible(prev => !prev);
  }, []);

  return {
    visible,
    showModal,
    hideModal,
    toggleModal
  };
};

export default Modal;