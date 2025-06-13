import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import {
  Text,
  Surface,
  Avatar,
  Button,
  Divider,
  List,
  Switch,
  Dialog,
  Portal,
  TextInput
} from 'react-native-paper';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { firestoreService } from '../../services/firebase/firestoreService'; 
import { storageService } from '../../services/firebase/storageService';
import { doc, getDoc, setDoc, collection, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseAuth,getFirebaseFirestore,getFirebaseStorage } from '../../services/firebase/firebaseConfig';
 

import {
  LoadingSpinner,
  StatsCard,
  ErrorState
} from '../../components/common';
import { getStorage } from 'firebase/storage';

/**
 * **PANTALLA PROFILE EDUCATIVA** 👤
 * 
 * Pantalla de perfil del usuario que demuestra:
 * - Información personal y avatar
 * - Estadísticas de actividad
 * - Configuraciones de la aplicación
 * - Gestión de cuenta (editar perfil, cerrar sesión)
 * - Preferencias de notificaciones
 * - Información de la aplicación
 * 
 * Conceptos educativos demostrados:
 * - Gestión de perfil de usuario
 * - Formularios de edición con validación
 * - Configuraciones de aplicación
 * - Manejo de logout y sesiones
 * - Dialogs y confirmaciones
 * - Integración con servicios de backend
 */

const ProfileScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user, userProfile, logout } = useAuth();
  const { showSuccess, showError } = useToast();

     
  


  // **ESTADO LOCAL signIn** 📊
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);
 // estado par ala foto de perfil
