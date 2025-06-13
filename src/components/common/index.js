/**
 * **ÍNDICE DE COMPONENTES COMUNES** 🧩
 * 
 * Exportaciones centralizadas de todos los componentes comunes
 * para facilitar las importaciones en otros módulos.
 * 
 * Patrón educativo: Barrel exports para componentes
 */

// **COMPONENTES BÁSICOS** ⚡
export { default as LoadingSpinner } from './LoadingSpinner';
export { default as Button, PrimaryButton, SecondaryButton, OutlineButton, TextButton, DangerButton, SmallButton, LargeButton, FullWidthButton, LoadingButton, IconButton, FloatingActionButton, ButtonSpinner } from './Button';
export { default as Card, DefaultCard, OutlinedCard, ElevatedCard } from './Card';
export { default as BookCard, CompactBookCard, DetailedBookCard, SimpleBookCard } from './BookCard';
export { default as StatsCard, NumberStatsCard, PercentageStatsCard, CurrencyStatsCard } from './StatsCard';

// **FEEDBACK Y NOTIFICACIONES** 📢
export { default as Toast, SuccessToast, ErrorToast, WarningToast, InfoToast, useToast } from './Toast';
export { default as Modal, ConfirmationModal, AlertModal, BottomSheetModal, FullscreenModal, useModal } from './Modal';

// **ESTADOS Y MENSAJES** 📭
export { 
  default as EmptyState, 
  EmptySearchState, 
  EmptyLibraryState, 
  EmptyReviewsState, 
  ErrorState, 
  NoInternetState, 
  LoadingFailedState, 
  SuccessState,
  WelcomeState,
  FirstBookState,
  BookDetailEmptyState,
  ReviewsEmptyState,
  useEmptyState 
} from './EmptyState';

// **COMPONENTES DE IMÁGENES** 🖼️
export { 
  default as BookImage, 
  SmallBookImage, 
  MediumBookImage, 
  LargeBookImage, 
  SquareBookImage, 
  HeroBookImage, 
  useBookImage 
} from './BookImage';
