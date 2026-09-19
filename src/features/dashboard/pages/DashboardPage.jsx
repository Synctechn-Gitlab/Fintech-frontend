import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line } from 'react-native-svg';
import { loanStore } from '../../../store/loanStore';
import { paymentStore } from '../../../store/paymentStore';
import { authStore } from '../../../store/authStore';
import { useTheme } from '../../../theme/useTheme';
import { loanService } from '../../../services/loanService';
import { paymentService } from '../../../services/paymentService';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);
const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const daysUntil = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);

/* ── Smooth Repayment Trend Area Chart Component ───────────────────────────── */
const RepaymentTrendChart = () => (
  <View style={chartStyles.chartContainer}>
    <Svg width="100%" height="160" viewBox="0 0 320 140">
      <Defs>
        <LinearGradient id="trendGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#36e436ff" stopOpacity="0.45" />
          <Stop offset="100%" stopColor="#36e436ff" stopOpacity="0.0" />
        </LinearGradient>
      </Defs>

      {/* Grid lines */}
      {[20, 55, 90, 125].map((y) => (
        <Line key={y} x1="10" y1={y} x2="310" y2={y} stroke="#F3F4F6" strokeWidth="1" />
      ))}
      {[60, 110, 160, 210, 260].map((x) => (
        <Line key={x} x1={x} y1="10" x2={x} y2="125" stroke="#F3F4F6" strokeWidth="1" />
      ))}

      {/* Filled Area */}
      <Path
        d="M 10 115 Q 60 95 110 90 T 210 60 T 310 30 L 310 125 L 10 125 Z"
        fill="url(#trendGrad)"
      />

      {/* Smooth Trend Line */}
      <Path
        d="M 10 115 Q 60 95 110 90 T 210 60 T 310 30"
        fill="none"
        stroke="#36e436ff"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </Svg>

    {/* X Axis Labels */}
    <View style={chartStyles.xAxisRow}>
      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month) => (
        <Text key={month} style={chartStyles.xLabel}>{month}</Text>
      ))}
    </View>
  </View>
);

const chartStyles = StyleSheet.create({
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  xAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 6,
  },
  xLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});

