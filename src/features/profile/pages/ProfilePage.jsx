import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, Modal,
  StyleSheet, SafeAreaView, Switch, Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { authStore } from '../../../store/authStore';
import { useTheme } from '../../../theme/useTheme';
import { authService } from '../../../services/authService';

const ProfilePage = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const [auth, setAuth] = useState(authStore.getState());
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  useEffect(() => {
    const u1 = authStore.subscribe(setAuth);
    authService.getProfile().catch(e => console.log('Profile API unavailable:', e.message));
    return () => { u1(); };
  }, []);

  useEffect(() => {
    if (auth.user && !isEditingProfile && editName === '') {
      setEditName(auth.user.name);
      setEditEmail(auth.user.email);
    }
  }, [auth.user, isEditingProfile]);

  const user = auth.user || authStore.getState().user || {
    name: 'Alex Chen',
    email: 'alex.chen@example.com',
    creditScore: 780,
  };

  // Initialize if not set
  const displayName = editName || user.name;
  const displayEmail = editEmail || user.email;

  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'US';

  // Dummy states for the UI toggles
  const [faceId, setFaceId] = useState(true);
  const [twoFactor, setTwoFactor] = useState(true);
  const [appLock, setAppLock] = useState(false);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsMessages, setSmsMessages] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Edit Profile Modal ────────────────────────────────────────────── */}
      <Modal visible={isEditingProfile} animationType="fade" transparent={true} onRequestClose={() => setIsEditingProfile(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => {
                // Revert changes on cancel
                setEditName(user.name);
                setEditEmail(user.email);
                setIsEditingProfile(false);
              }}>
                <Text style={styles.modalCancelBtn}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={async () => {
                try {
                  await authService.updateProfile({ name: editName, email: editEmail });
                  setIsEditingProfile(false);
                } catch (e) {
                  console.error('Failed to update profile:', e);
                  setIsEditingProfile(false);
                }
              }}>
                <Text style={styles.modalSaveBtn}>Save</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.modalAvatarWrap}>
                <View style={styles.modalAvatar}>
                  <Text style={styles.modalAvatarText}>{initials}</Text>
                </View>
              </View>

              <View style={styles.modalForm}>
                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalLabel}>Name</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={editName}
                    onChangeText={setEditName}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalLabel}>Email</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={editEmail}
                    onChangeText={setEditEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Custom Header ────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('Home')} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity style={styles.profileBtnActive} activeOpacity={0.8}>
          <Ionicons name="person-circle-outline" size={32} color={colors.foreground} />
          <View style={styles.onlineDotHeader} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Account Section ────────────────────────────────────────────── */}
        <Text style={styles.sectionHeader}>Account</Text>
        <View style={styles.card}>
          <View style={styles.accountHeaderRow}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.onlineDot} />
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.userName}>{displayName}</Text>
              <Text style={styles.userEmail}>{displayEmail}</Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => setIsEditingProfile(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {/* Loan Limit & Eligibility Vibrant Card */}
          <View style={[styles.loanLimitCard, { overflow: 'hidden' }]}>
            <View style={styles.loanLimitHeader}>
              <Text style={styles.loanLimitTitle}>Loan Limit & Eligibility</Text>
              <Ionicons name="information-circle-outline" size={18} color={colors.successForeground} />
            </View>

            {/* Credit score indicator */}
            <View style={styles.creditScoreRow}>
              <View style={styles.creditScoreTextWrap}>
                <Text style={styles.creditScoreText}>{user.creditScore || 780} Credit Score</Text>
                <Text style={styles.creditScoreSub}>Elite Status</Text>
              </View>
              <Ionicons name="shield-checkmark" size={24} color={colors.successForeground} />
            </View>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '85%' }]} />
            </View>

            <View style={styles.loanLimitFooter}>
              <View>
                <Text style={styles.loanLimitMaxLabel}>Max Loan</Text>
                <Text style={styles.loanLimitMaxValue}>₹50,000</Text>
              </View>
              <TouchableOpacity style={styles.viewDetailsBtn}>
                <Text style={styles.viewDetailsText}>View Details</Text>
              </TouchableOpacity>
            </View>

            <BlurView intensity={25} tint="light" style={styles.comingSoonOverlay}>
              <View style={styles.comingSoonBadge}>
                <Ionicons name="time-outline" size={16} color="#111827" />
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
            </BlurView>
          </View>
        </View>

        {/* ── Security & Privacy Section ─────────────────────────────────── */}
        <Text style={styles.sectionHeader}>Security & Privacy</Text>
        <View style={[styles.card, { overflow: 'hidden' }]}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Ionicons name="scan-outline" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.rowLabel}>Face ID Login</Text>
            </View>
            <Switch
              value={faceId}
              onValueChange={setFaceId}
              trackColor={{ false: colors.mutedAlt, true: colors.success }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(168, 85, 247, 0.1)' }]}>
                <Ionicons name="shield-half-outline" size={20} color="#A855F7" />
              </View>
              <Text style={styles.rowLabel}>Two-Factor Authentication</Text>
            </View>
            <Switch
              value={twoFactor}
              onValueChange={setTwoFactor}
              trackColor={{ false: colors.mutedAlt, true: colors.success }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <Ionicons name="lock-closed-outline" size={20} color="#EF4444" />
              </View>
              <Text style={styles.rowLabel}>App Lock</Text>
            </View>
            <Switch
              value={appLock}
              onValueChange={setAppLock}
              trackColor={{ false: colors.mutedAlt, true: colors.success }}
              thumbColor="#FFFFFF"
            />
          </View>

          <BlurView intensity={25} tint="light" style={styles.comingSoonOverlay}>
            <View style={styles.comingSoonBadge}>
              <Ionicons name="time-outline" size={16} color="#111827" />
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
          </BlurView>
        </View>

        {/* ── Payment Methods Section ────────────────────────────────────── */}
        <Text style={styles.sectionHeader}>Payment Methods</Text>
        <View style={[styles.card, { overflow: 'hidden' }]}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(144, 238, 144, 0.1)' }]}>
                <Ionicons name="business-outline" size={20} color="#36e436ff" />
              </View>
              <View>
                <Text style={styles.rowLabel}>Linked Bank Account</Text>
                <Text style={styles.rowSub}>Ending 1234</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.manageBtn}>
              <Text style={styles.manageBtnText}>Manage</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} activeOpacity={0.7}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <Ionicons name="card-outline" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.rowLabel}>Credit Cards</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>

          <BlurView intensity={25} tint="light" style={styles.comingSoonOverlay}>
            <View style={styles.comingSoonBadge}>
              <Ionicons name="time-outline" size={16} color="#111827" />
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
          </BlurView>
        </View>

        {/* ── Communication Section ──────────────────────────────────────── */}
        <Text style={styles.sectionHeader}>Communication</Text>
        <View style={[styles.card, { overflow: 'hidden' }]}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(236, 72, 153, 0.1)' }]}>
                <Ionicons name="notifications-outline" size={20} color="#EC4899" />
              </View>
              <Text style={styles.rowLabel}>Push Notifications</Text>
            </View>
            <Switch
              value={pushNotifs}
              onValueChange={setPushNotifs}
              trackColor={{ false: colors.mutedAlt, true: colors.success }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                <Ionicons name="mail-outline" size={20} color="#6366F1" />
              </View>
              <Text style={styles.rowLabel}>Email Alerts</Text>
            </View>
            <Switch
              value={emailAlerts}
              onValueChange={setEmailAlerts}
              trackColor={{ false: colors.mutedAlt, true: colors.success }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
                <Ionicons name="chatbubble-outline" size={20} color="#F97316" />
              </View>
              <Text style={styles.rowLabel}>SMS Messages</Text>
            </View>
            <Switch
              value={smsMessages}
              onValueChange={setSmsMessages}
              trackColor={{ false: colors.mutedAlt, true: colors.success }}
              thumbColor="#FFFFFF"
            />
          </View>

          <BlurView intensity={25} tint="light" style={styles.comingSoonOverlay}>
            <View style={styles.comingSoonBadge}>
              <Ionicons name="time-outline" size={16} color="#111827" />
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
          </BlurView>
        </View>

        {/* ── Sign Out ─────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={() => authService.logout()}
          activeOpacity={0.85}
        >
          <Text style={styles.signOutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#c6c6c6cd' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  profileBtnActive: {
    position: 'relative',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDotHeader: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.limeBtn || '#A3E635',
    borderWidth: 2,
    borderColor: '#F4F5F9',
  },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 110 },

  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 20,
    marginLeft: 4,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },

  // Account section
  accountHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrap: { position: 'relative', marginRight: 16 },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: colors.limeBtn || '#A3E635',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '600', color: '#111827' },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 2,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: colors.limeBtn || '#A3E635',
    borderWidth: 2.5, borderColor: '#FFFFFF',
  },
  accountInfo: { flex: 1, paddingRight: 10 },
  userName: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 2 },
  userEmail: { fontSize: 13, color: '#6B7280' },
  editBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.mutedAlt, alignItems: 'center', justifyContent: 'center' },

  // Edit Profile Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)', backgroundColor: '#FFFFFF' },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  modalCancelBtn: { fontSize: 16, color: '#6B7280' },
  modalSaveBtn: { fontSize: 16, fontWeight: '700', color: '#36e436ff' },
  modalBody: { padding: 20, backgroundColor: '#FFFFFF' },
  modalAvatarWrap: { alignItems: 'center', marginBottom: 24 },
  modalAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.limeBtn || '#A3E635', alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  modalAvatarText: { fontSize: 32, fontWeight: '700', color: '#111827' },
  modalForm: { gap: 16 },
  modalInputGroup: { gap: 8 },
  modalLabel: { fontSize: 12, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 4 },
  modalInput: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', borderRadius: 12, padding: 14, fontSize: 15, color: '#111827', elevation: 0 },

  // Neon Loan Limit Card
  loanLimitCard: {
    backgroundColor: colors.limeBtn || '#A3E635',
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  loanLimitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  loanLimitTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  creditScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  creditScoreTextWrap: { flex: 1 },
  creditScoreText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  creditScoreSub: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '600',
    opacity: 0.8,
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(17, 24, 39, 0.1)',
    borderRadius: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#111827',
    borderRadius: 4,
  },
  loanLimitFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  loanLimitMaxLabel: { fontSize: 11, color: '#3F6212', fontWeight: '500', marginBottom: 2 },
  loanLimitMaxValue: { fontSize: 20, fontWeight: '700', color: '#1A2E05', letterSpacing: -0.5 },
  viewDetailsBtn: { backgroundColor: '#1A2E05', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  viewDetailsText: { color: '#A3E635', fontSize: 12, fontWeight: '700' },

  comingSoonOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  comingSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  comingSoonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },

  // General rows
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40, height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  rowSub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  manageBtn: {
    backgroundColor: '#F4F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  manageBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },

  // Sign out
  signOutBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 100,
    padding: 16,
    marginTop: 32,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});

export default ProfilePage;
