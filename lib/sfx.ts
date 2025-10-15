/**
 * Модуль для работы со звуковыми эффектами и тактильной обратной связью
 * 
 * Функциональность:
 * - Загрузка и воспроизведение звуков успеха/ошибки
 * - Тактильная обратная связь (вибрация) для правильных/неправильных ответов
 * - Инициализация и очистка ресурсов
 * 
 * Требования:
 * - Звуковые файлы должны находиться в assets/sounds/
 * - correct.mp3 - звук правильного ответа
 * - wrong.mp3 - звук неправильного ответа
 * 
 * Если файлы отсутствуют, модуль работает только с вибрацией
 */

import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import * as Haptics from 'expo-haptics';

// Глобальные переменные для хранения звуковых объектов
let ok: Audio.Sound | null = null;
let fail: Audio.Sound | null = null;
let loaded = false;

/**
 * Инициализирует аудиосистему и загружает звуковые файлы
 * 
 * Настройки аудио:
 * - playsInSilentModeIOS: true - воспроизведение даже в беззвучном режиме
 * - staysActiveInBackground: false - остановка при сворачивании
 * - interruptionMode: DoNotMix - не смешивать с другими аудио
 * - shouldDuckAndroid: true - приглушать другие звуки на Android
 * 
 * Загружает два звуковых файла:
 * - correct.mp3 для правильных ответов
 * - wrong.mp3 для неправильных ответов
 * 
 * При отсутствии файлов функция не выбрасывает ошибку,
 * позволяя приложению работать только с вибрацией
 */
export async function sfxInit() {
  if (loaded) return;

  try {
    // Настройка режима аудио
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    // Загрузка звуковых файлов
    const okAsset = require('@/assets/sounds/correct.mp3');
    const failAsset = require('@/assets/sounds/wrong.mp3');

    const [s1, s2] = await Promise.all([
      Audio.Sound.createAsync(okAsset, { volume: 0.5, shouldPlay: false }),
      Audio.Sound.createAsync(failAsset, { volume: 0.5, shouldPlay: false }),
    ]);

    ok = s1.sound;
    fail = s2.sound;
    loaded = true;
  } catch {
    // Если файлы не найдены или произошла ошибка,
    // модуль продолжает работать без звука
    loaded = true;
  }
}

/**
 * Воспроизводит звук и вибрацию для правильного ответа
 * 
 * Эффекты:
 * - Звук: короткий приятный звук (если загружен correct.mp3)
 * - Вибрация: лёгкая тактильная обратная связь (Light)
 * 
 * @param haptic - Включить/выключить вибрацию (по умолчанию true)
 */
export async function sfxOk(haptic = true) {
  // Лёгкая вибрация для положительной обратной связи
  if (haptic) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  // Воспроизведение звука (если загружен)
  try {
    await ok?.replayAsync();
  } catch {
    // Игнорируем ошибки воспроизведения
  }
}

/**
 * Воспроизводит звук и вибрацию для неправильного ответа
 * 
 * Эффекты:
 * - Звук: короткий звук ошибки (если загружен wrong.mp3)
 * - Вибрация: уведомление об ошибке (Error notification)
 * 
 * @param haptic - Включить/выключить вибрацию (по умолчанию true)
 */
export async function sfxFail(haptic = true) {
  // Вибрация для негативной обратной связи
  if (haptic) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }

  // Воспроизведение звука (если загружен)
  try {
    await fail?.replayAsync();
  } catch {
    // Игнорируем ошибки воспроизведения
  }
}

/**
 * Освобождает ресурсы и выгружает звуковые файлы из памяти
 * 
 * Должна вызываться при размонтировании игрового экрана
 * или завершении сессии для освобождения памяти
 * 
 * Сбрасывает флаг loaded, позволяя повторную инициализацию
 */
export async function sfxDispose() {
  try {
    await ok?.unloadAsync();
  } catch {
    // Игнорируем ошибки при выгрузке
  }

  try {
    await fail?.unloadAsync();
  } catch {
    // Игнорируем ошибки при выгрузке
  }

  // Сброс состояния
  ok = null;
  fail = null;
  loaded = false;
}
