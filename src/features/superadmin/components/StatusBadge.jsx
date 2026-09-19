import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import adminColors from '../theme/adminColors';

/**
 * StatusBadge — color-coded pill badge for statuses, risk levels, KYC tiers, etc.
 *
 * Props:
 *   label    — text to display
 *   variant  — 'success' | 'warning' | 'danger' | 'info' | 'orange' | 'muted' | 'critical'
 *   size     — 'sm' | 'md' (default 'md')
 *   dot      — show a leading dot indicator (bool)
 */
const variants = {
  success:  { bg: adminColors.successDim,  text: adminColors.successFg,  border: 'rgba(16, 185, 129, 0.25)' },
  warning:  { bg: adminColors.warningDim,  text: adminColors.warningFg,  border: 'rgba(245, 158, 11, 0.25)' },
  danger:   { bg: adminColors.dangerDim,   text: adminColors.dangerFg,   border: 'rgba(239, 68, 68, 0.25)' },
  orange:   { bg: adminColors.orangeDim,   text: adminColors.orangeFg,   border: 'rgba(249, 115, 22, 0.25)' },
  info:     { bg: 'rgba(59, 130, 246, 0.08)', text: '#1e40af',           border: 'rgba(59, 130, 246, 0.20)' },
  muted:    { bg: adminColors.muted,       text: adminColors.fgSub,      border: adminColors.border },
  critical: { bg: 'rgba(239, 68, 68, 0.12)',  text: '#991b1b',           border: 'rgba(239, 68, 68, 0.30)' },
  purple:   { bg: 'rgba(139, 92, 246, 0.08)', text: '#5b21b6',           border: 'rgba(139, 92, 246, 0.20)' },
  teal:     { bg: 'rgba(20, 184, 166, 0.08)',  text: '#0f766e',          border: 'rgba(20, 184, 166, 0.20)' },
};

const StatusBadge = ({ label, variant = 'muted', size = 'md', dot = false }) => {
  const { bg, text, border } = variants[variant] || variants.muted;
  const isSmall = size === 'sm';

  return (
    <View style={[
      styles.badge,
      {
        backgroundColor: bg,
        borderColor: border,
        paddingHorizontal: isSmall ? 7 : 10,
        paddingVertical: isSmall ? 2 : 4,
        borderRadius: adminColors.rFull,
      }
    ]}>
      {dot && (
        <View style={[styles.dot, { backgroundColor: text }]} />
      )}
      <Text style={[styles.text, { color: text, fontSize: isSmall ? 9 : 11 }]}>
        {label}
      </Text>
    </View>
  );
};

// Helper: derive variant from common status/risk strings
export const getStatusVariant = (status) => {
  const s = (status || '').toLowerCase();
  if (['approved', 'active', 'paid', 'tier-2', 'low'].includes(s)) return 'success';
  if (['pending review', 'under review', 'kyc pending', 'contacted', 'reminder sent', 'medium', 'tier-1'].includes(s)) return 'warning';
  if (['rejected', 'suspended', 'default', 'overdue', 'high', 'legal notice', 'escalated'].includes(s)) return 'danger';
  if (['flagged', 'critical', 'npa'].includes(s)) return 'critical';
  if (['promise to pay', 'in progress'].includes(s)) return 'orange';
  if (['restricted'].includes(s)) return 'purple';
  if (['business loan', 'teal'].includes(s)) return 'teal';
  return 'muted';
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    gap: 5,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 99,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default StatusBadge;
