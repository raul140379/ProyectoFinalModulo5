import React, { useState, useCallback, useMemo } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Text, Searchbar, Chip } from 'react-native-paper';
import { useTheme } from 'react-native-paper';

import { BookCard, LoadingSpinner, EmptySearchState, ErrorState } from '../common';

/**
 * **COMPONENTE BOOK LIST EDUCATIVO** 📚
 * 
 * Lista de libros con funcionalidades avanzadas que demuestra:
 * - Búsqueda en tiempo real con debounce
 * - Filtros por categoría
 * - Paginación infinita
 * - Pull to refresh
 * - Estados de carga y error
 * - Optimización de rendimiento
 * 
 * Principios UX demostrados:
 * - Feedback inmediato en búsquedas
 * - Filtros claros y accesibles
 * - Carga progresiva de contenido
 * - Recuperación de errores
 * - Optimización de performance
 */

const BookList = ({
  books = [],
  loading = false,
  error = null,
  onSearch = null,
  onLoadMore = null,
  onRefresh = null,
  onBookPress = null,
  onAddToLibrary = null,
  searchPlaceholder = 'Buscar libros...',
  showFilters = true,
  showSearch = true,
  emptyStateConfig = {},
  userLibrary = [],
  testID = null,
  ...props
}) => {
  const theme = useTheme();
  
  // **ESTADO LOCAL** 📊
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // **FILTROS DISPONIBLES** 🏷️
  const availableFilters = useMemo(() => {
    const genres = new Set();
    books.forEach(book => {
      if (book.generos) {
        book.generos.forEach(genre => genres.add(genre));
      }
    });
    return Array.from(genres).slice(0, 10); // Mostrar máximo 10 filtros
  }, [books]);

  // **LIBROS FILTRADOS** 🔍
  const filteredBooks = useMemo(() => {
    let result = books;

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(book => 
        book.titulo?.toLowerCase().includes(query) ||
        book.autor?.toLowerCase().includes(query) ||
        book.sinopsis?.toLowerCase().includes(query)
      );
    }

    // Filtrar por categorías seleccionadas
    if (selectedFilters.length > 0) {
      result = result.filter(book => 
        book.generos?.some(genre => selectedFilters.includes(genre))
      );
    }

    return result;
  }, [books, searchQuery, selectedFilters]);

  // **VERIFICAR SI LIBRO ESTÁ EN LIBRERÍA** 📖
  const isBookInLibrary = useCallback((bookId) => {
    return userLibrary.some(book => book.bookId === bookId);
  }, [userLibrary]);

  // **MANEJADORES DE EVENTOS** 🎯
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (onSearch) {
      // Debounce search después de 300ms
      const timeoutId = setTimeout(() => {
        onSearch(query);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [onSearch]);

  const handleFilterToggle = useCallback((filter) => {
    setSelectedFilters(prev => {
      if (prev.includes(filter)) {
        return prev.filter(f => f !== filter);
      } else {
        return [...prev, filter];
      }
    });
  }, []);

  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
  }, [onRefresh]);

  const handleBookPress = useCallback((book) => {
    if (onBookPress) {
      onBookPress(book);
    }
  }, [onBookPress]);

  const handleAddToLibrary = useCallback((book) => {
    if (onAddToLibrary) {
      onAddToLibrary(book);
    }
  }, [onAddToLibrary]);

  // **ESTILOS DINÁMICOS** 🎨
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.customColors.background.primary,
    },
    searchContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    filtersContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
    },
    filtersScrollView: {
      paddingVertical: theme.spacing.xs,
    },
    filterChip: {
      marginRight: theme.spacing.xs,
    },
    listContainer: {
      paddingHorizontal: theme.spacing.md,
    },
    listContent: {
      paddingBottom: theme.spacing.xl,
    },
    loadingContainer: {
      paddingVertical: theme.spacing.xl,
    },
    loadMoreContainer: {
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      minHeight: 400,
    },
    resultCount: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: 14,
      color: theme.customColors.text.secondary,
    }
  });

  // **RENDERIZAR ITEM DE LIBRO** 📖
  const renderBookItem = useCallback(({ item: book, index }) => (
    <BookCard
      key={book.bookId}
      book={book}
      onPress={() => handleBookPress(book)}
      onAddToLibrary={() => handleAddToLibrary(book)}
      isInLibrary={isBookInLibrary(book.bookId)}
      testID={`book-item-${book.bookId}`}
    />
  ), [handleBookPress, handleAddToLibrary, isBookInLibrary]);

  // **RENDERIZAR HEADER DE BÚSQUEDA** 🔍
  const renderSearchHeader = () => {
    if (!showSearch) return null;

    return (
      <View style={dynamicStyles.searchContainer}>
        <Searchbar
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChangeText={handleSearch}
          style={{ backgroundColor: theme.customColors.background.secondary }}
          inputStyle={{ fontSize: 16 }}
          iconColor={theme.customColors.text.secondary}
        />
      </View>
    );
  };

  // **RENDERIZAR FILTROS** 🏷️
  const renderFilters = () => {
    if (!showFilters || availableFilters.length === 0) return null;

    return (
      <View style={dynamicStyles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={availableFilters}
          keyExtractor={(item) => item}
          contentContainerStyle={dynamicStyles.filtersScrollView}
          renderItem={({ item: filter }) => (
            <Chip
              mode={selectedFilters.includes(filter) ? 'flat' : 'outlined'}
              selected={selectedFilters.includes(filter)}
              onPress={() => handleFilterToggle(filter)}
              style={dynamicStyles.filterChip}
              textStyle={{ fontSize: 12 }}
            >
              {filter}
            </Chip>
          )}
        />
      </View>
    );
  };

  // **RENDERIZAR CONTADOR DE RESULTADOS** 📊
  const renderResultCount = () => {
    if (!searchQuery && selectedFilters.length === 0) return null;

    const count = filteredBooks.length;
    const totalCount = books.length;
    
    return (
      <Text style={dynamicStyles.resultCount}>
        {count === totalCount 
          ? `${count} ${count === 1 ? 'libro' : 'libros'}`
          : `${count} de ${totalCount} ${totalCount === 1 ? 'libro' : 'libros'}`
        }
      </Text>
    );
  };

  // **RENDERIZAR FOOTER DE CARGA** ⏳
  const renderLoadMoreFooter = () => {
    if (!loading || books.length === 0) return null;

    return (
      <View style={dynamicStyles.loadMoreContainer}>
        <LoadingSpinner size="small" message="Cargando más libros..." />
      </View>
    );
  };

  // **RENDERIZAR ESTADO VACÍO** 📭
  const renderEmptyState = () => {
    if (loading && books.length === 0) {
      return (
        <View style={dynamicStyles.loadingContainer}>
          <LoadingSpinner message="Cargando libros..." />
        </View>
      );
    }

    if (error) {
      return (
        <ErrorState
          onRetry={onRefresh}
          error={error}
        />
      );
    }

    if (searchQuery || selectedFilters.length > 0) {
      return (
        <EmptySearchState
          searchTerm={searchQuery}
          onClearSearch={() => {
            setSearchQuery('');
            setSelectedFilters([]);
          }}
        />
      );
    }

    // Estado vacío personalizado
    const EmptyComponent = emptyStateConfig.component || EmptySearchState;
    return (
      <EmptyComponent
        {...emptyStateConfig.props}
      />
    );
  };

  // **RENDERIZAR CONTENIDO PRINCIPAL** 🏗️
  if (filteredBooks.length === 0) {
    return (
      <View style={[dynamicStyles.container, props.style]} testID={testID}>
        {renderSearchHeader()}
        {renderFilters()}
        <View style={dynamicStyles.emptyContainer}>
          {renderEmptyState()}
        </View>
      </View>
    );
  }

  return (
    <View style={[dynamicStyles.container, props.style]} testID={testID}>
      <FlatList
        data={filteredBooks}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.bookId}
        ListHeaderComponent={() => (
          <>
            {renderSearchHeader()}
            {renderFilters()}
            {renderResultCount()}
          </>
        )}
        ListFooterComponent={renderLoadMoreFooter}
        contentContainerStyle={[
          dynamicStyles.listContent,
          filteredBooks.length === 0 && { flex: 1 }
        ]}
        style={dynamicStyles.listContainer}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.customColors.primary]}
              tintColor={theme.customColors.primary}
            />
          ) : undefined
        }
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.1}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={8}
        getItemLayout={(data, index) => ({
          length: 150, // Altura estimada del item
          offset: 150 * index,
          index,
        })}
        {...props}
      />
    </View>
  );
};

export default BookList;