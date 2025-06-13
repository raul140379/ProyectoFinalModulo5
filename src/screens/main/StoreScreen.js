import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { booksApiService } from '../../services/api/booksApiService';
import { firestoreService } from '../../services/firebase/firestoreService';

import BookList from '../../components/books/BookList';
import { 
  LoadingSpinner, 
  ErrorState,
  EmptySearchState 
} from '../../components/common';

/**
 * **PANTALLA STORE EDUCATIVA** 🏪
 * 
 * Pantalla de tienda que demuestra búsqueda y exploración de libros:
 * - Búsqueda en tiempo real con debounce
 * - Filtros por categoría
 * - Carga de catálogo completo
 * - Gestión de estados de carga y error
 * - Integración con librería personal
 * 
 * Principios UX demostrados:
 * - Búsqueda eficiente y responsiva
 * - Feedback visual constante
 * - Manejo de estados de red
 * - Prevención de acciones duplicadas
 * - Navegación intuitiva
 */

const StoreScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { showBookAdded, showError, showNetworkError } = useToast();

  // **ESTADO LOCAL** 📊
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [userLibrary, setUserLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setStoreError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // **PARÁMETROS DE NAVEGACIÓN** 🧭
  const initialSearch = route?.params?.searchQuery || '';

  // **ESTILOS DINÁMICOS** 🎨
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.customColors.background.primary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      paddingVertical: theme.spacing.xxl,
    },
    errorContainer: {
      flex: 1,
      minHeight: 400,
    }
  });

  // **CARGAR CATÁLOGO INICIAL** 📥
  const loadInitialCatalog = useCallback(async () => {
    try {
      setLoading(true);
      setStoreError(null);

      // Cargar catálogo de libros y librería del usuario en paralelo
      const [booksResult, libraryResult] = await Promise.all([
        booksApiService.getAllBooks(true), // Usar cache
        user ? firestoreService.getUserLibrary(user.uid) : Promise.resolve({ success: true, data: [] })
      ]);

      if (booksResult.success) {
        setBooks(booksResult.data);
        setFilteredBooks(booksResult.data);
      } else {
        throw new Error(booksResult.error || 'Error cargando catálogo');
      }

      if (libraryResult.success) {
        setUserLibrary(libraryResult.data);
      }

      // Si hay búsqueda inicial, ejecutarla
      if (initialSearch) {
        setSearchQuery(initialSearch);
        handleSearch(initialSearch);
      }

    } catch (error) {
      console.error('Error cargando catálogo:', error);
      setStoreError(error.message);
      
      if (error.message.includes('conexión') || error.message.includes('network')) {
        showNetworkError();
      }
    } finally {
      setLoading(false);
    }
  }, [user, initialSearch, showNetworkError]);

  // **MANEJAR BÚSQUEDA** 🔍
  const handleSearch = useCallback(async (query) => {
    try {
      setSearchQuery(query);
      setHasSearched(true);

      if (!query.trim()) {
        // Si no hay query, mostrar todos los libros
        setFilteredBooks(books);
        return;
      }

      setSearchLoading(true);
      
      // Intentar búsqueda en API primero
      const searchResult = await booksApiService.searchBooks(query.trim());
      
      if (searchResult.success && searchResult.data.length > 0) {
        setFilteredBooks(searchResult.data);
      } else {
        // Si no hay resultados en API, buscar localmente
        const localResults = books.filter(book => 
          book.titulo?.toLowerCase().includes(query.toLowerCase()) ||
          book.autor?.toLowerCase().includes(query.toLowerCase()) ||
          book.sinopsis?.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredBooks(localResults);
      }

    } catch (error) {
      console.error('Error en búsqueda:', error);
      // En caso de error, buscar localmente como fallback
      const localResults = books.filter(book => 
        book.titulo?.toLowerCase().includes(query.toLowerCase()) ||
        book.autor?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredBooks(localResults);
    } finally {
      setSearchLoading(false);
    }
  }, [books]);

  // **EFECTOS** ⚡
  useEffect(() => {
    loadInitialCatalog();
  }, [loadInitialCatalog]);

  // **NAVEGAR A DETALLE DE LIBRO** 📖
  const handleBookPress = useCallback((book) => {
    navigation.navigate('BookDetail', { 
      book,
      fromStore: true 
    });
  }, [navigation]);

  // **AGREGAR LIBRO A LIBRERÍA** ➕
  const handleAddToLibrary = useCallback(async (book) => {
    if (!user) {
      showError('Debes iniciar sesión para agregar libros');
      navigation.navigate('Auth');
      return;
    }

    try {
      const result = await firestoreService.addBookToLibrary(user.uid, book);
      
      if (result.success) {
        // Actualizar librería local
        setUserLibrary(prev => [...prev, book]);
        
        // Mostrar confirmación
        showBookAdded(book.titulo);
      } else {
        showError(result.error || 'Error agregando libro');
      }
    } catch (error) {
      console.error('Error agregando libro:', error);
      showError('Error agregando libro a tu librería');
    }
  }, [user, showBookAdded, showError, navigation]);

  // **ACTUALIZAR DATOS** 🔄
  const handleRefresh = useCallback(async () => {
    // Limpiar cache para obtener datos frescos
    booksApiService.clearAllCache();
    await loadInitialCatalog();
  }, [loadInitialCatalog]);

  // **CONFIGURACIÓN DE EMPTY STATE** 📭
  const getEmptyStateConfig = () => {
    if (hasSearched && searchQuery) {
      return {
        component: EmptySearchState,
        props: {
          searchTerm: searchQuery,
          onClearSearch: () => {
            setSearchQuery('');
            setFilteredBooks(books);
            setHasSearched(false);
          }
        }
      };
    }

    return {
      component: EmptySearchState,
      props: {
        searchTerm: '',
        onClearSearch: () => {}
      }
    };
  };

  // **RENDERIZAR ESTADO DE CARGA INICIAL** ⏳
  if (loading) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <View style={dynamicStyles.loadingContainer}>
          <LoadingSpinner
            size="large"
            message="Cargando catálogo de libros..."
          />
        </View>
      </SafeAreaView>
    );
  }

  // **RENDERIZAR ESTADO DE ERROR** ❌
  if (error && books.length === 0) {
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
      <BookList
        books={filteredBooks}
        loading={searchLoading}
        error={error}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        onBookPress={handleBookPress}
        onAddToLibrary={handleAddToLibrary}
        searchPlaceholder="Buscar libros por título, autor..."
        showFilters={true}
        showSearch={true}
        emptyStateConfig={getEmptyStateConfig()}
        userLibrary={userLibrary}
        testID="store-book-list"
      />
    </SafeAreaView>
  );
};

export default StoreScreen;