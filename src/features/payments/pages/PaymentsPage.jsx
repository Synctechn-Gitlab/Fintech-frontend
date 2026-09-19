import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { paymentStore } from '../../../store/paymentStore';
import { loanStore } from '../../../store/loanStore';
import { authStore } from '../../../store/authStore';
import { useTheme } from '../../../theme/useTheme';
import { paymentService } from '../../../services/paymentService';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

const fmtDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const PaymentsPage = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [payments, setPayments] = useState(paymentStore.getState());
  const [loan, setLoan] = useState(loanStore.getState());
  const [user] = useState(authStore.getState().user);

  useFocusEffect(
    useCallback(() => {
      const u1 = paymentStore.subscribe(setPayments);
      const u2 = loanStore.subscribe(setLoan);
      paymentService.getPayments().catch(e => console.log('Payments API unavailable:', e.message));
      return () => { u1(); u2(); };
    }, [])
  );

  const userName = user?.name ? user.name : 'Jane Cooper';
  const hasActiveLoan = loan && loan.outstanding > 0;
  const recentPayments = payments.payments.length > 0 ? payments.payments : [
    { id: 'p1', date: '2024-04-15', amount: 450.00, status: 'Success' },
    { id: 'p2', date: '2024-03-15', amount: 450.00, status: 'Success' },
    { id: 'p3', date: '2024-02-15', amount: 450.00, status: 'Success' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Top Header (Avatar + Good Morning + Green Bell) ───────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeftRow}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={24} color="#374151" />
            </View>
          </View>

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
              Payment history and details will appear here once your loan is approved and active.
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
            {/* ── Dark Glassmorphic "Loan Summary" Hero Card ───────────────────── */}
            <View style={styles.loanSummaryCard}>
              {/* Corner Glow Blob */}
              <View style={styles.glowBlob} />

              <View style={styles.summaryHeaderRow}>
                <Text style={styles.summaryTitle}>Loan Summary</Text>
                <View style={styles.activeStatusBadge}>
                  <View style={styles.greenStatusDot} />
                  <Text style={styles.activeStatusText}>Active Loan</Text>
                </View>
              </View>

              <Text style={styles.outstandingLabel}>Total Outstanding Balance</Text>
              <Text style={styles.outstandingAmountVal}>
                {fmt(loan?.outstanding || 12505.58)}
              </Text>
            </View>

            {/* ── Horizontal Date Strip & "Next Due Date" Pill Card ────────────── */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateStripRow}
            >
              <View style={styles.dateCell}>
                <Text style={styles.dateDayLabel}>Mon</Text>
                <Text style={styles.dateNumLabel}>17</Text>
              </View>

              <View style={styles.dateCell}>
                <Text style={styles.dateDayLabel}>Sat</Text>
                <Text style={styles.dateNumLabel}>18</Text>
              </View>

              <View style={styles.dateCell}>
                <Text style={styles.dateDayLabel}>Sun</Text>
                <Text style={styles.dateNumLabel}>19</Text>
              </View>

              <View style={[styles.dateCell, styles.dateCellActive]}>
                <Text style={styles.dateDayLabelActive}>Apr</Text>
                <Text style={styles.dateNumLabelActive}>20</Text>
              </View>

              {/* Lime Next Due Date Card Pill */}
              <View style={styles.nextDueLimePillCard}>
                <View style={styles.nextDuePillHeader}>
                  <Text style={styles.nextDueLabelText}>Next Due Date</Text>
                  <View style={styles.greenPillDot} />
                </View>
                <Text style={styles.nextDueDateVal}>
                  {fmtDate(loan?.nextDueDate || '2024-05-15')}
                </Text>
              </View>
            </ScrollView>

            {/* ── "Recent Payments" Section ───────────────────────────────────── */}
            <Text style={styles.sectionTitle}>Recent Payments</Text>

            <View style={styles.paymentsList}>
              {recentPayments.map((item) => (
                <View key={item.id} style={styles.paymentCard}>
                  <View style={styles.receiptLimeCircle}>
                    <Ionicons name="receipt-outline" size={20} color="#000000" />
                  </View>

                  <View style={styles.paymentMetaCol}>
                    <Text style={styles.paymentDateText}>{fmtDate(item.date)}</Text>
                    <Text style={styles.paymentAmountVal}>{fmt(item.amount)}</Text>
                  </View>

                  <Text style={styles.statusSuccessText}>
                    {item.status || 'Success'}
                  </Text>
                </View>
              ))}
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
      paddingBottom: 16,
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

    // Loan Summary Dark Card
    loanSummaryCard: {
      backgroundColor: '#0D1117',
      borderRadius: 28,
      padding: 24,
      marginVertical: 10,
      position: 'relative',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 6,
    },
    glowBlob: {
      position: 'absolute',
      bottom: -30,
      right: -30,
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: 'rgba(144, 238, 144, 0.18)',
    },
    summaryHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    summaryTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    activeStatusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#142E21',
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(144, 238, 144, 0.3)',
    },
    greenStatusDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: '#36e436ff',
    },
    activeStatusText: {
      color: '#36e436ff',
      fontSize: 11,
      fontWeight: '700',
    },
    outstandingLabel: {
      fontSize: 13,
      color: '#9CA3AF',
      fontWeight: '500',
      marginBottom: 6,
    },
    outstandingAmountVal: {
      fontSize: 34,
      fontWeight: '600',
      color: '#FFFFFF',
      letterSpacing: -0.5,
    },

    // Date Strip
    dateStripRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginVertical: 18,
    },
    dateCell: {
      width: 52,
      height: 64,
      borderRadius: 16,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.06)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 6,
      elevation: 2,
    },
    dateCellActive: {
      borderColor: '#36e436ff',
      borderWidth: 1.5,
    },
    dateDayLabel: {
      fontSize: 11,
      color: '#6B7280',
      fontWeight: '600',
      marginBottom: 4,
    },
    dateDayLabelActive: {
      fontSize: 11,
      color: '#36e436ff',
      fontWeight: '700',
      marginBottom: 4,
    },
    dateNumLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: '#111827',
    },
    dateNumLabelActive: {
      fontSize: 15,
      fontWeight: '600',
      color: '#36e436ff',
    },
    nextDueLimePillCard: {
      backgroundColor: '#36e436ff',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      justifyContent: 'center',
      shadowColor: '#36e436ff',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    nextDuePillHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 2,
    },
    nextDueLabelText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#111827',
    },
    greenPillDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#36e436ff',
    },
    nextDueDateVal: {
      fontSize: 15,
      fontWeight: '600',
      color: '#000000',
    },

    // Section Title
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#111827',
      marginBottom: 14,
    },

    // Payments List
    paymentsList: {
      gap: 14,
    },
    paymentCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#FFFFFF',
      borderRadius: 22,
      padding: 16,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.05)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: 10,
      elevation: 2,
    },
    receiptLimeCircle: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: '#36e436ff',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#36e436ff',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },
    paymentMetaCol: {
      flex: 1,
      marginLeft: 14,
    },
    paymentDateText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#6B7280',
      marginBottom: 2,
    },
    paymentAmountVal: {
      fontSize: 18,
      fontWeight: '600',
      color: '#111827',
    },
    statusSuccessText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#36e436ff',
    },
  });

export default PaymentsPage;
