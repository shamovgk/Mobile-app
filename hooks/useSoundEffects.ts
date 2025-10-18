/**
 * Хук для управления звуками и вибрацией (с константами)
 */

import { sfxDispose, sfxFail, sfxInit, sfxOk } from '@/lib/sfx';
import { STORAGE_KEYS } from '@/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export function useSoundEffects() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  useEffect(() => {
    (async () => {
      const sound = await AsyncStorage.getItem(STORAGE_KEYS.SOUND);
      const haptics = await AsyncStorage.getItem(STORAGE_KEYS.HAPTICS);
      if (sound !== null) setSoundEnabled(sound === 'true');
      if (haptics !== null) setHapticsEnabled(haptics === 'true');
    })();
  }, []);

  useEffect(() => {
    (async () => {
      await sfxInit();
    })();
    return () => {
      sfxDispose();
    };
  }, []);

  const playCorrectSound = async () => {
    if (soundEnabled || hapticsEnabled) {
      await sfxOk(hapticsEnabled);
    }
  };

  const playIncorrectSound = async () => {
    if (soundEnabled || hapticsEnabled) {
      await sfxFail(hapticsEnabled);
    }
  };

  return { playCorrectSound, playIncorrectSound };
}
