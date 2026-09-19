import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../../services/authService';
import colors from '../../../theme/colors';
import { useToast } from '../../../context/ToastContext';

const VerifyEmailPage = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
  const { showSuccessToast, showErrorToast } = useToast();

  const email = route.params?.email;

  useEffect(() => {
    if (!email) {
      showErrorToast('Error', 'Missing email address. Please sign up again.');
      navigation.navigate('Login');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigation]);

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      showErrorToast('Error', 'Please enter a valid 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyEmail(email, otp);
      navigation.navigate('Login', { successMessage: response?.message || 'Email verified successfully! You can now log in.' });
    } catch (error) {
      showErrorToast('Verification Failed', error.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendVerificationOtp(email);
      setCountdown(600); // Reset countdown
      showSuccessToast('Success', 'A new verification OTP has been sent to your email.');
    } catch (error) {
      showErrorToast('Resend Failed', error.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Ionicons name="mail-unread-outline" size={64} color={colors.primary} style={{ marginBottom: 16 }} />
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.text}>
            We sent a 6-digit verification code to <Text style={{ fontWeight: 'bold' }}>{email}</Text>. Please enter it below.
          </Text>

          <TextInput
            style={styles.input}
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="••••••"
            placeholderTextColor="#9CA3AF"
            textAlign="center"
          />

          <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>Verify Email</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            {countdown > 0 ? (
              <Text style={styles.countdownText}>OTP expires in {formatTime(countdown)}</Text>
            ) : (
              <Text style={styles.countdownText}>OTP has expired.</Text>
            )}

            <TouchableOpacity style={styles.resendButton} onPress={handleResend} disabled={resending}>
              {resending ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <Text style={styles.resendButtonText}>Resend OTP</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  text: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  input: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingVertical: 16,
    fontSize: 28,
    letterSpacing: 8,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.success,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 16,
  },
  resendContainer: {
    alignItems: 'center',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 20,
    marginBottom: 10,
  },
  countdownText: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 12,
  },
  resendButton: {
    padding: 8,
  },
  resendButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 15,
  },
  backButton: {
    marginTop: 10,
    padding: 8,
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 14,
    textDecorationLine: 'underline',
  }
});

export default VerifyEmailPage;
