import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import adminColors from '../theme/adminColors';
import AdminLayout from '../components/AdminLayout';
import AdminMetricCard from '../components/AdminMetricCard';
import AdminTable from '../components/AdminTable';
import StatusBadge, { getStatusVariant } from '../components/StatusBadge';
import { collectionsStats, collectionsList } from '../data/mockData';

const FILTER_TABS = ['All', '1-29 DPD', '30+ DPD', '60+ DPD', 'NPA'];

const getDPDBucket = (dpd) => {
  if (dpd >= 90) return 'NPA';
  if (dpd >= 60) return '60+';
  if (dpd >= 30) return '30+';
  return '1-29';
};

const getDPDVariant = (dpd) => {
  if (dpd >= 90) return 'critical';
  if (dpd >= 60) return 'danger';
  if (dpd >= 30) return 'orange';
  return 'warning';
};

const COLUMNS = [
  {
    key: 'id',
    label: 'Case ID',
    width: 100,
    render: (val) => <Text style={colStyles.id}>{val}</Text>,
  },
  {
    key: 'borrower',
    label: 'Borrower',
    flex: 1,
    render: (val, row) => (
      <View>
        <Text style={colStyles.name}>{val}</Text>
        <Text style={colStyles.sub}>{row.account}</Text>
      </View>
    ),
  },
  {
    key: 'amount',
    label: 'Outstanding',
    width: 120,
    render: (val) => <Text style={colStyles.amount}>{val}</Text>,
  },
  {
    key: 'dpd',
    label: 'DPD',
    width: 70,
    render: (val) => {
      const color = val >= 90 ? '#f87171' : val >= 60 ? adminColors.danger : val >= 30 ? adminColors.orange : adminColors.warning;
      return (
        <View>
          <Text style={[colStyles.dpd, { color }]}>{val}</Text>
          <Text style={colStyles.dpdLabel}>days</Text>
        </View>
      );
    },
  },
  {
    key: 'bucket',
    label: 'Bucket',
    width: 80,
    render: (val) => {
      const v = val === 'NPA' ? 'critical' : val === '60+' ? 'danger' : val === '30+' ? 'orange' : 'warning';
      return <StatusBadge label={val} variant={v} size="sm" />;
    },
  },
  {
    key: 'agent',
    label: 'Agent',
    width: 100,
    render: (val) => <Text style={colStyles.agent}>{val}</Text>,
  },
  {
    key: 'lastContact',
    label: 'Last Contact',
    width: 100,
    render: (val) => <Text style={colStyles.date}>{val}</Text>,
  },
  {
    key: 'status',
    label: 'Status',
    width: 130,
    render: (val) => <StatusBadge label={val} variant={getStatusVariant(val)} size="sm" dot />,
  },
  {
    key: 'risk',
    label: 'Risk',
    width: 80,
    render: (val) => {
      const v = val === 'Critical' ? 'critical' : val === 'High' ? 'danger' : val === 'Medium' ? 'warning' : 'success';
      return <StatusBadge label={val} variant={v} size="sm" dot />;
    },
  },
  {
    key: 'id',
    label: 'Actions',
    width: 120,
    render: (_, row) => (
      <View style={colStyles.actions}>
        <TouchableOpacity style={colStyles.btnCall} activeOpacity={0.75}>
          <Ionicons name="call-outline" size={12} color={adminColors.chartBlue} />
          <Text style={colStyles.btnCallText}>Contact</Text>
        </TouchableOpacity>
        <TouchableOpacity style={colStyles.btnIcon} activeOpacity={0.75}>
          <Ionicons name="ellipsis-horizontal" size={14} color={adminColors.fgMuted} />
        </TouchableOpacity>
      </View>
    ),
  },
];

