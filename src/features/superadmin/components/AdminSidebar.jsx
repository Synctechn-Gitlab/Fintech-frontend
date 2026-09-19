import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../../services/authService';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'stats-chart-outline', iconActive: 'stats-chart' },
  { key: 'users', label: 'Customers', icon: 'people-outline', iconActive: 'people' },
  { key: 'loan', label: 'Loans', icon: 'layers-outline', iconActive: 'layers' },
  { key: 'revenue', label: 'Revenue', icon: 'wallet-outline', iconActive: 'wallet' },
  { key: 'collections', label: 'Collections', icon: 'cash-outline', iconActive: 'cash', badge: 3 },
  { key: 'config', label: 'Settings', icon: 'settings-outline', iconActive: 'settings' },
];

const DIVIDER_AFTER = ['dashboard'];

const sidebarColors = {
  bg: '#0a0d14',                        // Dark fintech slate/navy background
  border: 'rgba(255,255,255,0.06)',
  textActive: '#ffffff',                // White active text
  textMuted: '#94a3b8',                 // Muted slate-400 text
  itemHover: 'rgba(255,255,255,0.06)', // Very subtle hover overlay
  accent: '#1d4ed8',                    // Royal blue active background
  accentDim: 'rgba(29, 78, 216, 0.12)', // Active dim
  logoBg: '#1d4ed8',                    // Logo background
  card: '#111625',                      // Footer profile block background
};

/**
 * AdminSidebar — compact hover-expandable navigation panel.
 *
 * Props:
 *   activeTab      — current page key
 *   onNavigate     — (key) => void
 *   isExpanded     — expanded state for labels & full layouts
 *   onToggleExpand — () => void toggle function for expand button
 */
