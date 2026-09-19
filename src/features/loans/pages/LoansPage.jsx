import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, ActivityIndicator, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { loanStore } from '../../../store/loanStore';
import { NovaLogoIcon } from '../../../components/NovaLogo';
import { paymentStore } from '../../../store/paymentStore';
import { LoanProgressChart } from '../../../components/charts/Charts';
import { useTheme } from '../../../theme/useTheme';
import { paymentService } from '../../../services/paymentService';
import { loanService } from '../../../services/loanService';
import { authStore } from '../../../store/authStore';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
const daysUntil = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);

const PAYMENT_METHODS = [
  { id: 'hdfc', label: 'HDFC Bank ••4421', iconName: 'business-outline', sub: 'Savings Account' },
  { id: 'upi', label: 'UPI / PhonePe', iconName: 'phone-portrait-outline', sub: 'Instant transfer' },
  { id: 'card', label: 'Debit / Credit Card', iconName: 'card-outline', sub: 'Visa, Mastercard' },
  { id: 'netbanking', label: 'Net Banking', iconName: 'cash-outline', sub: 'All major banks' },
];

const SimChip = ({ styles }) => (
  <View style={styles.simChip}>
    <View style={styles.simInner}>
      <View style={styles.simLineH} />
      <View style={styles.simLineV} />
      <View style={styles.simCenter} />
    </View>
  </View>
);

const CardWaves = () => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <Svg width="100%" height="100%">
      <Defs>
        <LinearGradient id="wg" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#36e436ff" stopOpacity="0.10" />
          <Stop offset="100%" stopColor="#60a5fa" stopOpacity="0.04" />
        </LinearGradient>
      </Defs>
      <Path d="M -30 40 Q 100 130 220 20 T 420 90" fill="none" stroke="url(#wg)" strokeWidth="60" />
      <Path d="M -20 110 Q 140 20 260 130 T 440 30" fill="none" stroke="rgba(52,216,124,0.05)" strokeWidth="40" />
    </Svg>
  </View>
);

import { useNavigation } from '@react-navigation/native';

