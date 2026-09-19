import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView,
  Modal, TextInput, KeyboardAvoidingView, Platform, Animated, Image
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../../theme/useTheme';

const LOAN_DETAILS = {
  'Personal Loan': {
    title: 'Personal Loan',
    subtitle: 'For Salaried & Self-Employed Professionals',
    amount: '₹ 10,00,000',
    rate: 'From 24% to 29.95% p.a.',
    processing: 'Up to 5.1% + GST',
    tenure: 'Up to 60 months'
  },
  'Business Loan': {
    title: 'Business Loan',
    subtitle: 'Fuel your business growth',
    amount: '₹ 25,00,000',
    rate: 'From 18% to 24.50% p.a.',
    processing: 'Up to 2.5% + GST',
    tenure: 'Up to 72 months'
  },
  'Auto Loan': {
    title: 'Auto Loan',
    subtitle: 'Drive your dream car today',
    amount: '₹ 15,00,000',
    rate: 'From 12% to 15.25% p.a.',
    processing: 'Up to 1.5% + GST',
    tenure: 'Up to 84 months'
  },
  'Home Loan': {
    title: 'Home Loan',
    subtitle: 'Make your dream home a reality',
    amount: '₹ 2,00,00,000',
    rate: 'From 8.5% to 10.50% p.a.',
    processing: 'Up to 0.5% + GST',
    tenure: 'Up to 360 months'
  }
};

