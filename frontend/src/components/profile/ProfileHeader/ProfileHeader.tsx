// frontend/src/components/profile/ProfileHeader/ProfileHeader.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors, typography, spacing, borderRadius } from '@/theme';
import type { MainTabParamList } from '@/navigation/types';

interface ProfileHeaderProps {
  displayName: string;
  avatar: string | null;
  level: number;
  xp: number;
}

type NavigationProp = BottomTabNavigationProp<MainTabParamList>;

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  displayName,
  avatar,
  level,
  xp,
}) => {
  const navigation = useNavigation<NavigationProp>();

  const xpToNextLevel = level * 100;
  const xpProgress = (xp % 100) / 100;

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.avatarContainer} onPress={handleProfilePress}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.info}>
        <TouchableOpacity onPress={handleProfilePress}>
          <Text style={styles.name}>{displayName}</Text>
        </TouchableOpacity>
        
        <View style={styles.levelContainer}>
          <Text style={styles.levelBadge}>Уровень {level}</Text>
        </View>

        <View style={styles.xpContainer}>
          <View style={styles.xpBar}>
            <View style={[styles.xpFill, { width: `${xpProgress * 100}%` }]} />
          </View>
          <Text style={styles.xpText}>
            {xp % 100} / {xpToNextLevel} XP
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: spacing.lg,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: colors.accent.main,
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.accent.main,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.accent.dark,
  },
  avatarText: {
    fontFamily: typography.fontFamily.black,
    fontSize: typography.fontSize.xxxl,
    color: colors.primary.main,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.text.inverse,
    marginBottom: spacing.xs,
  },
  levelContainer: {
    marginBottom: spacing.sm,
  },
  levelBadge: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.sm,
    color: colors.accent.main,
  },
  xpContainer: {
    gap: spacing.xs,
  },
  xpBar: {
    height: 8,
    backgroundColor: colors.primary.light,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: colors.accent.main,
  },
  xpText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.xs,
    color: colors.text.inverse,
    opacity: 0.8,
  },
});
