/**
 * Утилиты форматирования
 */

/**
 * Форматирует время в читаемый вид
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  
  if (mins === 0) {
    return `${secs}с`;
  }
  
  return `${mins}м ${secs}с`;
}

/**
 * Форматирует дату
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return 'Вчера';
  if (diffDays < 7) return `${diffDays} дней назад`;
  
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Форматирует процент
 */
export function formatPercent(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Форматирует число с разделителями
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('ru-RU');
}

/**
 * Получает эмодзи сложности
 */
export function getDifficultyEmoji(mode: 'easy' | 'normal' | 'hard'): string {
  switch (mode) {
    case 'easy': return '🌱';
    case 'hard': return '🔥';
    default: return '⚡';
  }
}

/**
 * Получает эмодзи типа вопроса
 */
export function getQuestionTypeEmoji(types: string[]): string {
  if (types.includes('anagram')) return '🔀';
  if (types.includes('context')) return '💡';
  if (types.includes('form')) return '📝';
  return '🔤';
}
