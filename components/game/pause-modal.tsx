/**
 * Модальное окно паузы
 */

import { Modal, Pressable, Text, View } from 'react-native';

interface PauseModalProps {
  visible: boolean;
  onResume: () => void;
  onExit: () => void;
}

export function PauseModal({ visible, onResume, onExit }: PauseModalProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onResume}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: 420,
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 20,
            gap: 12,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: '600',
              textAlign: 'center',
              color: '#000',
            }}
          >
            Пауза
          </Text>
          
          <Text style={{ textAlign: 'center', color: '#666' }}>
            Игра приостановлена. Продолжить или выйти?
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={onResume}
            style={{
              padding: 14,
              borderRadius: 12,
              backgroundColor: '#2f80ed',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>
              Продолжить
            </Text>
          </Pressable>

          <View
            style={{
              padding: 12,
              borderRadius: 12,
              backgroundColor: '#fffbf0',
              borderWidth: 1,
              borderColor: '#f2c94c',
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                fontSize: 14,
                color: '#856404',
              }}
            >
              ⚠️ Прогресс не будет сохранён при выходе.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onExit}
            style={{
              padding: 14,
              borderRadius: 12,
              backgroundColor: '#eb5757',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontWeight: '700' }}>Выйти</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
