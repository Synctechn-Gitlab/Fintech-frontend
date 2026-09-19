import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import colors from '../theme/colors';

export const NovaLogoIcon = ({ size = 64 }) => {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Image 
        source={{ uri: 'https://res.cloudinary.com/wowukaao/image/upload/v1785171832/Screenshot_2026-07-27_223203-removebg-preview_kikjdd.png' }}
        style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
      />
    </View>
  );
};

export const NovaLogo = ({ size = 64, showText = true, layout = 'column', subtitle = 'Secure Banking', titleColor, subtitleColor }) => {
  const isRow = layout === 'row';
  return (
    <View style={[styles.container, isRow ? styles.row : styles.column]}>
      <View style={styles.iconWrapper}>
        <NovaLogoIcon size={size} />
        <View style={[styles.glowEffect, { width: size * 1.2, height: size * 1.2, borderRadius: size }]} />
      </View>
      {showText && (
        <View style={[styles.textWrapper, isRow ? styles.textRow : styles.textColumn]}>
          <Text style={[styles.logoText, { fontSize: size * 0.35 }, titleColor ? { color: titleColor } : null]}>Hidel Finance</Text>
          {subtitle && (
            <View style={styles.badge}>
              <View style={styles.badgeDot} />
              <Text style={[styles.badgeText, subtitleColor ? { color: subtitleColor } : null]}>{subtitle}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
    gap: 12,
  },
  iconWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowEffect: {
    position: 'absolute',
    backgroundColor: 'rgba(52, 216, 124, 0.08)',
    zIndex: -1,
  },
  textWrapper: {
    justifyContent: 'center',
  },
  textRow: {
    alignItems: 'flex-start',
  },
  textColumn: {
    alignItems: 'center',
  },
  logoText: {
    fontWeight: '600',
    color: colors.foreground,
    letterSpacing: -0.5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.successDim,
    borderWidth: 1,
    borderColor: colors.successBorder,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: colors.radiusFull,
    marginTop: 4,
  },
  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.success,
  },
  badgeText: {
    fontSize: 10,
    color: colors.success,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default NovaLogo;