const [uploadedImageUrl, setUploadedImageUrl] = useState(null); // URL de la imagen en Firebase
  const [isLoading, setIsLoading] = useState(false);     // Estado de carga
  const [uploadProgress, setUploadProgress] = useState(''); // Texto de progreso
  const defaultImage = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
  const fotoUrl=userProfile?.fotoPerfilUrl||'';
 const [imageUri, setImageUri] = useState(fotoUrl) // URI de la imagen seleccionada
  // Estados para diálogos
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  //const db = getFirebaseFirestore(); 
  const auth = getFirebaseAuth();
  const db = getFirebaseFirestore(); 
  const storage=getFirebaseStorage()

  // Estados para configuraciones
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Estados para edición de perfil
  const [editForm, setEditForm] = useState({
    nombre: '',
    apellido: '',
    bio: ''
  });

  // **ESTILOS DINÁMICOS** 🎨
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.customColors.background.primary,
    },
    header: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
      backgroundColor: theme.customColors.background.card,
      alignItems: 'center',
    },
    avatarContainer: {
      marginBottom: theme.spacing.lg,
      alignItems: 'center',
    },
    avatar: {
      backgroundColor: theme.customColors.primary,
    },
    editAvatarButton: {
      position: 'absolute',
      right: -5,
      bottom: -5,
      backgroundColor: theme.customColors.secondary,
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    userInfo: {
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    userName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.customColors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    userEmail: {
      fontSize: 16,
      color: theme.customColors.text.secondary,
      marginBottom: theme.spacing.sm,
    },
    userBio: {
      fontSize: 14,
      color: theme.customColors.text.secondary,
      textAlign: 'center',
      paddingHorizontal: theme.spacing.xl,
      lineHeight: 20,
    },
    editButton: {
      marginTop: theme.spacing.md,
    },
    statsSection: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.customColors.text.primary,
      marginBottom: theme.spacing.md,
    },
    statsContainer: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    statCard: {
      flex: 1,
    },
    settingsSection: {
      paddingVertical: theme.spacing.lg,
    },
    settingItem: {
      paddingHorizontal: theme.spacing.xl,
    },
    divider: {
      marginVertical: theme.spacing.md,
      marginHorizontal: theme.spacing.xl,
    },
    dangerZone: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
    },
    dangerButton: {
      borderColor: theme.customColors.error,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      paddingVertical: theme.spacing.xxl,
    },
    errorContainer: {
      flex: 1,
      minHeight: 400,
    },
    dialogContent: {
      paddingBottom: theme.spacing.lg,
    },
    formField: {
      marginBottom: theme.spacing.md,
    },
  });
  //**CONFIGURACION PARA ACTUALIZAR FOTO DE PERFIL */
  //**to */
   const selectAndUploadImage = async () => {
    try {
      // **PASO 1: SOLICITAR PERMISOS** 🔐
      // Necesitamos permisos para acceder a la galería de fotos
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permisos necesarios',
          'La app necesita permisos para acceder a tus fotos'
        );
        return;
      }

      // **PASO 2: ABRIR SELECTOR DE IMÁGENES** 🖼️
      setUploadProgress('Seleccionando imagen...');
      
      const result = await ImagePicker.launchImageLibraryAsync({
        //mediaTypes: ImagePicker.MediaTypeOptions.Images, // Solo imágenes
        allowsEditing: true,   // Permitir edición/recorte
        aspect: [1, 1],        // Aspecto cuadrado
        quality: 0.8,          // Calidad de imagen (80%)
      });

      // Si el usuario canceló la selección
      if (result.canceled) {
        setUploadProgress('');
        return;
      }

      // **PASO 3: PREPARAR PARA CARGA** 🚀
      const selectedImage = result.assets[0];
      setImageUri(selectedImage.uri); // Mostrar imagen seleccionada
      setIsLoading(true);
      setUploadProgress('Preparando imagen...');

      // **PASO 4: CONVERTIR IMAGEN A BLOB** 💾
      // Firebase Storage necesita un Blob para cargar archivos
     setUploadProgress('Convirtiendo imagen...');
      
      const response = await fetch(selectedImage.uri);
      const blob = await response.blob();

      // **PASO 5: CREAR REFERENCIA EN STORAGE** 📁
      // Crear un nombre único para la imagen usando timestamp
      const timestamp = Date.now();
      const fileName = `images/demo_image_${timestamp}.jpg`;
      const storageRef = ref(storage, fileName);

      setUploadProgress('Subiendo a Firebase Storage...');

      // **PASO 6: CARGAR IMAGEN A FIREBASE STORAGE** ⬆️
      // uploadBytes() sube el archivo al servidor
      const snapshot = await uploadBytes(storageRef, blob);
      
      console.log('✅ Imagen cargada exitosamente:', snapshot.metadata.name);

      // **PASO 7: OBTENER URL DE DESCARGA** 🔗
      // getDownloadURL() nos da la URL pública para mostrar la imagen
      setUploadProgress('Obteniendo URL de imagen...');
      
      const downloadURL = await getDownloadURL(storageRef);
      
      // **PASO 8: MOSTRAR IMAGEN DESDE STORAGE** 🖼️
      setUploadedImageUrl(downloadURL);
      setUploadProgress('¡Imagen cargada exitosamente!');
      
      console.log('🔗 URL de descarga:', downloadURL);

      // Limpiar mensaje de progreso después de 2 segundos
      setTimeout(() => {
        setUploadProgress('');
      }, 2000);
      //actualizando la foto del perfil de usuario 
       updatePhotoUser(user.uid,downloadURL);

    } catch (error) {
      // **MANEJO DE ERRORES** ❌
      console.error('❌ Error en el proceso:', error);
      
      Alert.alert(
        'Error',
        'Hubo un problema al cargar la imagen. Verifica que el emulador esté funcionando.',
        [{ text: 'OK' }]
      );
      
      setUploadProgress('');
    } finally {
      // **LIMPIAR ESTADO DE CARGA** 🧹
      setIsLoading(false);
    }
  };
  /**Actualizar Photo de Usuario */
     const updatePhotoUser = async (userId,PhotoURL) => {
      try {
          console.log("Mi base de dato",db)
          console.log("Mi usuario: ",userId)
          console.log("MI URL de mi foto: ",PhotoURL)
          await updateDoc(doc(db, 'users', userId), {
            fotoPerfilUrl: PhotoURL,
          });
      } catch (error) {
        console.warn('⚠️ No se pudo actualizar la foto de perfil:', error);
        // No lanzar error, es una operación secundaria
      }
    };
    /**
  //**tomar foto */
  const handleSubirImage = async () => {
    try {
      // **PASO 1: SOLICITAR PERMISOS AL DISPOSITIVO** 🔐
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      //const  {status}  = await ImagePicker.requestMediaLibraryPermissionsAsync();
      //  console.log(status)
      if (status !== 'granted') {
        Alert.alert(
          'Permisos necesarios',
          'La app necesita permisos para acceder a tus fotos'
        );
        console.log('Permiso negado')
        return;
      }
      console.log('✅ Perfil de usuario con Acceso A LA CAMARA  y librerias');
      // **PASO 2: ABRIR SELECTOR DE IMÁGENES** 🖼️
      const resultPicker = await ImagePicker.launchImageLibraryAsync({
        // mediaTypes: ImagePicker.MediaTypeOptions.Images, // Solo imágenes
        allowsEditing: true,   // Permitir edición/recorte
        aspect: [1, 1],        // Aspecto cuadrado
        quality: 0.8,          // Calidad de imagen (80%)
      });

      // Si el usuario canceló la selección
      if (resultPicker.canceled) {
        Alert.alert('Se ha cancelado la selecion de imagen'
        );
        return;
      }
      console.log('se selecciono la imagen ');
      //const uri = result.assets[0].uri;

      // **PASO 3: PREPARAR PARA CARGA** 🚀
      const selectedImage = resultPicker.assets[0];
      setImageUri(selectedImage.uri); // Mostrar imagen seleccionada

      // **PASO 4: CONVERTIR IMAGEN A BLOB** 💾     
      console.log('se esta procediendo al guardado: ');
      const downloadURL = await storageService.uploadProfileImage(user, selectedImage.uri)
      console.log("dowload cargado : " + downloadURL);
     // console.log(downloadURL.data);
      // **PASO : ACTULIZAR CAMPO USER FOTOPERFILURL A BLOB** 💾
      try {
        // Obtener referencia al documento del usuario
        // const uid = auth.currentUser?.uid; autentificar el usuario
        if (!user) {
          console.error('Usuario no autenticado');
          return;
        }
        // debe mostrar un objeto DocumentReference
        console.log("db es:", db);
        const userDocRef = doc(db, 'users', user);
        if (!userDocRef) {
          console.error('Referencia al documento inválida');
          return;
        }
        // debe ser una URL tipo https://...
        //const downloadURL = await getDownloadURL(storageRef);

        if (typeof downloadURL !== 'string') {
          console.error('URL de descarga inválida');
          return;
        }

        console.log(user)
       // const userRef = collection(db, "users").doc(user);
        // const userDocRef = doc(db, 'users', user);
        await updateDoc(userDocRef, {
          fotoPerfilUrl: 'foto actualizado',
        });
        console.log('Foto guardado exitosamente de perfil');
      } catch (error) {
        console.warn('⚠️ No se pudo actualizar la foto de perfil:', error);
        // No lanzar error, es una operación secundaria
      }
      //const resultUpdateUser =await updateDoc(doc(db, 'users', user), {fotoPerfilUrl: downloadURL});

      //console.log( resultUpdateUser)

      alert('elegiste tu imagen :')
      // alert('finalizo la seleccion:',result.assets[0].uri)
    }
    catch (error) {
      console.error('Error al seleccionar la imagen:', error)
      showMessage({
        message: 'Error',
        description: 'Ocuarrio un error al intentar seleccionar la imagen',
        type: 'danger',
      });
    }
  }
  // **CARGAR DATOS** 📥
  const loadProfileData = useCallback(async () => {
    try {
      setError(null);

      if (!user) return;

      const statsResult = await firestoreService.getUserStats(user.uid);

      if (statsResult.success) {
        setStats(statsResult.data);
      }

    } catch (error) {
      console.error('Error cargando datos del perfil:', error);
      setError('Error cargando datos del perfil. Verifica tu conexión.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // **EFECTOS** ⚡
  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  useEffect(() => {
    if (userProfile) {
      setEditForm({
        nombre: userProfile.nombre || '',
        apellido: userProfile.apellido || '',
        bio: userProfile.bio || ''
      });
    }
  }, [userProfile]);

  // **MANEJAR REFRESH** 🔄
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProfileData();
  }, [loadProfileData]);

  // **MANEJAR LOGOUT** 🚪
  const handleLogout = useCallback(async () => {
    try {
      setShowLogoutDialog(false);
      const result = await logout();

      if (result.success) {
        showSuccess('Sesión cerrada exitosamente');
      } else {
        showError(result.error || 'Error cerrando sesión');
      }
    } catch (error) {
      showError('Error cerrando sesión');
    }
  }, [logout, showSuccess, showError]);

  // **MANEJAR EDICIÓN DE PERFIL** ✏️
  const handleEditProfile = useCallback(async () => {
    try {
      if (!user) return;

      const result = await firestoreService.updateUserProfile(user.uid, {
        nombre: editForm.nombre.trim(),
        apellido: editForm.apellido.trim(),
        bio: editForm.bio.trim(),
        fechaActualizacion: new Date().toISOString()
      });

      if (result.success) {
        setShowEditDialog(false);
        showSuccess('Perfil actualizado exitosamente');
        await loadProfileData(); // Recargar datos
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      showError('Error actualizando perfil');
    }
  }, [user, editForm, showSuccess, showError, loadProfileData]);

  // **OBTENER INICIALES** 📝
  const getUserInitials = () => {
    const nombre = userProfile?.nombre || user?.displayName || user?.email || '';
    const apellido = userProfile?.apellido || '';
    

    const inicial1 = nombre.charAt(0).toUpperCase();
    const inicial2 = apellido.charAt(0).toUpperCase();

    return inicial2 ? `${inicial1}${inicial2}` : inicial1 || '?';
  };

  // **OBTENER NOMBRE COMPLETO** 👤
  const getFullName = () => {
    const nombre = userProfile?.nombre || '';
    const apellido = userProfile?.apellido || '';

    //setImageUri(fotoUrl);
    console.log(fotoUrl);
    if (nombre && apellido) {
      return `${nombre} ${apellido}`;
    } else if (nombre) {
      return nombre;
    } else if (user?.displayName) {
      return user.displayName;
    } else {
      return 'Usuario';
    }
  };

  // **RENDERIZAR ESTADÍSTICAS** 📊
  const renderStats = () => {
    if (!stats) return null;

    return (
      <View style={dynamicStyles.statsContainer}>
        <StatsCard
          title="Libros"
          value={stats.totalLibros}
          icon="book"
          color={theme.customColors.primary}
          subtitle="en librería"
          style={dynamicStyles.statCard}
        />

        <StatsCard
          title="Reseñas"
          value={stats.totalReseñas}
          icon="star"
          color={theme.customColors.secondary}
          subtitle="escritas"
          style={dynamicStyles.statCard}
        />

        <StatsCard
          title="Promedio"
          value={stats.promedioCalificacion ? stats.promedioCalificacion.toFixed(1) : '-'}
          icon="chart-line"
          color={theme.customColors.success}
          subtitle="calificación"
          style={dynamicStyles.statCard}
        />
      </View>
    );
  };

  // **RENDERIZAR CONFIGURACIONES** ⚙️
  const renderSettings = () => (
    <View style={dynamicStyles.settingsSection}>
      <Text style={[dynamicStyles.sectionTitle, { paddingHorizontal: theme.spacing.xl }]}>
        Configuraciones
      </Text>

      <List.Item
        title="Notificaciones"
        description="Recibir notificaciones push"
        left={() => <List.Icon icon="bell" />}
        right={() => (
          <Switch
            value={notifications}
            onValueChange={setNotifications}
          />
        )}
        style={dynamicStyles.settingItem}
      />

      <List.Item
        title="Modo oscuro"
        description="Cambiar tema de la aplicación"
        left={() => <List.Icon icon="theme-light-dark" />}
        right={() => (
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
          />
        )}
        style={dynamicStyles.settingItem}
      />

      <Divider style={dynamicStyles.divider} />

      <List.Item
        title="Privacidad"
        description="Configurar privacidad de datos"
        left={() => <List.Icon icon="shield-account" />}
        right={() => <List.Icon icon="chevron-right" />}
        onPress={() => {/* Navegar a configuración de privacidad */ }}
        style={dynamicStyles.settingItem}
      />

      <List.Item
        title="Acerca de"
        description="Información de la aplicación"
        left={() => <List.Icon icon="information" />}
        right={() => <List.Icon icon="chevron-right" />}
        onPress={() => {/* Navegar a información de la app */ }}
        style={dynamicStyles.settingItem}
      />
    </View>
  );

  // **RENDERIZAR ZONA DE PELIGRO** ⚠️
  const renderDangerZone = () => (
    <View style={dynamicStyles.dangerZone}>
      <Text style={dynamicStyles.sectionTitle}>Zona de peligro</Text>

      <Button
        mode="outlined"
        icon="logout"
        onPress={() => setShowLogoutDialog(true)}
        style={dynamicStyles.dangerButton}
        textColor={theme.customColors.error}
      >
        Cerrar Sesión
      </Button>
    </View>
  );

  // **RENDERIZAR DIÁLOGO DE LOGOUT** 🚪
  const renderLogoutDialog = () => (
    <Portal>
      <Dialog visible={showLogoutDialog} onDismiss={() => setShowLogoutDialog(false)}>
        <Dialog.Icon icon="logout" />
        <Dialog.Title>Cerrar Sesión</Dialog.Title>
        <Dialog.Content style={dynamicStyles.dialogContent}>
          <Text>¿Estás seguro de que quieres cerrar sesión?</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowLogoutDialog(false)}>Cancelar</Button>
          <Button onPress={handleLogout} mode="contained">Cerrar Sesión</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  // **RENDERIZAR DIÁLOGO DE EDICIÓN** ✏️
  const renderEditDialog = () => (
    <Portal>
      <Dialog visible={showEditDialog} onDismiss={() => setShowEditDialog(false)}>
        <Dialog.Title>Editar Perfil</Dialog.Title>
        <Dialog.Content style={dynamicStyles.dialogContent}>
          <TextInput
            label="Nombre"
            value={editForm.nombre}
            onChangeText={(text) => setEditForm(prev => ({ ...prev, nombre: text }))}
            style={dynamicStyles.formField}
            mode="outlined"
          />

          <TextInput
            label="Apellido"
            value={editForm.apellido}
            onChangeText={(text) => setEditForm(prev => ({ ...prev, apellido: text }))}
            style={dynamicStyles.formField}
            mode="outlined"
          />

          <TextInput
            label="Bio"
            value={editForm.bio}
            onChangeText={(text) => setEditForm(prev => ({ ...prev, bio: text }))}
            multiline
            numberOfLines={3}
            style={dynamicStyles.formField}
            mode="outlined"
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowEditDialog(false)}>Cancelar</Button>
          <Button onPress={handleEditProfile} mode="contained">Guardar</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  // **RENDERIZAR ESTADO DE CARGA** ⏳
  if (loading) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <View style={dynamicStyles.loadingContainer}>
          <LoadingSpinner
            size="large"
            message="Cargando perfil..."
          />
        </View>
      </SafeAreaView>
    );
  }

  // **RENDERIZAR ESTADO DE ERROR** ❌
  if (error) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <View style={dynamicStyles.errorContainer}>
          <ErrorState
            onRetry={handleRefresh}
            error={error}
          />
        </View>
      </SafeAreaView>
    );
  }

  // **RENDERIZAR CONTENIDO PRINCIPAL** 🏗️
  return (
    <SafeAreaView style={dynamicStyles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.customColors.primary]}
            tintColor={theme.customColors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header con información del usuario */}
        <View style={dynamicStyles.header}>
          <View style={dynamicStyles.avatarContainer}>
            <Avatar.Image
              size={100}
              label='raul'
              style={dynamicStyles.avatar}
              source={{ uri: imageUri || defaultImage }}
            />
            <Surface style={dynamicStyles.editAvatarButton}>
              <Icon
                name="camera"
                size={20}
                color="white"
                onPress={selectAndUploadImage}
              />
            </Surface>
          </View>

          <View style={dynamicStyles.userInfo}>
            <Text style={dynamicStyles.userName}>{getFullName()}</Text>
            <Text style={dynamicStyles.userEmail}>{user?.email}</Text>
            {userProfile?.bio ? (
              <Text style={dynamicStyles.userBio}>{userProfile.bio}</Text>
            ) : null}

            <Button
              mode="outlined"
              icon="pencil"
              onPress={() => setShowEditDialog(true)}
              style={dynamicStyles.editButton}
            >
              Editar Perfil
            </Button>
          </View>
        </View>

        {/* Estadísticas */}
        <View style={dynamicStyles.statsSection}>
          <Text style={dynamicStyles.sectionTitle}>Tus Estadísticas</Text>
          {renderStats()}
        </View>

        <Divider style={dynamicStyles.divider} />

        {/* Configuraciones */}
        {renderSettings()}

        <Divider style={dynamicStyles.divider} />

        {/* Zona de peligro */}
        {renderDangerZone()}
      </ScrollView>

      {/* Diálogos */}
      {renderLogoutDialog()}
      {renderEditDialog()}
    </SafeAreaView>
  );
};

export default ProfileScreen;