const AdminSidebar = ({ activeTab, onNavigate, isExpanded = true, onToggleExpand }) => {
  const [hoveredIndex, setHoveredIndex] = React.useState(null);

  const getTooltipTop = (index) => {
    let y = 72 + 16;
    for (let i = 0; i < index; i++) {
      y += 40 + 4;
      if (DIVIDER_AFTER.includes(NAV_ITEMS[i].key)) {
        y += 21;
      }
    }
    return y + 2;
  };

  return (
    <View style={styles.sidebar}>
      {/* Brand / Logo */}
      <View style={[styles.brand, !isExpanded && { justifyContent: 'center', paddingHorizontal: 0 }]}>
        <View style={styles.brandIcon}>
          <Text style={styles.brandLetter}>H</Text>
        </View>
        {isExpanded && (
          <View style={styles.brandTextContainer}>
            <Text style={styles.brandName}>Hidel Finance</Text>
            <Text style={styles.brandRole}>Super Admin</Text>
          </View>
        )}
        {onToggleExpand && (
          <TouchableOpacity
            style={[styles.toggleBtn, !isExpanded && styles.toggleBtnCentered]}
            onPress={onToggleExpand}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isExpanded ? 'chevron-back' : 'chevron-forward'}
              size={14}
              color="#94a3b8"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Nav */}
      <ScrollView style={styles.nav} showsVerticalScrollIndicator={false} contentContainerStyle={!isExpanded && { alignItems: 'center' }}>
        {isExpanded && <Text style={styles.navSection}>COMMAND CENTER</Text>}
        {NAV_ITEMS.map((item, index) => {
          const isActive = activeTab === item.key;
          return (
            <React.Fragment key={item.key}>
              <Pressable
                style={({ hovered }) => [
                  styles.navItem,
                  isActive ? styles.navItemActive : (hovered ? styles.navItemHover : styles.navItemInactive),
                  isExpanded ? { paddingHorizontal: 12, width: '100%' } : { justifyContent: 'center', width: 44, alignSelf: 'center' },
                ]}
                onPress={() => onNavigate(item.key)}
                onHoverIn={() => setHoveredIndex(index)}
                onHoverOut={() => setHoveredIndex(null)}
              >
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={isActive ? item.iconActive : item.icon}
                    size={18}
                    color={isActive ? sidebarColors.textActive : sidebarColors.textMuted}
                  />
                  {/* Collapsed tiny dot badge */}
                  {!isExpanded && item.badge ? (
                    <View style={styles.dotBadge} />
                  ) : null}
                </View>

                {isExpanded && (
                  <>
                    <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                      {item.label}
                    </Text>
                    {item.badge ? (
                      <View style={[styles.badge, isActive && styles.badgeActive]}>
                        <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
                          {item.badge}
                        </Text>
                      </View>
                    ) : null}
                  </>
                )}
              </Pressable>

              {isExpanded && DIVIDER_AFTER.includes(item.key) && (
                <View style={styles.divider} />
              )}
            </React.Fragment>
          );
        })}
      </ScrollView>

      {/* Floating Tooltip outside ScrollView to prevent clipping */}
      {!isExpanded && hoveredIndex !== null && NAV_ITEMS[hoveredIndex] && (
        <View
          style={[
            styles.floatingTooltip,
            { top: getTooltipTop(hoveredIndex) },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.tooltipText}>{NAV_ITEMS[hoveredIndex].label}</Text>
        </View>
      )}

      {/* Footer */}
      <View style={[styles.footer, !isExpanded && { paddingHorizontal: 0 }]}>
        {isExpanded ? (
          <>
            <View style={styles.footerDivider} />
            <View style={styles.adminProfile}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>AK</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.adminName}>Aanya K.</Text>
                <Text style={styles.brandRole}>Super Admin</Text>
              </View>
              <TouchableOpacity onPress={() => authService.logout()} activeOpacity={0.7} style={styles.logoutBtn}>
                <Ionicons name="log-out-outline" size={16} color={sidebarColors.textMuted} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.collapsedFooter}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AK</Text>
            </View>
            <TouchableOpacity onPress={() => authService.logout()} activeOpacity={0.7} style={styles.logoutBtnCollapsed}>
              <Ionicons name="log-out-outline" size={16} color={sidebarColors.textMuted} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: sidebarColors.bg,
    borderRightWidth: 1,
    borderRightColor: sidebarColors.border,
    flexDirection: 'column',
    height: '100%',
    overflow: 'visible',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: sidebarColors.border,
    height: 72,
    position: 'relative',
    overflow: 'visible',
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: sidebarColors.logoBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLetter: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  brandTextContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  toggleBtn: {
    position: 'absolute',
    right: -12,
    top: 24,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 8,
  },
  toggleBtnCentered: {
    position: 'absolute',
    right: -12,
    top: 24,
  },
  floatingTooltip: {
    position: 'absolute',
    left: 82,
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 20,
    zIndex: 99999,
    minWidth: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  brandName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  brandRole: {
    fontSize: 10,
    color: sidebarColors.accent,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  nav: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 12,
    overflow: 'visible',
  },
  navSection: {
    fontSize: 9,
    fontWeight: '700',
    color: sidebarColors.textMuted,
    letterSpacing: 1.2,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 8,
    marginBottom: 4,
    overflow: 'visible',
    alignSelf: 'stretch',
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: sidebarColors.accent,
  },
  navItemInactive: {
    backgroundColor: 'transparent',
  },
  navItemHover: {
    backgroundColor: sidebarColors.itemHover,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dotBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: '#ef4444', // Red indicator dot
  },
  navLabel: {
    marginLeft: 12,
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: sidebarColors.textMuted,
  },
  navLabelActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 99,
  },
  badgeActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: sidebarColors.textMuted,
  },
  badgeTextActive: {
    color: '#ffffff',
  },
  divider: {
    height: 1,
    backgroundColor: sidebarColors.border,
    marginVertical: 10,
    marginHorizontal: 8,
  },
  footer: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  footerDivider: {
    height: 1,
    backgroundColor: sidebarColors.border,
    marginBottom: 12,
  },
  adminProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: sidebarColors.card,
    borderWidth: 1,
    borderColor: sidebarColors.border,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: sidebarColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  adminName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  logoutBtn: {
    padding: 4,
  },
  collapsedFooter: {
    alignItems: 'center',
    gap: 12,
  },
  logoutBtnCollapsed: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: sidebarColors.card,
    borderWidth: 1,
    borderColor: sidebarColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AdminSidebar;
