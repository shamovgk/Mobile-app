/**
 * Система дизайна Word Rush
 */

import { Platform } from 'react-native';

// ===== ЦВЕТА =====
export const COLORS = {
  // Основная палитра
  primary: '#2196F3',      // Синий
  primaryDark: '#1976D2',  // Тёмно-синий
  primaryLight: '#BBDEFB', // Светло-синий
  
  secondary: '#FF9800',    // Оранжевый
  accent: '#E91E63',       // Розовый
  
  // Нейтральные цвета
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  
  // Семантические цвета
  success: '#4CAF50',
  successLight: '#C8E6C9',
  error: '#F44336',
  errorLight: '#FFCDD2',
  warning: '#FF9800',
  warningLight: '#FFE0B2',
  info: '#2196F3',
  infoLight: '#E3F2FD',
  
  // Игровые цвета
  game: {
    correct: '#27AE60',     // Зелёный для правильных ответов
    incorrect: '#E74C3C',   // Красный для неправильных
    neutral: '#95A5A6',     // Серый для нейтральных элементов
    bonus: '#F39C12',       // Жёлтый для бонусов
    background: '#000000',  // Чёрный фон игры
    card: '#FFFFFF',        // Белые карточки
  },
  
  // Мастерство слов
  mastery: {
    none: '#F44336',        // Красный - не изучено
    beginner: '#FF9800',    // Оранжевый - новичок
    learning: '#FFC107',    // Жёлтый - изучаю
    knows: '#8BC34A',       // Светло-зелёный - знаю
    confident: '#4CAF50',   // Зелёный - уверенно
    master: '#2196F3',      // Синий - мастер
  },
  
  // Звёзды и достижения
  stars: {
    gold: '#FFD700',        // Золотые звёзды
    silver: '#C0C0C0',      // Серебряные звёзды
    bronze: '#CD7F32',      // Бронзовые звёзды
    empty: '#E0E0E0',       // Пустые звёзды
  },
} as const;

// ===== РАЗМЕРЫ ТЕКСТА =====
export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  title: 28,
  hero: 32,
  massive: 48,
} as const;

// ===== ВЕСА ШРИФТОВ =====
export const FONT_WEIGHTS = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  black: '900' as const,
};

// ===== ОТСТУПЫ =====
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

// ===== РАДИУСЫ СКРУГЛЕНИЯ =====
export const BORDER_RADIUS = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
} as const;

// ===== ТЕНИ =====
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

// ===== ШРИФТЫ =====
export const FONTS = Platform.select({
  ios: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  android: {
    regular: 'Roboto',
    medium: 'Roboto-Medium',
    bold: 'Roboto-Bold',
  },
  default: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
});

// ===== АНИМАЦИИ =====
export const ANIMATIONS = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    linear: 'linear' as const,
    ease: 'ease' as const,
    easeIn: 'ease-in' as const,
    easeOut: 'ease-out' as const,
  },
} as const;

// ===== РАЗМЕРЫ ЭКРАНА =====
export const LAYOUT = {
  // Размеры контейнеров
  container: {
    maxWidth: 480,
    padding: SPACING.lg,
  },
  
  // Размеры элементов UI
  button: {
    height: 48,
    minHeight: 44,
  },
  
  input: {
    height: 48,
    minHeight: 44,
  },
  
  header: {
    height: 56,
  },
  
  // Игровые элементы
  game: {
    cardMinHeight: 120,
    hudHeight: 60,
    buttonSize: 50,
  },
} as const;

// ===== ГОТОВЫЕ СТИЛИ =====
export const COMMON_STYLES = {
  // Контейнеры
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
  },
  
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  
  gameCard: {
    backgroundColor: COLORS.game.card,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    minHeight: LAYOUT.game.cardMinHeight,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    ...SHADOWS.lg,
  },
  
  // Кнопки
  buttonPrimary: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    height: LAYOUT.button.height,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    ...SHADOWS.md,
  },
  
  buttonSecondary: {
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.lg,
    height: LAYOUT.button.height,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  
  // Текст
  textPrimary: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.normal,
    color: COLORS.gray900,
    fontFamily: FONTS?.regular,
  },
  
  textSecondary: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.normal,
    color: COLORS.gray600,
    fontFamily: FONTS?.regular,
  },
  
  textTitle: {
    fontSize: FONT_SIZES.title,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.gray900,
    fontFamily: FONTS?.bold,
  },
  
  // Состояния
  disabled: {
    opacity: 0.6,
  },
  
  hidden: {
    opacity: 0,
  },
} as const;

// ===== ТИПЫ =====
export type ColorKeys = keyof typeof COLORS;
export type SpacingKeys = keyof typeof SPACING;
export type FontSizeKeys = keyof typeof FONT_SIZES;
export type BorderRadiusKeys = keyof typeof BORDER_RADIUS;