import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/theme';
interface ComboDisplayProps {
  combo: number;
}

export const ComboDisplay: React.FC<ComboDisplayProps> = ({ combo }) => {
  const scale = React.useRef(1);

  React.useEffect(() => {
    scale.current = 1.5;
  }, [combo]);

  return (
    <View style={styles.container}>
      <Text style={styles.comboText}>
        ⚡ {combo}x КОМБО!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.accent.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    shadowColor: colors.accent.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  comboText: {
    fontFamily: typography.fontFamily.black,
    fontSize: typography.fontSize.lg,
    color: colors.primary.main,
    letterSpacing: 1,
  },
});
