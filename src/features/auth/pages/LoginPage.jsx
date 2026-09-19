import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  useWindowDimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useNavigation, useRoute } from '@react-navigation/native';
import { authStore } from '../../../store/authStore';
import { useTheme } from '../../../theme/useTheme';
import { authService } from '../../../services/authService';
import NovaLogo from '../../../components/NovaLogo';
import TopRightToast from '../../../components/TopRightToast';

const DEMO_USERS = [
  {
    email: 'aarav.shah@example.com',
    password: 'password123',
    name: 'Aarav Shah',
    role: 'Client',
  },
  {
    email: 'superadmin@hidelfinance.com',
    password: 'superadmin123',
    name: 'Super Admin',
    role: 'Superadmin',
  },
];

const SECURITY_ITEMS = [
  { icon: 'shield-checkmark-outline', text: '256-bit SSL Encryption' },
  { icon: 'finger-print-outline', text: 'Biometric Ready' },
  { icon: 'lock-closed-outline', text: 'Encrypted DB' },
];

const LoginPage = () => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const navigation = useNavigation();
  const route = useRoute();

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (route.params?.successMessage) {
      setToastMessage(route.params.successMessage);
      setToastVisible(true);
      navigation.setParams({ successMessage: undefined });
    }
  }, [route.params]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Forgot password & Signup flow states
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot' | 'reset'
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Signup specific states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const loginEmailRef = useRef(null);
  const loginPasswordRef = useRef(null);
  const signupNameRef = useRef(null);
  const signupEmailRef = useRef(null);
  const signupPhoneRef = useRef(null);
  const signupPasswordRef = useRef(null);
  const forgotEmailRef = useRef(null);
  const resetOtpRef = useRef(null);
  const resetPasswordRef = useRef(null);

  const logNativeFocus = (context) => {
    console.log(`[NATIVE FOCUS STATE] (${context})`, {
      login_email: loginEmailRef.current?.isFocused?.() || false,
      login_password: loginPasswordRef.current?.isFocused?.() || false,
      signup_name: signupNameRef.current?.isFocused?.() || false,
      signup_email: signupEmailRef.current?.isFocused?.() || false,
      signup_phone: signupPhoneRef.current?.isFocused?.() || false,
      signup_password: signupPasswordRef.current?.isFocused?.() || false,
      forgot_email: forgotEmailRef.current?.isFocused?.() || false,
      reset_otp: resetOtpRef.current?.isFocused?.() || false,
      reset_password: resetPasswordRef.current?.isFocused?.() || false,
    });
  };

  useEffect(() => {
    console.log(`[MOUNT] LoginPage (mode: ${mode})`);
    return () => console.log(`[UNMOUNT] LoginPage (mode: ${mode})`);
  }, [mode]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await authService.login(email, password);
    } catch (error) {
      const demoUser = DEMO_USERS.find(
        (item) =>
          item.email.toLowerCase() === email.trim().toLowerCase() &&
          item.password === password
      );

      if (!demoUser) {
        Alert.alert('Login failed', 'Incorrect email or password.');
        setLoading(false);
        return;
      }

      console.log('Login API error, using local demo credentials:', error.message);
      const mappedUser = {
        id: demoUser.email === 'superadmin@hidelfinance.com' ? 'super-admin' : 'user-aarav',
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.email === 'superadmin@hidelfinance.com' ? 'superadmin' : 'user',
      };

      authStore.setUser(mappedUser);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await authService.signup(name, email, phone, password);
      // Validate that it actually succeeded according to our expected schema if any
      if (response && response.success === false) {
        throw new Error(response.message || 'Registration failed');
      }
      
      // Navigate to verification screen. Do NOT switch mode yet, 
      // otherwise it unmounts the current screen context instantly on Android.
      // Use replace so they don't accidentally go back to the signup form in a bad state.
      navigation.replace('VerifyEmail', { email: email.trim().toLowerCase() });
    } catch (error) {
      Alert.alert('Signup Failed', error.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email or Customer ID');
      return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      Alert.alert('Success', 'An OTP has been sent to your registered email and mobile number. (Check your backend terminal logs to see the generated code).');
      setMode('reset');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(email, otp, newPassword);
      setToastMessage('Your password has been successfully reset. You can now login.');
      setToastVisible(true);
      setPassword(newPassword);
      setMode('login');
      setOtp('');
      setNewPassword('');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopRightToast 
        visible={toastVisible} 
        message={toastMessage} 
        onHide={() => setToastVisible(false)} 
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.shell}>
            <View style={styles.formCard}>

              <View style={styles.logoArea}>
                <NovaLogo size={80} layout="column" subtitle={null} titleColor="#111827" />
              </View>

              <Text style={styles.heading}>
                {mode === 'login' ? 'Welcome Back' :
                  mode === 'signup' ? 'Create Account' :
                    mode === 'forgot' ? 'Reset Password' : 'Set New Password'}
              </Text>

              <Text style={styles.subheading}>
                {mode === 'login' ? 'Sign in to access your secure dashboard.' :
                  mode === 'signup' ? 'Join to manage your finances securely.' :
                    mode === 'forgot' ? 'Enter your email to receive a reset code.' : 'Enter the code sent to your email.'}
              </Text>

              {/* LOGIN MODE */}
              {mode === 'login' && (
                <>
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Email Address or Customer ID</Text>
                    <View style={[styles.inputWrapper, focusedField === 'login_email' && styles.inputWrapperFocused]}>
                      <Ionicons name="mail-outline" size={16} color={focusedField === 'login_email' ? colors.success : colors.mutedForeground} style={styles.inputIcon} />
                      <TextInput
                        ref={loginEmailRef}
                        key="login-email-input"
                        style={styles.input}
                        value={email}
                        onChangeText={(text) => {
                          console.log('[CHANGE] LOGIN_EMAIL', text);
                          setEmail(text);
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="off"
                        importantForAutofill="no"
                        autoCorrect={false}
                        placeholderTextColor={colors.mutedForeground}
                        onFocus={() => {
                          console.log('[FOCUS] LOGIN_EMAIL');
                          setFocusedField('login_email');
                          setTimeout(() => logNativeFocus('onFocus login_email'), 0);
                        }}
                        onBlur={() => {
                          console.log('[BLUR] LOGIN_EMAIL');
                          if (focusedField === 'login_email') setFocusedField(null);
                          setTimeout(() => logNativeFocus('onBlur login_email'), 0);
                        }}
                      />
                    </View>
                  </View>

                  <View style={styles.fieldGroup}>
                    <View style={styles.labelRow}>
                      <Text style={styles.label}>Security Password</Text>
                      <TouchableOpacity onPress={() => setMode('forgot')}>
                        <Text style={styles.forgotText}>Forgot?</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.inputWrapper, focusedField === 'login_password' && styles.inputWrapperFocused]}>
                      <Ionicons name="lock-closed-outline" size={16} color={focusedField === 'login_password' ? colors.success : colors.mutedForeground} style={styles.inputIcon} />
                      <TextInput
                        ref={loginPasswordRef}
                        key="login-password-input"
                        style={styles.input}
                        value={password}
                        onChangeText={(text) => {
                          console.log('[CHANGE] LOGIN_PASSWORD', text);
                          setPassword(text);
                        }}
                        secureTextEntry={!showPw}
                        autoComplete="off"
                        importantForAutofill="no"
                        autoCorrect={false}
                        placeholderTextColor={colors.mutedForeground}
                        onFocus={() => {
                          console.log('[FOCUS] LOGIN_PASSWORD');
                          setFocusedField('login_password');
                          setTimeout(() => logNativeFocus('onFocus login_password'), 0);
                        }}
                        onBlur={() => {
                          console.log('[BLUR] LOGIN_PASSWORD');
                          if (focusedField === 'login_password') setFocusedField(null);
                          setTimeout(() => logNativeFocus('onBlur login_password'), 0);
                        }}
                      />
                      <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPw((s) => !s)}>
                        <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={17} color={colors.mutedForeground} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.signInBtn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
                    {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.signInText}>Secure Sign In</Text>}
                  </TouchableOpacity>

                  <View style={styles.switchModeContainer}>
                    <Text style={styles.switchModeText}>New to Hidel? </Text>
                    <TouchableOpacity onPress={() => { setMode('signup'); setEmail(''); setPassword(''); }}>
                      <Text style={styles.switchModeAction}>Create an Account</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* SIGNUP MODE */}
              {mode === 'signup' && (
                <>
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <View style={[styles.inputWrapper, focusedField === 'signup_name' && styles.inputWrapperFocused]}>
                      <Ionicons name="person-outline" size={16} color={focusedField === 'signup_name' ? colors.success : colors.mutedForeground} style={styles.inputIcon} />
                      <TextInput
                        ref={signupNameRef}
                        key="signup-name-input"
                        style={styles.input}
                        value={name}
                        onChangeText={(text) => {
                          console.log('[CHANGE] NAME', text);
                          setName(text);
                        }}
                        autoComplete="off"
                        importantForAutofill="no"
                        placeholderTextColor={colors.mutedForeground}
                        onFocus={() => {
                          console.log('[FOCUS] NAME');
                          setFocusedField('signup_name');
                          setTimeout(() => logNativeFocus('onFocus signup_name'), 0);
                        }}
                        onBlur={() => {
                          console.log('[BLUR] NAME');
                          if (focusedField === 'signup_name') setFocusedField(null);
                          setTimeout(() => logNativeFocus('onBlur signup_name'), 0);
                        }}
                      />
                    </View>
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Email Address</Text>
                    <View style={[styles.inputWrapper, focusedField === 'signup_email' && styles.inputWrapperFocused]}>
                      <Ionicons name="mail-outline" size={16} color={focusedField === 'signup_email' ? colors.success : colors.mutedForeground} style={styles.inputIcon} />
                      <TextInput
                        ref={signupEmailRef}
                        key="signup-email-input"
                        style={styles.input}
                        value={email}
                        onChangeText={(text) => {
                          console.log('[CHANGE] EMAIL', text);
                          setEmail(text);
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="off"
                        importantForAutofill="no"
                        placeholderTextColor={colors.mutedForeground}
                        onFocus={() => {
                          console.log('[FOCUS] EMAIL');
                          setFocusedField('signup_email');
                          setTimeout(() => logNativeFocus('onFocus signup_email'), 0);
                        }}
                        onBlur={() => {
                          console.log('[BLUR] EMAIL');
                          if (focusedField === 'signup_email') setFocusedField(null);
                          setTimeout(() => logNativeFocus('onBlur signup_email'), 0);
                        }}
                      />
                    </View>
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Phone Number</Text>
                    <View style={[styles.inputWrapper, focusedField === 'signup_phone' && styles.inputWrapperFocused]}>
                      <Ionicons name="call-outline" size={16} color={focusedField === 'signup_phone' ? colors.success : colors.mutedForeground} style={styles.inputIcon} />
                      <TextInput
                        ref={signupPhoneRef}
                        key="signup-phone-input"
                        style={styles.input}
                        value={phone}
                        onChangeText={(text) => {
                          console.log('[CHANGE] PHONE', text);
                          setPhone(text);
                        }}
                        keyboardType="phone-pad"
                        autoComplete="off"
                        importantForAutofill="no"
                        placeholderTextColor={colors.mutedForeground}
                        onFocus={() => {
                          console.log('[FOCUS] PHONE');
                          setFocusedField('signup_phone');
                          setTimeout(() => logNativeFocus('onFocus signup_phone'), 0);
                        }}
                        onBlur={() => {
                          console.log('[BLUR] PHONE');
                          if (focusedField === 'signup_phone') setFocusedField(null);
                          setTimeout(() => logNativeFocus('onBlur signup_phone'), 0);
                        }}
                      />
                    </View>
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Password</Text>
                    <View style={[styles.inputWrapper, focusedField === 'signup_password' && styles.inputWrapperFocused]}>
                      <Ionicons name="lock-closed-outline" size={16} color={focusedField === 'signup_password' ? colors.success : colors.mutedForeground} style={styles.inputIcon} />
                      <TextInput
                        ref={signupPasswordRef}
                        key="signup-password-input"
                        style={styles.input}
                        value={password}
                        onChangeText={(text) => {
                          console.log('[CHANGE] PASSWORD', text);
                          setPassword(text);
                        }}
                        secureTextEntry={!showPw}
                        autoComplete="off"
                        importantForAutofill="no"
                        placeholderTextColor={colors.mutedForeground}
                        onFocus={() => {
                          console.log('[FOCUS] PASSWORD');
                          setFocusedField('signup_password');
                          setTimeout(() => logNativeFocus('onFocus signup_password'), 0);
                        }}
                        onBlur={() => {
                          console.log('[BLUR] PASSWORD');
                          if (focusedField === 'signup_password') setFocusedField(null);
                          setTimeout(() => logNativeFocus('onBlur signup_password'), 0);
                        }}
                      />
                      <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPw((s) => !s)}>
                        <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={17} color={colors.mutedForeground} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.signInBtn} onPress={handleSignup} disabled={loading} activeOpacity={0.85}>
                    {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.signInText}>Register Account</Text>}
                  </TouchableOpacity>

                  <View style={styles.switchModeContainer}>
                    <Text style={styles.switchModeText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => { setMode('login'); setEmail(''); setPassword(''); }}>
                      <Text style={styles.switchModeAction}>Sign In</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* FORGOT PASSWORD MODE */}
              {mode === 'forgot' && (
                <>
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Enter Email or Customer ID</Text>
                    <View style={[styles.inputWrapper, focusedField === 'forgot_email' && styles.inputWrapperFocused]}>
                      <Ionicons name="mail-outline" size={16} color={focusedField === 'forgot_email' ? colors.success : colors.mutedForeground} style={styles.inputIcon} />
                      <TextInput
                        ref={forgotEmailRef}
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        autoComplete="email"
                        textContentType="emailAddress"
                        placeholderTextColor={colors.mutedForeground}
                        onFocus={() => {
                          setFocusedField('forgot_email');
                          setTimeout(() => logNativeFocus('onFocus forgot_email'), 0);
                        }}
                        onBlur={() => { 
                          if (focusedField === 'forgot_email') setFocusedField(null);
                          setTimeout(() => logNativeFocus('onBlur forgot_email'), 0);
                        }}
                      />
                    </View>
                  </View>

                  <TouchableOpacity style={styles.signInBtn} onPress={handleForgotPassword} disabled={loading} activeOpacity={0.85}>
                    {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.signInText}>Send Reset Code</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setMode('login')} style={{ alignItems: 'center', marginTop: 10 }}>
                    <Text style={{ color: '#64748B', fontSize: 13, fontWeight: '600' }}>Back to Login</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* RESET PASSWORD MODE */}
              {mode === 'reset' && (
                <>
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Enter 6-Digit OTP</Text>
                    <View style={[styles.inputWrapper]}>
                      <Ionicons name="keypad-outline" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
                      <TextInput
                        ref={resetOtpRef}
                        style={styles.input}
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="numeric"
                        maxLength={6}
                        placeholder="e.g. 123456"
                        placeholderTextColor={colors.mutedForeground}
                        onFocus={() => {
                          setFocusedField('reset_otp');
                          setTimeout(() => logNativeFocus('onFocus reset_otp'), 0);
                        }}
                        onBlur={() => { 
                          if (focusedField === 'reset_otp') setFocusedField(null);
                          setTimeout(() => logNativeFocus('onBlur reset_otp'), 0);
                        }}
                      />
                    </View>
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>New Password</Text>
                    <View style={[styles.inputWrapper]}>
                      <Ionicons name="lock-closed-outline" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
                      <TextInput
                        ref={resetPasswordRef}
                        style={styles.input}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!showPw}
                        placeholderTextColor={colors.mutedForeground}
                        onFocus={() => {
                          setFocusedField('reset_password');
                          setTimeout(() => logNativeFocus('onFocus reset_password'), 0);
                        }}
                        onBlur={() => { 
                          if (focusedField === 'reset_password') setFocusedField(null);
                          setTimeout(() => logNativeFocus('onBlur reset_password'), 0);
                        }}
                      />
                      <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPw((s) => !s)}>
                        <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={17} color={colors.mutedForeground} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.signInBtn} onPress={handleResetPassword} disabled={loading} activeOpacity={0.85}>
                    {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.signInText}>Confirm New Password</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setMode('login')} style={{ alignItems: 'center', marginTop: 10 }}>
                    <Text style={{ color: '#64748B', fontSize: 13, fontWeight: '600' }}>Back to Login</Text>
                  </TouchableOpacity>
                </>
              )}


            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboard: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  shell: {
    width: '100%',
    alignSelf: 'center',
    maxWidth: 420, // Clean, centered column
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    gap: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 18,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  forgotText: {
    color: '#36e436ff',
    fontSize: 12,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
  },
  inputWrapperFocused: {
    borderColor: '#36e436ff',
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
    height: '100%',
    outlineStyle: 'none', // for web
  },
  eyeBtn: {
    padding: 4,
  },
  signInBtn: {
    backgroundColor: '#36e436ff',
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#36e436ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  signInText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  switchModeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16
  },
  switchModeText: {
    color: '#64748B',
    fontSize: 13
  },
  switchModeAction: {
    color: '#36e436ff',
    fontSize: 13,
    fontWeight: '700'
  },
  securityStrip: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default LoginPage;