const LoansPage = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const [loan, setLoan] = useState(loanStore.getState());
  const [payments, setPayments] = useState(paymentStore.getState());
  const user = authStore.getState().user;
  const userName = user?.name ? user.name : 'Jane Cooper';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const [selectedMethod, setSelectedMethod] = useState('hdfc');
  const [customAmount, setCustomAmount] = useState('');
  const [payType, setPayType] = useState('emi');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [expandedReceipt, setExpandedReceipt] = useState(null);
  
  const [overdueData, setOverdueData] = useState(null);
  const [loadingOverdue, setLoadingOverdue] = useState(false);
  const [overdueError, setOverdueError] = useState('');

  useEffect(() => {
    const u1 = loanStore.subscribe(setLoan);
    const u2 = paymentStore.subscribe(setPayments);
    // Fetch fresh loan data from backend on mount
    loanService.getActiveLoan().catch(e => console.log('Loan API unavailable:', e.message));
    return () => { u1(); u2(); };
  }, []);

  useEffect(() => {
    if (loan && daysUntil(loan.nextDueDate) < 0) {
      const loadOverdue = async () => {
        setLoadingOverdue(true);
        setOverdueError('');
        try {
          const data = await loanService.getLoanOverdue(loan.id);
          setOverdueData(data);
        } catch (err) {
          setOverdueError('Unable to load overdue payment details. Please try again.');
        } finally {
          setLoadingOverdue(false);
        }
      };
      loadOverdue();
    } else {
      setOverdueData(null);
    }
  }, [loan?.id, loan?.nextDueDate]);

  const parseSafeNumber = (val) => {
    if (val == null || val === '') return 0;
    if (typeof val === 'number') return val;
    const cleaned = String(val).replace(/[^0-9.-]+/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const baseEmi = overdueData ? parseSafeNumber(overdueData.totalOverdueAmount) : (loan ? parseSafeNumber(loan.nextDueAmount) : 0);

  const payAmount = loan ? (
    payType === 'emi' ? baseEmi
      : payType === 'full' ? parseSafeNumber(loan.outstanding)
        : parseSafeNumber(customAmount)
  ) : 0;

  const methodLabel = PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.label || '';
  const progress = loan ? Math.round((loan.paid / loan.principal) * 100) : 0;
  const daysLeft = loan ? daysUntil(loan.nextDueDate) : 0;

  const handlePayment = async () => {
    if (payAmount <= 0 || payAmount > loan.outstanding) return;
    setLoading(true);
    try {
      const response = await paymentService.makePayment(payAmount, methodLabel, payType);
      setSuccess({
        amount: payAmount,
        method: methodLabel,
        date: response.transaction?.date || new Date().toISOString(),
      });
      setCustomAmount('');
      // Refresh the loan from backend to get updated authoritative amounts
      await loanService.getActiveLoan();
    } catch (error) {
      console.log('Payment API error, falling back to local simulation:', error.message);
      paymentStore.addPayment(payAmount, methodLabel);
      loanStore.makePayment(payAmount);
      setSuccess({ amount: payAmount, method: methodLabel, date: new Date().toISOString() });
      setCustomAmount('');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.successContainer}>
          <View style={styles.successIconRing}>
            <View style={styles.successIconInner}>
              <Ionicons name="checkmark" size={40} color={colors.successForeground} />
            </View>
          </View>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successSub}>{fmt(success.amount)} paid via {success.method}</Text>

          <View style={styles.receiptCard}>
            <View style={styles.receiptCardHeader}>
              <Ionicons name="receipt-outline" size={16} color={colors.success} />
              <Text style={styles.receiptCardTitle}>Transaction Receipt</Text>
            </View>
            {[
              ['Transaction ID', `TX-${String(payments.payments.length).padStart(3, '0')}`],
              ['Amount', fmt(success.amount)],
              ['Method', success.method],
              ['Date', fmtDate(success.date)],
              ['Status', 'Paid ✓'],
            ].map(([k, v]) => (
              <View key={k} style={styles.receiptRow}>
                <Text style={styles.receiptKey}>{k}</Text>
                <Text style={[styles.receiptVal, k === 'Status' && { color: colors.success }]}>{v}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.payAgainBtn}
            onPress={() => {
              setSuccess(null);
              navigation.navigate('Home');
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="home-outline" size={16} color={colors.successForeground} />
            <Text style={styles.payAgainText}>Back to Home</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Top Header (Avatar + Good Morning + Green Bell) ───────────────── */}
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
            <Text style={styles.greetingSub}>{greeting}</Text>
            <Text style={styles.userNameText}>{userName}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.notifBtnLime} activeOpacity={0.8}>
          <Ionicons name="notifications-outline" size={20} color="#000000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {!loan ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, paddingVertical: 80, paddingHorizontal: 20 }}>
            <Ionicons name="folder-open-outline" size={64} color={colors.mutedForeground} style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.foreground, marginBottom: 8 }}>There is no data</Text>
            <Text style={{ fontSize: 14, color: colors.mutedForeground, textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
              Loan details and payment options will appear here once your loan is approved and active.
            </Text>
            <TouchableOpacity
              style={[styles.payBtn, { alignSelf: 'center', paddingHorizontal: 32 }]}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.payBtnText}>Explore Loans</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* ── Loan Card ────────────────────────────────────────────────── */}
            <View style={styles.heroCard}>
              <View style={styles.creditCardVisual}>
                {/* Metallic Glass Glare Effects */}
                <View style={styles.cardGlare} />

                <Text style={styles.cardBrandTitle}>Hidel</Text>

                <View style={styles.cardMidSection}>
                  <Text style={styles.outstandingLabel}>Current Balance</Text>
                  <Text style={styles.outstandingAmountVal}>
                    {fmt(loan.outstanding)}
                  </Text>
                </View>

                <View style={styles.cardBottomRow}>
                  <Text style={styles.cardNumberText}>**** **** **** {loan.id ? loan.id.slice(-4) : '6925'}</Text>
                  <View style={styles.cardExpWrap}>
                    <Text style={styles.cardExpLabel}>Exp.Date</Text>
                    <Text style={styles.cardExpVal}>10/28</Text>
                  </View>
                </View>
              </View>

              {/* Progress */}
              <View style={{ marginTop: 16 }}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                </View>
                <View style={styles.progressMeta}>
                  <Text style={styles.progressMetaL}>{loan.paidEmis} of {loan.termMonths} EMIs · {progress}% repaid</Text>
                  <Text style={styles.progressMetaR}>{fmt(loan.paid)} total paid</Text>
                </View>
              </View>

              {/* Key info */}
              <View style={styles.keyInfoRow}>
                {[
                  { label: 'Principal', val: fmt(loan.principal) },
                  { label: 'Rate', val: `${loan.interestRate}% p.a.` },
                  { label: 'Next Due', val: fmtDate(loan.nextDueDate) },
                ].map(({ label, val }, i, arr) => (
                  <React.Fragment key={label}>
                    <View style={styles.keyInfoCol}>
                      <Text style={styles.keyInfoLabel}>{label}</Text>
                      <Text style={styles.keyInfoVal}>{val}</Text>
                    </View>
                    {i < arr.length - 1 && <View style={styles.keyInfoDivider} />}
                  </React.Fragment>
                ))}
              </View>
            </View>

            {/* ── Urgent Alert ─────────────────────────────────────────────── */}
            {daysLeft <= 5 && daysLeft >= 0 && (
              <View style={styles.urgentBanner}>
                <View style={styles.urgentIconWrap}>
                  <Ionicons name="alert-circle" size={16} color={colors.destructive} />
                </View>
                <Text style={styles.urgentText}>
                  EMI {daysLeft <= 0 ? 'is due today' : `due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`} — {fmtDate(loan.nextDueDate)}
                </Text>
              </View>
            )}

            {/* ── Overdue Alert & Details ─────────────────────────────────────────────── */}
            {daysLeft < 0 && (
              <View style={[styles.payCard, { borderColor: colors.destructiveBorder, backgroundColor: colors.destructiveDim }]}>
                <View style={styles.payCardHeader}>
                  <Ionicons name="warning" size={18} color={colors.destructive} />
                  <Text style={[styles.sectionTitle, { color: colors.destructive }]}>Overdue Payment</Text>
                </View>

                {loadingOverdue ? (
                  <ActivityIndicator color={colors.destructive} style={{ padding: 20 }} />
                ) : overdueError ? (
                  <Text style={{ color: colors.destructive, paddingVertical: 10 }}>{overdueError}</Text>
                ) : overdueData ? (
                  <View style={styles.summaryBox}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryKey}>Outstanding</Text>
                      <Text style={styles.summaryVal}>{fmt(overdueData.remainingAmount || overdueData.overdueAmount)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryKey}>Days Overdue</Text>
                      <Text style={styles.summaryVal}>{overdueData.daysOverdue} day{overdueData.daysOverdue !== 1 ? 's' : ''}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryKey}>Late Due Interest Rate</Text>
                      <Text style={styles.summaryVal}>{Number(overdueData.lateDueInterestRate || 0).toFixed(2)}%</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryKey}>Late Due Interest</Text>
                      <Text style={styles.summaryVal}>{fmt(overdueData.lateDueInterest || overdueData.overdueInterest)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryKey}>Late Due Fee</Text>
                      <Text style={styles.summaryVal}>{fmt(overdueData.lateDueFee || overdueData.latePaymentCharge)}</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryKey, { fontWeight: '700', color: colors.foreground, fontSize: 15 }]}>Total Amount Due</Text>
                      <Text style={[styles.summaryVal, { color: colors.destructive, fontSize: 16, fontWeight: '600' }]}>{fmt(overdueData.totalLateDueAmount || overdueData.totalOverdueAmount)}</Text>
                    </View>
                  </View>
                ) : null}
              </View>
            )}

            {/* ── Payment Section ───────────────────────────────────────────── */}
            <View style={styles.payCard}>
              <View style={styles.payCardHeader}>
                <Ionicons name="card-outline" size={18} color={colors.success} />
                <Text style={styles.sectionTitle}>Make a Payment</Text>
              </View>

              {/* Type selector */}
              <View style={styles.typeRow}>
                {[
                  { id: 'emi', label: overdueData ? 'Pay Overdue' : 'Pay EMI', value: fmt(baseEmi) },
                  { id: 'custom', label: 'Partial amount', value: 'Enter amount' },
                  { id: 'full', label: 'Full amount', value: fmt(loan.outstanding) },
                ].map(({ id, label, value }) => (
                  <TouchableOpacity
                    key={id}
                    style={[styles.typeBtn, payType === id && styles.typeBtnActive]}
                    onPress={() => setPayType(id)}
                    activeOpacity={0.75}
                  >
                    {payType === id && (
                      <View style={styles.typeBtnDot} />
                    )}
                    <Text style={[styles.typeBtnLabel, payType === id && { color: colors.success }]}>{label}</Text>
                    <Text style={[styles.typeBtnValue, payType === id && { color: colors.foreground }]}>{value}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom input */}
              {payType === 'custom' && (
                <View style={styles.customInputWrap}>
                  <Text style={styles.rupeeSign}>₹</Text>
                  <TextInput
                    style={styles.customInput}
                    placeholder="Enter amount"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="numeric"
                    value={customAmount}
                    onChangeText={setCustomAmount}
                  />
                  <Text style={styles.maxLabel}>Max: {fmt(loan.outstanding)}</Text>
                </View>
              )}

              {/* Payment Methods */}
              <Text style={styles.methodHeading}>Select Payment Method</Text>
              <View style={{ gap: 8 }}>
                {PAYMENT_METHODS.map(({ id, label, iconName, sub }) => (
                  <TouchableOpacity
                    key={id}
                    style={[styles.methodBtn, selectedMethod === id && styles.methodBtnActive]}
                    onPress={() => setSelectedMethod(id)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.methodIcon, selectedMethod === id && styles.methodIconActive]}>
                      <Ionicons name={iconName} size={16} color={selectedMethod === id ? colors.success : colors.mutedForeground} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.methodLabel}>{label}</Text>
                      <Text style={styles.methodSub}>{sub}</Text>
                    </View>
                    <View style={[styles.radioOuter, selectedMethod === id && styles.radioOuterActive]}>
                      {selectedMethod === id && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Summary */}
              <View style={styles.summaryBox}>
                {[['Amount', fmt(payAmount)], ['Method', methodLabel]].map(([k, v]) => (
                  <View key={k} style={styles.summaryRow}>
                    <Text style={styles.summaryKey}>{k}</Text>
                    <Text style={styles.summaryVal}>{v}</Text>
                  </View>
                ))}
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryKey, { fontWeight: '700', color: colors.foreground, fontSize: 15 }]}>Total</Text>
                  <Text style={[styles.summaryVal, { color: colors.success, fontSize: 16, fontWeight: '600' }]}>{fmt(payAmount)}</Text>
                </View>
              </View>

              {/* Pay button */}
              <TouchableOpacity
                style={[styles.payBtn, (loading || payAmount <= 0) && styles.payBtnDisabled]}
                onPress={handlePayment}
                disabled={loading || payAmount <= 0}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color={colors.successForeground} />
                ) : (
                  <>
                    <Ionicons name="lock-closed-outline" size={16} color={colors.successForeground} />
                    <Text style={styles.payBtnText}>Pay {fmt(payAmount)} Securely</Text>
                  </>
                )}
              </TouchableOpacity>
              {/* <Text style={styles.secureNote}>🔒 256-bit SSL encrypted · RBI compliant</Text> */}
            </View>
          </>
        )}



      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#c6c6c6cd' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 110, gap: 14 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  headerLeftRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarWrap: { position: 'relative' },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  greetingSub: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  userNameText: { fontSize: 17, fontWeight: '600', color: '#111827' },
  notifBtnLime: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.limeBtn || '#A3E635',
    alignItems: 'center', justifyContent: 'center', shadowColor: '#84CC16',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 3,
  },

  // Success
  successContainer: { flexGrow: 1, alignItems: 'center', padding: 32, paddingTop: 80, gap: 16 },
  successIconRing: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: colors.successDim, borderWidth: 2, borderColor: colors.successBorder,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.success, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 8,
  },
  successIconInner: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.success,
    alignItems: 'center', justifyContent: 'center',
  },
  successTitle: { fontSize: 26, fontWeight: '600', color: colors.foreground, letterSpacing: -0.5 },
  successSub: { fontSize: 14, color: colors.mutedForeground, textAlign: 'center' },
  receiptCard: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: colors.radiusMd, padding: 20, width: '100%', gap: 2,
  },
  receiptCardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginBottom: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  receiptCardTitle: { fontSize: 14, fontWeight: '700', color: colors.foreground },
  receiptRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  receiptKey: { fontSize: 13, color: colors.mutedForeground },
  receiptVal: { fontSize: 13, fontWeight: '700', color: colors.foreground },
  payAgainBtn: {
    backgroundColor: colors.limeBtn || '#A3E635', borderRadius: colors.radius,
    paddingHorizontal: 32, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    shadowColor: colors.limeBtn || '#A3E635', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 7,
  },
  payAgainText: { color: colors.limeBtnText || '#000000', fontWeight: '600', fontSize: 16 },

  // Hero card
  heroCard: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: colors.radiusLg, padding: 16, ...colors.shadowCard,
  },
  creditCardVisual: {
    backgroundColor: '#16161D', // dark glassy color
    borderRadius: 24,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  cardGlare: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 350,
    height: 350,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    transform: [{ rotate: '35deg' }],
  },
  cardBrandTitle: { fontSize: 18, fontWeight: '600', color: '#D1D5DB' },
  cardMidSection: { marginTop: 32, marginBottom: 32 },
  outstandingLabel: { fontSize: 13, color: '#9CA3AF', fontWeight: '500', marginBottom: 6 },
  outstandingAmountVal: { fontSize: 36, fontWeight: '600', color: '#F3F4F6', letterSpacing: -0.5 },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardNumberText: { fontSize: 16, color: '#9CA3AF', letterSpacing: 2, paddingTop: 6 },
  cardExpWrap: { alignItems: 'flex-end' },
  cardExpLabel: { fontSize: 10, color: '#9CA3AF', marginBottom: 2 },
  cardExpVal: { fontSize: 13, color: '#D1D5DB', fontWeight: '500' },

  progressBarBg: { height: 5, backgroundColor: '#E5E7EB', borderRadius: 99, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: colors.limeBtn || '#A3E635', borderRadius: 99, shadowColor: colors.limeBtn || '#A3E635', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 6 },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  progressMetaL: { fontSize: 11, color: colors.mutedForeground, fontWeight: '500' },
  progressMetaR: { fontSize: 11, color: colors.success, fontWeight: '600' },

  keyInfoRow: { flexDirection: 'row', marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border },
  keyInfoCol: { flex: 1 },
  keyInfoDivider: { width: 1, height: 28, backgroundColor: colors.border, alignSelf: 'center', marginHorizontal: 8 },
  keyInfoLabel: { fontSize: 9, color: colors.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '600', marginBottom: 4 },
  keyInfoVal: { fontSize: 13, fontWeight: '700', color: colors.foreground },

  // Urgent
  urgentBanner: {
    backgroundColor: colors.destructiveDim, borderWidth: 1, borderColor: colors.destructiveBorder,
    borderRadius: colors.radius, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  urgentIconWrap: { width: 32, height: 32, borderRadius: 9, backgroundColor: 'rgba(248,113,113,0.15)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  urgentText: { fontSize: 13, color: colors.destructive, fontWeight: '600', flex: 1 },

  // Pay card
  payCard: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: colors.radiusLg, padding: 20, gap: 14, ...colors.shadowCard,
  },
  payCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground },

  // Type selector
  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: {
    flex: 1, padding: 12, borderRadius: colors.radius,
    borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', backgroundColor: colors.muted, position: 'relative',
  },
  typeBtnActive: { borderColor: colors.limeBtn || '#A3E635', backgroundColor: 'rgba(163,230,53,0.06)' },
  typeBtnDot: {
    position: 'absolute', top: 8, right: 8,
    width: 7, height: 7, borderRadius: 4, backgroundColor: colors.limeBtn || '#A3E635',
  },
  typeBtnLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700', color: colors.mutedForeground, marginBottom: 4 },
  typeBtnValue: { fontSize: 12, fontWeight: '700', color: colors.mutedForeground, textAlign: 'center' },

  // Custom input
  customInputWrap: { position: 'relative' },
  rupeeSign: { fontSize: 16, color: colors.mutedForeground, position: 'absolute', left: 16, top: 15, zIndex: 1, fontWeight: '700' },
  customInput: {
    backgroundColor: colors.input, borderWidth: 1.5, borderColor: colors.successBorder,
    borderRadius: colors.radius, padding: 14, paddingLeft: 34,
    color: colors.foreground, fontSize: 16, fontWeight: '600',
  },
  maxLabel: { fontSize: 11, color: colors.mutedForeground, marginTop: 4, textAlign: 'right' },

  // Methods
  methodHeading: { fontSize: 12, fontWeight: '700', color: colors.mutedForeground, textTransform: 'uppercase', letterSpacing: 1 },
  methodBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: colors.radius,
    borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.muted,
  },
  methodBtnActive: { borderColor: colors.limeBtn || '#A3E635', backgroundColor: 'rgba(163,230,53,0.04)' },
  methodIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: colors.mutedAlt, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  methodIconActive: { backgroundColor: colors.successDim },
  methodLabel: { fontSize: 14, fontWeight: '600', color: colors.foreground },
  methodSub: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioOuterActive: { borderColor: colors.limeBtn || '#A3E635' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.limeBtn || '#A3E635' },

  // Summary
  summaryBox: {
    backgroundColor: colors.muted, borderRadius: colors.radius,
    padding: 16, gap: 6, borderWidth: 1, borderColor: colors.border,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryKey: { fontSize: 13, color: colors.mutedForeground, fontWeight: '500' },
  summaryVal: { fontSize: 13, fontWeight: '700', color: colors.foreground },
  summaryDivider: { height: 1, backgroundColor: colors.borderStrong, marginVertical: 6 },

  // Pay button
  payBtn: {
    backgroundColor: colors.limeBtn || '#A3E635', borderRadius: colors.radius,
    padding: 17, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
    shadowColor: colors.limeBtn || '#A3E635', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.45, shadowRadius: 14, elevation: 7,
  },
  payBtnDisabled: { backgroundColor: colors.muted, shadowOpacity: 0 },
  payBtnText: { fontSize: 16, fontWeight: '600', color: colors.limeBtnText || '#000000' },
  secureNote: { fontSize: 11, color: colors.mutedForeground, textAlign: 'center', marginTop: -6 },

  // Receipt history
  receiptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  receiptCount: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
  allPaidBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.successDim, borderWidth: 1, borderColor: colors.successBorder,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: colors.radiusFull,
  },
  allPaidDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  allPaidText: { fontSize: 12, color: colors.success, fontWeight: '700' },
  receiptItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, backgroundColor: colors.muted,
    borderWidth: 1, borderColor: colors.border, borderRadius: colors.radius,
  },
  receiptItemExpanded: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottomColor: 'transparent' },
  receiptItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  receiptIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.successDim, alignItems: 'center', justifyContent: 'center',
  },
  receiptEmi: { fontSize: 14, fontWeight: '700', color: colors.foreground },
  receiptDate: { fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
  receiptRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  receiptAmount: { fontSize: 15, fontWeight: '600', color: colors.success },
  paidBadgeMini: {
    backgroundColor: colors.successDim, borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: colors.successBorder,
  },
  paidBadgeMiniText: { fontSize: 10, color: colors.success, fontWeight: '700' },
  receiptExpand: {
    backgroundColor: 'rgba(52,216,124,0.03)', borderWidth: 1, borderColor: colors.successBorder,
    borderTopWidth: 0, borderBottomLeftRadius: colors.radius, borderBottomRightRadius: colors.radius,
    padding: 14, gap: 4,
  },
  expandRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  expandKey: { fontSize: 12, color: colors.mutedForeground, fontWeight: '500' },
  expandVal: { fontSize: 12, fontWeight: '700', color: colors.foreground },
});

export default LoansPage;
