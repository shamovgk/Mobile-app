import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import * as Haptics from 'expo-haptics';

let ok: Audio.Sound | null = null;
let fail: Audio.Sound | null = null;
let loaded = false;

// Опционально добавь файлы в assets/sounds: correct.mp3 и wrong.mp3.
// Если файлов нет — модуль тихо проигнорирует звук и оставит только вибро.
export async function sfxInit() {
  if (loaded) return;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
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
    // нет файлов — просто работаем без звука
    loaded = true;
  }
}

export async function sfxOk(haptic = true) {
  if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  try { await ok?.replayAsync(); } catch {}
}

export async function sfxFail(haptic = true) {
  if (haptic) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  try { await fail?.replayAsync(); } catch {}
}

export async function sfxDispose() {
  try { await ok?.unloadAsync(); } catch {}
  try { await fail?.unloadAsync(); } catch {}
  ok = null; fail = null; loaded = false;
}
