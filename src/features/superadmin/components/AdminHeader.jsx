import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import adminColors from '../theme/adminColors';

const PAGE_TITLES = {
  dashboard:    { title: 'Dashboard', sub: 'Wednesday, Jun 3 · Q2 FY26 · positions reconciled at 12:45 PM IST' },
  users:        { title: 'User Management', sub: '1,84,209 borrowers · 1,34,431 active · 73% with verified KYC tier-2' },
  loan:         { title: 'Loan Management', sub: 'Master loan listing · dashboards, filtering, CRUD & transaction details' },
  revenue:      { title: 'Revenue', sub: 'Track revenue, disbursement income, collections, and lending performance' },
  collections:  { title: 'Collections', sub: '₹3,365 Cr at-risk across 6,998 delinquent accounts · NPL ratio 2.14%' },
  config:       { title: 'Platform Configuration', sub: 'Underwriting policy v7.3.1 · last published by Aanya K. on Jun 1' },
};

/**
 * AdminHeader — top bar with page title, search, notifications, and actions.
 *
 * Props:
 *   activeTab    — current page key
 *   onSearch     — (text) => void
 *   searchQuery  — controlled search value
 */
const AdminHeader = ({ activeTab, onSearch, searchQuery = '', onToggleSidebar }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const page = PAGE_TITLES[activeTab] || PAGE_TITLES.dashboard;

  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {!isDesktop && (
          <TouchableOpacity onPress={onToggleSidebar} style={styles.menuBtn} activeOpacity={0.75}>
            <Ionicons name="menu-outline" size={24} color={adminColors.fg} />
          </TouchableOpacity>
        )}
        {/* Left: title block */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{page.title}</Text>
          <Text style={styles.sub} numberOfLines={1}>{page.sub}</Text>
        </View>
      </View>

      {/* Right: search + actions */}
      <View style={styles.actions}>
        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={14} color={adminColors.fgMuted} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={onSearch}
            placeholder="Search..."
            placeholderTextColor={adminColors.fgMuted}
          />
        </View>

        {/* Notification bell */}
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.75}>
          <Ionicons name="notifications-outline" size={18} color={adminColors.fgSub} />
          <View style={styles.notifDot} />
        </TouchableOpacity>

        {/* Refresh */}
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.75}>
          <Ionicons name="refresh-outline" size={18} color={adminColors.fgSub} />
        </TouchableOpacity>

        {/* Export */}
        <TouchableOpacity style={styles.exportBtn} activeOpacity={0.8}>
          <Ionicons name="download-outline" size={14} color={adminColors.accent} />
          <Text style={styles.exportText}>Export</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: adminColors.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    backgroundColor: adminColors.bg,
    borderBottomWidth: 1,
    borderBottomColor: adminColors.border,
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  menuBtn: {
    marginRight: 16,
    padding: 4,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: adminColors.fg,
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: 11,
    color: adminColors.fgMuted,
    fontWeight: '500',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: adminColors.card,
    borderWidth: 1,
    borderColor: adminColors.border,
    borderRadius: adminColors.r8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 200,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: adminColors.fg,
    fontWeight: '500',
    outlineStyle: 'none',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: adminColors.r8,
    backgroundColor: adminColors.card,
    borderWidth: 1,
    borderColor: adminColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: adminColors.danger,
    borderWidth: 1.5,
    borderColor: adminColors.bg,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: adminColors.accentDim,
    borderWidth: 1,
    borderColor: adminColors.accentBorder,
    borderRadius: adminColors.r8,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  exportText: {
    fontSize: 12,
    fontWeight: '700',
    color: adminColors.accent,
  },
});

export default AdminHeader;
