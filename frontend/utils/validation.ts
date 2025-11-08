/**
 * Утилиты валидации данных
 */

import type { Lexeme, Pack, PackLevel } from '@/lib/types';

/**
 * Проверяет валидность пака
 */
export function validatePack(pack: any): pack is Pack {
  if (!pack || typeof pack !== 'object') return false;
  
  if (!pack.id || !pack.title || !pack.lang || !pack.cefr) return false;
  
  if (!Array.isArray(pack.levels) || !Array.isArray(pack.lexemes)) return false;
  
  return pack.levels.every(validateLevel) && pack.lexemes.every(validateLexeme);
}

/**
 * Проверяет валидность уровня
 */
export function validateLevel(level: any): level is PackLevel {
  if (!level || typeof level !== 'object') return false;
  
  if (!level.id || !level.title || typeof level.order !== 'number') return false;
  
  if (!level.config || !validateLevelConfig(level.config)) return false;
  
  return true;
}

/**
 * Проверяет валидность конфигурации уровня
 */
export function validateLevelConfig(config: any): boolean {
  if (!config || typeof config !== 'object') return false;
  
  if (typeof config.durationSec !== 'number' || config.durationSec <= 0) return false;
  if (typeof config.forkEverySec !== 'number' || config.forkEverySec <= 0) return false;
  if (![2, 3].includes(config.lanes)) return false;
  if (!Array.isArray(config.allowedTypes) || config.allowedTypes.length === 0) return false;
  if (typeof config.lives !== 'number' || config.lives <= 0) return false;
  
  return true;
}

/**
 * Проверяет валидность лексемы
 */
export function validateLexeme(lexeme: any): lexeme is Lexeme {
  if (!lexeme || typeof lexeme !== 'object') return false;
  
  if (!lexeme.id || !lexeme.base) return false;
  
  if (!Array.isArray(lexeme.translations) || lexeme.translations.length === 0) return false;
  
  if (!Array.isArray(lexeme.examples)) return false;
  
  return true;
}

/**
 * Проверяет что значение между min и max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Проверяет что строка не пустая
 */
export function isNonEmpty(str: string): boolean {
  return str.trim().length > 0;
}
