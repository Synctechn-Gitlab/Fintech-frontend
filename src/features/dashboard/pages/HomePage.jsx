import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Platform, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { loanStore } from '../../../store/loanStore';
import { authStore } from '../../../store/authStore';
import { useTheme } from '../../../theme/useTheme';
import { loanService } from '../../../services/loanService';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const HomePage = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const [loan, setLoan] = useState(loanStore.getState());
  const [user] = useState(authStore.getState().user);

  useEffect(() => {
    const unsubscribe = loanStore.subscribe(setLoan);
    loanService.getActiveLoan().catch(e => console.log('Loan API unavailable:', e.message));
    return unsubscribe;
  }, []);

  const isExistingUser = loan && loan.outstanding > 0;
  const userName = user?.name ? user.name.split(' ')[0] : 'Sarah';

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Brand Header (FinTrust Logo & Profile Avatar) ───────────────── */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Image
            source={{ uri: 'https://res.cloudinary.com/wowukaao/image/upload/v1785171832/Screenshot_2026-07-27_223203-removebg-preview_kikjdd.png' }}
            style={styles.logoIconImage}
          />
          <Text style={styles.logoText}>Hidel Finance</Text>
        </View>

        <TouchableOpacity
          style={styles.avatarWrap}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.8}
        >
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={24} color="#9CA3AF" />
          </View>
          <View style={styles.onlineBadgeDot} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Greeting Header ───────────────────────────────────────────── */}
        <Text style={styles.greetingTitle}>Welcome Back, {userName}.</Text>

        {/* ── Hero Banner Glassmorphic Card ──────────────────────────────── */}
        <View style={styles.heroCard}>
          {/* Subtle Glow Blobs */}
          <View style={styles.glowBlobLeft} />
          <View style={styles.glowBlobRight} />

          <View style={styles.trustedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
            <Text style={styles.trustedBadgeText}>Trusted by Millions</Text>
          </View>

          <Text style={styles.heroTitle}>
            Need a Loan? Unlock Your Financial Future.
          </Text>
          <Text style={styles.heroSubtitle}>
            Competitive rates and quick approval.
          </Text>

          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('PersonalLoanDetails', { loanType: 'Personal Loan' })}
            activeOpacity={0.85}
          >
            <Text style={styles.exploreBtnText}>Explore Loans</Text>
          </TouchableOpacity>
        </View>


        {/* ── Active Loan Banner (For Existing Users) ───────────────────── */}
        {isExistingUser && (
          <View style={styles.activeLoanCard}>
            <View style={styles.activeLoanHeader}>
              <View style={styles.activeLoanBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#29e729ff" />
                <Text style={styles.activeLoanBadgeText}>Active Loan</Text>
              </View>
              <Text style={styles.activeLoanId}>{loan.id}</Text>
            </View>

            <View style={styles.activeLoanMain}>
              <View>
                <Text style={styles.activeLoanLabel}>Outstanding Balance</Text>
                <Text style={styles.activeLoanVal}>{fmt(loan.outstanding)}</Text>
              </View>
              <View style={styles.dueDivider} />
              <View>
                <Text style={styles.activeLoanLabel}>Next EMI Due</Text>
                <Text style={styles.activeLoanDueAmount}>{fmt(loan.nextDueAmount)}</Text>
                <Text style={styles.activeLoanDueDate}>Due: {fmtDate(loan.nextDueDate)}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.payNowBtn}
              onPress={() => navigation.navigate('Loans')}
              activeOpacity={0.85}
            >
              <Text style={styles.payNowBtnText}>Pay Now</Text>
              <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Popular Loan Categories Section ────────────────────────────── */}
        <Text style={styles.sectionTitle}>Popular Loan Categories</Text>

        <View style={styles.popularGridContent}>
          {/* Card 1: Personal Loan */}
          <View style={styles.popularCard}>
            <View style={styles.popularIconWrap}>
              <Ionicons name="person-outline" size={26} color="#1F2937" />
              <View style={styles.popularIconBadge}>
                <Ionicons name="cash-outline" size={11} color="#36e436ff" />
              </View>
            </View>
            <Text style={styles.cardTitle}>Personal Loan</Text>

            <Text style={styles.metricLabel}>Max amount</Text>
            <Text style={styles.metricVal}>₹50,000</Text>

            <Text style={styles.metricLabel}>Interest rate</Text>
            <Text style={styles.metricValSub}>From 5.99% APR</Text>

            <TouchableOpacity
              style={styles.applyLimeBtn}
              onPress={() => navigation.navigate('PersonalLoanDetails', { loanType: 'Personal Loan' })}
              activeOpacity={0.85}
            >
              <Text style={styles.applyLimeBtnText}>Apply Now</Text>
            </TouchableOpacity>
          </View>

          {/* Card 2: Business Loan */}
          <View style={styles.popularCard}>
            <View style={styles.popularIconWrap}>
              <Ionicons name="trending-up-outline" size={26} color="#1F2937" />
              <View style={styles.popularIconBadge}>
                <Ionicons name="bar-chart-outline" size={11} color="#36e436ff" />
              </View>
            </View>
            <Text style={styles.cardTitle}>Business Loan</Text>

            <Text style={styles.metricLabel}>Max amount</Text>
            <Text style={styles.metricVal}>₹250,000</Text>

            <Text style={styles.metricLabel}>Interest rate</Text>
            <Text style={styles.metricValSub}>From 4.75% APR</Text>

            <TouchableOpacity
              style={styles.applyLimeBtn}
              onPress={() => navigation.navigate('PersonalLoanDetails', { loanType: 'Business Loan' })}
              activeOpacity={0.85}
            >
              <Text style={styles.applyLimeBtnText}>Apply Now</Text>
            </TouchableOpacity>
          </View>

          {/* Card 3: Auto Loan */}
          <View style={styles.popularCard}>
            <View style={styles.popularIconWrap}>
              <Ionicons name="car-outline" size={26} color="#1F2937" />
            </View>
            <Text style={styles.cardTitle}>Auto Loan</Text>

            <Text style={styles.metricLabel}>Max amount</Text>
            <Text style={styles.metricVal}>₹250,000</Text>

            <Text style={styles.metricLabel}>Interest rate</Text>
            <Text style={styles.metricValSub}>From 4.75% APR</Text>

            <TouchableOpacity
              style={styles.applyLimeBtn}
              onPress={() => navigation.navigate('PersonalLoanDetails', { loanType: 'Auto Loan' })}
              activeOpacity={0.85}
            >
              <Text style={styles.applyLimeBtnText}>Apply Now</Text>
            </TouchableOpacity>
          </View>

          {/* Card 4: Home Loan */}
          <View style={styles.popularCard}>
            <View style={styles.popularIconWrap}>
              <Ionicons name="home-outline" size={26} color="#1F2937" />
            </View>
            <Text style={styles.cardTitle}>Home Loan</Text>

            <Text style={styles.metricLabel}>Max amount</Text>
            <Text style={styles.metricVal}>₹500,000</Text>

            <Text style={styles.metricLabel}>Interest rate</Text>
            <Text style={styles.metricValSub}>From 3.25% APR</Text>

            <TouchableOpacity
              style={styles.applyLimeBtn}
              onPress={() => navigation.navigate('PersonalLoanDetails', { loanType: 'Home Loan' })}
              activeOpacity={0.85}
            >
              <Text style={styles.applyLimeBtnText}>Apply Now</Text>
            </TouchableOpacity>
          </View>
        </View>
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
      paddingBottom: 110,
    },

    // Brand Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: Platform.OS === 'ios' ? 12 : 16,
      paddingBottom: 12,
      backgroundColor: '#F4F5F9',
    },
    logoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    logoIconImage: {
      width: 60,
      height: 60,
      borderRadius: 14,
      resizeMode: 'contain',
    },
    logoText: {
      fontSize: 26,
      fontWeight: '700',
      color: '#111827',
      letterSpacing: -0.5,
    },
    avatarWrap: {
      position: 'relative',
    },
    avatarCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: '#E5E7EB',
      alignItems: 'center',
      justifyContent: 'center',
    },
    onlineBadgeDot: {
      position: 'absolute',
      top: 1,
      right: 1,
      width: 11,
      height: 11,
      borderRadius: 6,
      backgroundColor: '#36e436ff',
      borderWidth: 2,
      borderColor: '#FFFFFF',
    },

    // Greeting
    greetingTitle: {
      fontSize: 22,
      fontWeight: '600',
      color: '#111827',
      textAlign: 'center',
      marginVertical: 14,
    },

    // Hero Banner Card
    heroCard: {
      marginHorizontal: 20,
      backgroundColor: '#FFFFFF',
      borderRadius: 28,
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(52,216,124, 0.25)',
      shadowColor: '#36e436ff',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.22,
      shadowRadius: 20,
      elevation: 6,
      marginBottom: 20,
    },
    glowBlobLeft: {
      position: 'absolute',
      top: -40,
      left: -40,
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: 'rgba(52,216,124, 0.22)',
    },
    glowBlobRight: {
      position: 'absolute',
      bottom: -40,
      right: -40,
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: 'rgba(56, 189, 248, 0.22)',
    },
    trustedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#111827',
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 16,
      alignSelf: 'flex-start',
      marginBottom: 16,
    },
    trustedBadgeText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '700',
    },
    heroTitle: {
      fontSize: 26,
      fontWeight: '600',
      color: '#111827',
      lineHeight: 32,
      marginBottom: 8,
      letterSpacing: -0.5,
    },
    heroSubtitle: {
      fontSize: 14,
      color: '#4B5563',
      marginBottom: 20,
      fontWeight: '500',
    },
    exploreBtn: {
      backgroundColor: '#36e436ff',
      borderRadius: 24,
      paddingVertical: 14,
      alignItems: 'center',
      shadowColor: '#36e436ff',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 4,
    },
    exploreBtnText: {
      color: '#000000',
      fontSize: 15,
      fontWeight: '600',
    },

    // Quick Action Circles
    quickActionRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    actionCircle: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: '#F3F4F6',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    circleBadge: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      backgroundColor: '#FFFFFF',
      borderRadius: 9,
      padding: 2,
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },

    // Active Loan Banner
    activeLoanCard: {
      marginHorizontal: 20,
      backgroundColor: '#F9FAFB',
      borderRadius: 20,
      padding: 18,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },
    activeLoanHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    activeLoanBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: '#D1FAE5',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    activeLoanBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#36e436ff',
    },
    activeLoanId: {
      fontSize: 11,
      color: '#9CA3AF',
      fontWeight: '600',
    },
    activeLoanMain: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    activeLoanLabel: {
      fontSize: 11,
      color: '#6B7280',
      marginBottom: 2,
    },
    activeLoanVal: {
      fontSize: 19,
      fontWeight: '600',
      color: '#111827',
    },
    dueDivider: {
      width: 1,
      height: 30,
      backgroundColor: '#E5E7EB',
    },
    activeLoanDueAmount: {
      fontSize: 16,
      fontWeight: '700',
      color: '#36e436ff',
    },
    activeLoanDueDate: {
      fontSize: 10,
      color: '#6B7280',
    },
    payNowBtn: {
      backgroundColor: '#111827',
      borderRadius: 14,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    payNowBtnText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 13,
    },

    // Popular Loan Categories
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#111827',
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    popularGridContent: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      rowGap: 16,
    },
    popularCard: {
      width: '48%',
      backgroundColor: '#FFFFFF',
      borderRadius: 24,
      padding: 18,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.06)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 3,
    },
    popularIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: '#F3F4F6',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      marginBottom: 12,
    },
    popularIconBadge: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      padding: 2,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: '#111827',
      marginBottom: 12,
    },
    metricLabel: {
      fontSize: 11,
      color: '#6B7280',
      fontWeight: '500',
    },
    metricVal: {
      fontSize: 16,
      fontWeight: '600',
      color: '#111827',
      marginBottom: 8,
    },
    metricValSub: {
      fontSize: 12,
      fontWeight: '700',
      color: '#111827',
      marginBottom: 16,
    },
    applyLimeBtn: {

      backgroundColor: '#36e436ff',
      borderRadius: 18,
      paddingVertical: 10,
      alignItems: 'center',
    },
    applyLimeBtnText: {
      color: '#000000',
      fontSize: 12,
      fontWeight: '600',
    },
  });

export default HomePage;