const colStyles = StyleSheet.create({
  id: { fontSize: 11, fontWeight: '700', color: adminColors.accent, fontFamily: 'monospace' },
  name: { fontSize: 12, fontWeight: '700', color: adminColors.fg },
  sub: { fontSize: 10, color: adminColors.fgMuted, fontWeight: '500', marginTop: 2 },
  amount: { fontSize: 13, fontWeight: '700', color: adminColors.fg },
  dpd: { fontSize: 16, fontWeight: '600', letterSpacing: -0.5 },
  dpdLabel: { fontSize: 9, color: adminColors.fgMuted, fontWeight: '600', marginTop: 1 },
  agent: { fontSize: 12, fontWeight: '500', color: adminColors.fgSub },
  date: { fontSize: 11, color: adminColors.fgSub, fontWeight: '500' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  btnCall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(96,165,250,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.25)',
    borderRadius: adminColors.r6,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  btnCallText: { fontSize: 11, fontWeight: '700', color: adminColors.chartBlue },
  btnIcon: {
    width: 28,
    height: 28,
    borderRadius: adminColors.r6,
    backgroundColor: adminColors.muted,
    borderWidth: 1,
    borderColor: adminColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const CollectionsPage = ({ activeTab, onNavigate, searchQuery, onSearch }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const stats = collectionsStats;

  const filteredData = collectionsList.filter((row) => {
    const matchSearch = !searchQuery ||
      row.borrower.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.account.includes(searchQuery);
    const matchFilter =
      activeFilter === 'All' ||
      row.bucket === activeFilter;
    return matchSearch && matchFilter;
  });

  return (
    <AdminLayout activeTab={activeTab} onNavigate={onNavigate} searchQuery={searchQuery} onSearch={onSearch}>
      {/* Stats */}
      <View style={styles.kpiRow}>
        <AdminMetricCard icon="warning-outline" iconColor={adminColors.danger} label="At-Risk Portfolio" value={stats.atRisk} />
        <AdminMetricCard icon="people-outline" iconColor={adminColors.orange} label="Delinquent Accounts" value={stats.delinquentAccounts} change="-84" positive />
        <AdminMetricCard icon="trending-down-outline" iconColor={adminColors.warning} label="NPL Ratio" value={stats.nplRatio} change="-0.08%" positive />
        <AdminMetricCard icon="cash-outline" iconColor={adminColors.accent} label="Recovered Today" value={stats.recoveredToday} change="+12%" positive />
        <AdminMetricCard icon="person-outline" iconColor={adminColors.chartPurple} label="Agent Efficiency" value={stats.agentEfficiency} />
        <AdminMetricCard icon="calendar-outline" iconColor={adminColors.chartBlue} label="Avg DPD" value={stats.avgDPD} />
      </View>

      {/* DPD Bucket Summary */}
      <View style={styles.bucketsRow}>
        {[
          { label: 'Current (0 DPD)', count: '1,34,431', amount: '₹4,820 Cr', color: adminColors.success },
          { label: '1–29 DPD', count: '3,241', amount: '₹420 Cr', color: adminColors.warning },
          { label: '30–59 DPD', count: '2,118', amount: '₹890 Cr', color: adminColors.orange },
          { label: '60–89 DPD', count: '1,042', amount: '₹640 Cr', color: adminColors.danger },
          { label: 'NPA (90+ DPD)', count: '597', amount: '₹1,415 Cr', color: '#f87171' },
        ].map((b) => (
          <View key={b.label} style={[styles.bucketCard, { borderTopColor: b.color }]}>
            <View style={[styles.bucketDot, { backgroundColor: b.color }]} />
            <Text style={styles.bucketLabel}>{b.label}</Text>
            <Text style={[styles.bucketCount, { color: b.color }]}>{b.count}</Text>
            <Text style={styles.bucketAmount}>{b.amount}</Text>
          </View>
        ))}
      </View>

      {/* Table */}
      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableTitle}>Delinquent Accounts</Text>
          <View style={styles.filterTabs}>
            {FILTER_TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.filterTab, activeFilter === tab && styles.filterTabActive]}
                onPress={() => setActiveFilter(tab)}
                activeOpacity={0.75}
              >
                <Text style={[styles.filterTabText, activeFilter === tab && styles.filterTabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <AdminTable columns={COLUMNS} data={filteredData} />

        <View style={styles.tableFoot}>
          <Text style={styles.tableFootText}>Showing {filteredData.length} of {collectionsList.length} cases</Text>
        </View>
      </View>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  kpiRow: { flexDirection: 'row', gap: 14, flexWrap: 'wrap' },
  bucketsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  bucketCard: {
    flex: 1,
    backgroundColor: adminColors.card,
    borderRadius: adminColors.r12,
    borderWidth: 1,
    borderColor: adminColors.border,
    borderTopWidth: 2,
    padding: 14,
    gap: 4,
    ...adminColors.shadowSm,
  },
  bucketDot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    marginBottom: 6,
  },
  bucketLabel: { fontSize: 10, color: adminColors.fgMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  bucketCount: { fontSize: 20, fontWeight: '600', letterSpacing: -0.5, marginTop: 2 },
  bucketAmount: { fontSize: 11, color: adminColors.fgSub, fontWeight: '500' },
  tableCard: {
    backgroundColor: adminColors.card,
    borderRadius: adminColors.r16,
    borderWidth: 1,
    borderColor: adminColors.border,
    overflow: 'hidden',
    ...adminColors.shadowSm,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: adminColors.border,
    flexWrap: 'wrap',
    gap: 10,
  },
  tableTitle: { fontSize: 14, fontWeight: '700', color: adminColors.fg },
  filterTabs: { flexDirection: 'row', gap: 4 },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: adminColors.rFull,
    borderWidth: 1,
    borderColor: adminColors.border,
    backgroundColor: adminColors.muted,
  },
  filterTabActive: {
    backgroundColor: adminColors.dangerDim,
    borderColor: adminColors.dangerBorder,
  },
  filterTabText: { fontSize: 11, fontWeight: '600', color: adminColors.fgMuted },
  filterTabTextActive: { color: adminColors.danger },
  tableFoot: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: adminColors.border,
  },
  tableFootText: { fontSize: 11, color: adminColors.fgMuted, fontWeight: '500' },
});

export default CollectionsPage;