const PersonalLoanDetailsPage = () => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const navigation = useNavigation();
  const route = useRoute();

  const loanType = route.params?.loanType || 'Personal Loan';
  const details = LOAN_DETAILS[loanType] || LOAN_DETAILS['Personal Loan'];

  const [isReadMore, setIsReadMore] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [formState, setFormState] = useState('idle'); // 'idle' | 'success'
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({ name: '', phone: '' });

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const toggleReadMore = () => {
    setIsReadMore(!isReadMore);
  };

  const handleApplyClick = () => {
    setModalVisible(true);
    setFormState('idle');
    setName('');
    setPhone('');
    setErrors({ name: '', phone: '' });
  };

  const validate = () => {
    let valid = true;
    let newErrors = { name: '', phone: '' };

    if (!name.trim()) {
      newErrors.name = 'Full Name is required';
      valid = false;
    }
    if (!phone.trim()) {
      newErrors.phone = 'Mobile Number is required';
      valid = false;
    } else if (phone.trim().length !== 10) {
      newErrors.phone = 'Mobile Number must be 10 digits';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = () => {
    if (validate()) {
      // Show success state with simple fade in
      setFormState('success');
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleGoHome = () => {
    setModalVisible(false);
    setFormState('idle');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Standard Brand Header */}
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

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.title}>{details.title}</Text>
          <Text style={styles.subtitle}>{details.subtitle}</Text>

          <Text style={styles.upToText}>UP TO</Text>
          <Text style={styles.amountText}>{details.amount}</Text>
        </View>

        {/* Loan Information Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.success} />
            </View>
            <View>
              <Text style={styles.infoLabel}>Processing fee</Text>
              <Text style={styles.infoValue}>{details.processing}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="time-outline" size={20} color={colors.success} />
            </View>
            <View>
              <Text style={styles.infoLabel}>Tenure</Text>
              <Text style={styles.infoValue}>{details.tenure}</Text>
            </View>
          </View>

          <View style={[styles.infoCard, { borderBottomWidth: 0 }]}>
            <View style={styles.iconCircle}>
              <Ionicons name="pricetag-outline" size={20} color={colors.success} />
            </View>
            <View>
              <Text style={styles.infoLabel}>Interest Rates</Text>
              <Text style={styles.infoValue}>{details.rate}</Text>
            </View>
          </View>
        </View>

        {/* Eligibility Criteria */}
        <View style={styles.eligibilitySection}>
          <Text style={styles.sectionTitle}>Eligibility criteria</Text>
          <View style={styles.eligibilityCard}>



            {isReadMore && (
              <View style={styles.expandedCriteria}>
                <View style={styles.criteriaItem}>
                  <View style={styles.dot} />
                  <Text style={styles.criteriaText}>Indian Citizen</Text>
                </View>
                <View style={styles.criteriaItem}>
                  <View style={styles.dot} />
                  <Text style={styles.criteriaText}>Possess Government approved Valid Identity Proof & Address Proof and Aadhaar-linked mobile number</Text>
                </View>
                <View style={styles.criteriaItem}>
                  <View style={styles.dot} />
                  <Text style={styles.criteriaText}>Age to be 21 years and above</Text>
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.readMoreBtn} onPress={toggleReadMore}>
              <Text style={styles.readMoreText}>
                {isReadMore ? 'Hide application requirements' : 'View complete application requirements'}
              </Text>
              <Ionicons
                name={isReadMore ? "chevron-up" : "chevron-down"}
                size={14}
                color={colors.success}
              />
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Apply Now Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.applyBtn} onPress={handleApplyClick} activeOpacity={0.8}>
          <Text style={styles.applyBtnText}>Apply Now</Text>
        </TouchableOpacity>
      </View>

      {/* Lead Form Modal */}
      {modalVisible && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 999, elevation: 999 }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <BlurView
              intensity={isDark ? 40 : 20}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.modalContent}>
              {formState === 'idle' ? (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Apply For {details.title}</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <Ionicons name="close" size={24} color={colors.foreground} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>Full Name</Text>
                    <TextInput
                      style={[styles.input, errors.name && styles.inputError]}
                      placeholder="Enter your full name"
                      placeholderTextColor={colors.mutedForeground}
                      value={name}
                      onChangeText={setName}
                    />
                    {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>Mobile Number</Text>
                    <TextInput
                      style={[styles.input, errors.phone && styles.inputError]}
                      placeholder="Enter 10-digit mobile number"
                      placeholderTextColor={colors.mutedForeground}
                      keyboardType="number-pad"
                      maxLength={10}
                      value={phone}
                      onChangeText={setPhone}
                    />
                    {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
                  </View>

                  <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                    <Text style={styles.submitBtnText}>Submit</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Animated.View style={[styles.successContainer, { opacity: fadeAnim }]}>
                  <Ionicons name="checkmark-circle" size={80} color={colors.success} style={{ marginBottom: 20 }} />
                  <Text style={styles.successTitle}>Application Received!</Text>
                  <Text style={styles.successMessage}>
                    Hidel Finance will send you response in 24/7 regarding your loan application.
                  </Text>
                  <TouchableOpacity style={styles.homeBtn} onPress={handleGoHome}>
                    <Text style={styles.homeBtnText}>Go to Homepage</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
    </SafeAreaView>
  );
};

const getStyles = (colors, isDark) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Standard Header Styles
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
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 180, // Space for sticky button + tab bar
  },
  heroSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginBottom: 24,
  },
  upToText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.foregroundSecondary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  amountText: {
    fontSize: 42,
    fontWeight: '600',
    color: colors.foreground,
    letterSpacing: -1,
  },
  infoGrid: {
    marginBottom: 32,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.mutedForeground,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
  },
  eligibilitySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 16,
  },
  eligibilityCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  criteriaItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginTop: 6,
    marginRight: 12,
  },
  criteriaText: {
    flex: 1,
    fontSize: 14,
    color: colors.foreground,
    lineHeight: 20,
  },
  expandedCriteria: {
    marginTop: 0,
  },
  readMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
    marginRight: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 88 : 74,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  applyBtn: {
    backgroundColor: colors.success,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    color: colors.successForeground,
    fontSize: 16,
    fontWeight: '700',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)', // reduced opacity since blur takes over
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.foreground,
  },
  formGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 16,
    color: colors.foreground,
    fontSize: 16,
  },
  inputError: {
    borderColor: colors.destructive,
  },
  errorText: {
    color: colors.destructive,
    fontSize: 12,
    marginTop: 4,
  },
  submitBtn: {
    backgroundColor: colors.success,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  submitBtnText: {
    color: colors.successForeground,
    fontSize: 16,
    fontWeight: '700',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 15,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  homeBtn: {
    backgroundColor: colors.success,
    width: '100%',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeBtnText: {
    color: colors.successForeground,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default PersonalLoanDetailsPage;