/* ── Main Dashboard Page ────────────────────────────────────────────────────── */
const DashboardPage = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const [loan, setLoan] = useState(loanStore.getState());
  const [payments, setPayments] = useState(paymentStore.getState());
  const [user] = useState(authStore.getState().user);
  const [periodFilter, setPeriodFilter] = useState('Monthly');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const u1 = loanStore.subscribe(setLoan);
      const u2 = paymentStore.subscribe(setPayments);
      loanService.getActiveLoan().catch(e => console.log('Loan API unavailable:', e.message));
      paymentService.getPayments().catch(e => console.log('Payments API unavailable:', e.message));
      return () => { u1(); u2(); };
    }, [])
  );

  const daysLeft = loan ? daysUntil(loan.nextDueDate) : 5;
  const progress = loan ? Math.round((loan.paid / loan.principal) * 100) : 32;
  const recentPayments = payments.payments.slice(0, 3);
  const userName = user?.name ? user.name : 'Jane Cooper';
  const userFirstName = user?.name ? user.name.split(' ')[0] : 'Jane';
  const hasActiveLoan = loan && loan.outstanding > 0;

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header Row (Avatar + Good Morning + Green Bell) ───────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeftRow}>
          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={24} color="#374151" />
            </View>
          </TouchableOpacity>

          <View>
            <Text style={styles.greetingSub}>Good Morning</Text>
            <Text style={styles.userNameText}>{userName}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.notifBtnLime} activeOpacity={0.8}>
          <Ionicons name="notifications-outline" size={20} color="#000000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!hasActiveLoan ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 20, marginTop: 40 }}>
            <Ionicons name="folder-open-outline" size={64} color="#9CA3AF" style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 }}>There is no data</Text>
            <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
              Dashboard data will appear here once your loan is approved and active.
            </Text>
            <TouchableOpacity
              style={{ backgroundColor: '#36e436ff', borderRadius: 16, paddingHorizontal: 24, paddingVertical: 14, alignItems: 'center' }}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#000000' }}>Explore Loans</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* ── This Month Debts Hero ──────────────────────────────────────── */}
            <View style={styles.debtsHero}>
              <View style={styles.debtsHeaderRow}>
                <Text style={styles.debtsTitle}>This Month Debts</Text>
                <TouchableOpacity
                  style={styles.periodPill}
                  onPress={() => setShowFilterDropdown(!showFilterDropdown)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.periodPillText}>{periodFilter}</Text>
                  <Ionicons name="chevron-down" size={14} color="#374151" />
                </TouchableOpacity>

                {showFilterDropdown && (
                  <View style={styles.dropdownMenu}>
                    {['Monthly', '3-Month', 'Yearly'].map((item) => (
                      <TouchableOpacity
                        key={item}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setPeriodFilter(item);
                          setShowFilterDropdown(false);
                        }}
                      >
                        <Text style={[styles.dropdownItemText, periodFilter === item && styles.dropdownItemTextActive]}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <Text style={styles.debtsAmountVal}>
                {fmt(loan?.outstanding || 12505.58)}
              </Text>
            </View>

            {/* ── Arc Gauge EMI Card (Matching Reference Screenshot) ──────────── */}
            <View style={styles.arcCard}>
              {/* Card Top Row */}
              <View style={styles.cardTopRow}>
                <View>
                  <Text style={styles.cardEmiAmount}>{fmt(loan?.nextDueAmount || 450.00)}</Text>
                  <Text style={styles.cardEmiLabel}>Next EMI Due</Text>
                  <Text style={styles.cardEmiDate}>{fmtDate(loan?.nextDueDate || '2024-05-15')}</Text>
                </View>

                <View style={styles.dueBadgeWrap}>
                  <Ionicons name="time-outline" size={14} color="#36e436ff" />
                  <Text style={styles.dueBadgeText}>
                    {daysLeft <= 0 ? 'Overdue!' : `Due in ${daysLeft} days`}
                  </Text>
                </View>
              </View>

              {/* Semi-Circular Lime Arc Gauge Ring */}
              <View style={styles.gaugeWrapper}>
                <Svg width="220" height="125" viewBox="0 0 200 120">
                  {/* Background Arc */}
                  <Path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="#F3F4F6"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  {/* Lime Progress Arc */}
                  <Path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="#36e436ff"
                    strokeWidth="14"
                    strokeDasharray="251"
                    strokeDashoffset={251 - (251 * Math.min(progress, 100)) / 100}
                    strokeLinecap="round"
                  />
                  {/* Glowing Lime Dot indicator */}
                  <Circle
                    cx="58"
                    cy="44"
                    r="7"
                    fill="#36e436ff"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                  />
                </Svg>

                <View style={styles.gaugeCenterCol}>
                  <Text style={styles.gaugePercentVal}>{progress}%</Text>
                  <Text style={styles.gaugePaidSub}>
                    {loan?.paidEmis || 2}/{loan?.termMonths || 10} Paid
                  </Text>
                </View>
              </View>

              {/* Card Bottom Row */}
              <View style={styles.cardBottomRow}>
                <View>
                  <Text style={styles.cardMaskId}>****8024</Text>
                  <Text style={styles.cardBalText}>
                    <Text style={styles.cardBalVal}>{fmt(loan?.outstanding || 67870)} </Text>
                    <Text style={styles.cardBalLabel}>Balance</Text>
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.payNowLimeBtn}
                  onPress={() => navigation.navigate('Loans')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.payNowLimeBtnText}>Pay Now</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Repayment Trend Chart Section ──────────────────────────────── */}
            <Text style={styles.sectionTitle}>Repayment Trend</Text>
            <RepaymentTrendChart />

            {/* ── Recent Activity Section ────────────────────────────────────── */}
            <Text style={[styles.sectionTitle, { marginTop: 22 }]}>Recent Activity</Text>

            <View style={styles.activityList}>
              {recentPayments.length > 0 ? (
                recentPayments.map((p) => (
                  <View key={p.id} style={styles.activityRow}>
                    <View style={styles.activityIconCircle}>
                      <Ionicons name="arrow-up-outline" size={18} color="#000000" style={{ transform: [{ rotate: '45deg' }] }} />
                    </View>
                    <View style={styles.activityMetaCol}>
                      <Text style={styles.activityTitle}>EMI Payment</Text>
                      <Text style={styles.activityDate}>{fmtDate(p.date)}</Text>
                    </View>
                    <Text style={styles.activityAmount}>+{fmt(p.amount)}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.activityRow}>
                  <View style={styles.activityIconCircle}>
                    <Ionicons name="arrow-up-outline" size={18} color="#000000" style={{ transform: [{ rotate: '45deg' }] }} />
                  </View>
                  <View style={styles.activityMetaCol}>
                    <Text style={styles.activityTitle}>EMI Payment</Text>
                    <Text style={styles.activityDate}>April 29, 2023</Text>
                  </View>
                  <Text style={styles.activityAmount}>+₹120.00</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (colors) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: '#c6c6c6cd',
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 110,
    },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: Platform.OS === 'ios' ? 12 : 16,
      paddingBottom: 12,
      backgroundColor: '#FFFFFF',
    },
    headerLeftRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    avatarWrap: {
      position: 'relative',
    },
    avatarCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#E5E7EB',
      alignItems: 'center',
      justifyContent: 'center',
    },
    greetingSub: {
      fontSize: 12,
      fontWeight: '600',
      color: '#6B7280',
    },
    userNameText: {
      fontSize: 17,
      fontWeight: '600',
      color: '#111827',
    },
    notifBtnLime: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#36e436ff',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#36e436ff',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 3,
    },

    // Debts Hero
    debtsHero: {
      marginVertical: 14,
      position: 'relative',
      zIndex: 10,
    },
    debtsHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    debtsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#111827',
    },
    periodPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E5E7EB',
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 16,
    },
    periodPillText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#374151',
    },
    dropdownMenu: {
      position: 'absolute',
      top: 36,
      right: 0,
      backgroundColor: '#FFFFFF',
      borderRadius: 14,
      padding: 6,
      width: 120,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },
    dropdownItem: {
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 8,
    },
    dropdownItemText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#6B7280',
    },
    dropdownItemTextActive: {
      color: '#111827',
      fontWeight: '700',
    },
    debtsAmountVal: {
      fontSize: 34,
      fontWeight: '600',
      color: '#111827',
      letterSpacing: -0.8,
    },

    // Arc Card
    arcCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 24,
      padding: 20,
      marginVertical: 14,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.06)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.04,
      shadowRadius: 12,
      elevation: 3,
    },
    cardTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    cardEmiAmount: {
      fontSize: 24,
      fontWeight: '600',
      color: '#111827',
      marginBottom: 2,
    },
    cardEmiLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: '#111827',
    },
    cardEmiDate: {
      fontSize: 11,
      color: '#6B7280',
    },
    dueBadgeWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    dueBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#36e436ff',
    },

    // Gauge
    gaugeWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 6,
      height: 120,
      position: 'relative',
    },
    gaugeCenterCol: {
      position: 'absolute',
      bottom: 12,
      alignItems: 'center',
    },
    gaugePercentVal: {
      fontSize: 32,
      fontWeight: '600',
      color: '#111827',
      letterSpacing: -0.5,
    },
    gaugePaidSub: {
      fontSize: 11,
      fontWeight: '600',
      color: '#6B7280',
      marginTop: 2,
    },

    // Bottom Row inside Card
    cardBottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: '#F3F4F6',
    },
    cardMaskId: {
      fontSize: 11,
      fontWeight: '700',
      color: '#111827',
    },
    cardBalText: {
      marginTop: 2,
    },
    cardBalVal: {
      fontSize: 14,
      fontWeight: '600',
      color: '#111827',
    },
    cardBalLabel: {
      fontSize: 11,
      color: '#6B7280',
    },
    payNowLimeBtn: {
      backgroundColor: '#36e436ff',
      borderRadius: 18,
      paddingHorizontal: 22,
      paddingVertical: 10,
      shadowColor: '#36e436ff',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 3,
    },
    payNowLimeBtnText: {
      color: '#000000',
      fontSize: 13,
      fontWeight: '600',
    },

    // Sections
    sectionTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: '#111827',
      marginVertical: 12,
    },

    // Activity List
    activityList: {
      gap: 12,
    },
    activityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#FFFFFF',
      padding: 14,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.04)',
    },
    activityIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#36e436ff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    activityMetaCol: {
      flex: 1,
      marginLeft: 12,
    },
    activityTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: '#111827',
      marginBottom: 2,
    },
    activityDate: {
      fontSize: 11,
      color: '#9CA3AF',
    },
    activityAmount: {
      fontSize: 14,
      fontWeight: '600',
      color: '#111827',
    },
  });

export default DashboardPage;
