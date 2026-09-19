import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import adminColors from '../theme/adminColors';

/**
 * AdminMetricCard — compact KPI card for the super admin dashboard.
 *
 * Props:
 *   icon       — Ionicons name
 *   iconColor  — icon + accent color (defaults to accent green)
 *   label      — metric title
 *   value      — primary value string
 *   change     — change string e.g. "+12.4%"
 *   positive   — bool, whether change is positive (green vs red)
 *   sub        — optional sub-text below value
 *   onPress    — optional tap handler
 */
const AdminMetricCard = ({
  icon,
  iconColor = adminColors.accent,
  label,
  value,
  change,
  positive = true,
  sub,
  onPress,
}) => {
  const changeColor = positive ? adminColors.success : adminColors.danger;
  const changeBg = positive ? adminColors.successDim : adminColors.dangerDim;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
    >
      {/* Icon */}
      <View style={[styles.iconBox, { backgroundColor: `${iconColor}18` }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>

      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Value */}
      <Text style={styles.value}>{value}</Text>

      {/* Footer row */}
      <View style={styles.footer}>
        {change ? (
          <View style={[styles.changePill, { backgroundColor: changeBg }]}>
            <Ionicons
              name={positive ? 'trending-up' : 'trending-down'}
              size={10}
              color={changeColor}
            />
            <Text style={[styles.changeText, { color: changeColor }]}>{change}</Text>
          </View>
        ) : null}
        {sub ? <Text style={styles.sub}>{sub}</Text> : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 180,
    backgroundColor: adminColors.card,
    borderWidth: 1,
    borderColor: adminColors.border,
    borderRadius: adminColors.r16,
    padding: 18,
    gap: 6,
    ...adminColors.shadowSm,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: adminColors.r8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    color: adminColors.fgMuted,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 22,
    fontWeight: '600',
    color: adminColors.fg,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  changePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: adminColors.rFull,
  },
  changeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  sub: {
    fontSize: 11,
    color: adminColors.fgMuted,
    fontWeight: '500',
  },
});

export default AdminMetricCard;
