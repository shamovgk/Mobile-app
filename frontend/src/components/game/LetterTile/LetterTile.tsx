// frontend/src/components/game/LetterTile/LetterTile.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/theme';

interface LetterTileProps {
  letter: string;
  onPress?: () => void;
  variant?: 'available' | 'selected' | 'correct' | 'wrong';
  isEmpty?: boolean;
}

export const LetterTile: React.FC<LetterTileProps> = ({
  letter,
  onPress,
  variant = 'available',
  isEmpty = false,
}) => {
  const getTileStyle = (): ViewStyle[] => {
    const styles: ViewStyle[] = [stylesSheet.tile];
    
    if (variant === 'selected') styles.push(stylesSheet.tileSelected);
    if (variant === 'correct') styles.push(stylesSheet.tileCorrect);
    if (variant === 'wrong') styles.push(stylesSheet.tileWrong);
    if (isEmpty) styles.push(stylesSheet.tileEmpty);
    
    return styles;
  };

  return (
    <TouchableOpacity
      style={getTileStyle()}
      onPress={onPress}
      disabled={isEmpty}
      activeOpacity={0.8}
    >
      <Text style={stylesSheet.letter}>{letter.toUpperCase()}</Text>
    </TouchableOpacity>
  );
};

const stylesSheet = StyleSheet.create({
  tile: {
    width: 50,
    height: 60,
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.md,
    borderWidth: 3,
    borderColor: colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  tileSelected: {
    backgroundColor: colors.accent.light,
    borderColor: colors.accent.main,
  },
  tileCorrect: {
    backgroundColor: colors.success.light,
    borderColor: colors.success.main,
  },
  tileWrong: {
    backgroundColor: colors.error.light,
    borderColor: colors.error.main,
  },
  tileEmpty: {
    backgroundColor: colors.background.default,
    borderColor: colors.text.disabled,
    borderStyle: 'dashed',
  },
  letter: {
    fontFamily: typography.fontFamily.black,
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
  },
});
