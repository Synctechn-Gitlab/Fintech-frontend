import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, G } from 'react-native-svg';
import adminColors from '../theme/adminColors';
import AdminLayout from '../components/AdminLayout';
import {
  overviewMetrics,
  disbursementTrend,
  riskDistribution,
  recentActivity,
} from '../data/mockData';

// ─── Circular Progress Component ──────────────────────────────────────────────
const CircularProgress = ({ percentage, size = 52, strokeWidth = 5, color = adminColors.accent }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(15, 23, 42, 0.05)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Foreground circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
          />
        </G>
      </Svg>
      <View style={{ position: 'absolute' }}>
        <Text style={{ fontSize: 10, fontWeight: '600', color: adminColors.fg }}>{percentage}%</Text>
      </View>
    </View>
  );
};

// ─── Segmented Progress Bar Component ─────────────────────────────────────────
const SegmentedProgress = ({ segments }) => {
  return (
    <View style={segmentStyles.wrap}>
      {segments.map((seg, idx) => (
        <View
          key={idx}
          style={{
            width: `${seg.percentage}%`,
            backgroundColor: seg.color,
            height: '100%',
          }}
        />
      ))}
    </View>
  );
};

const segmentStyles = StyleSheet.create({
  wrap: {
    height: 10,
    borderRadius: 99,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.06)',
    width: '100%',
    marginVertical: 12,
  },
});

// ─── Modern Disbursement Chart Component ─────────────────────────────────────
const DisbursementChart = () => {
  const data = [
    { date: 'Jun 14', amount: 16 },
    { date: 'Jun 15', amount: 12 },
    { date: 'Jun 16', amount: 18 },
    { date: 'Jun 17', amount: 11 },
    { date: 'Jun 18', amount: 14 },
    { date: 'Jun 19', amount: 13 },
    { date: 'Jun 20', amount: 20 },
    { date: 'Jun 21', amount: 16 },
    { date: 'Jun 22', amount: 18 },
    { date: 'Jun 23', amount: 21 },
  ];
  const max = Math.max(...data.map(d => d.amount));

  return (
    <View style={chartStyles.wrap}>
      {data.map((d, i) => (
        <View key={i} style={chartStyles.col}>
          <View style={chartStyles.barBg}>
            <View
              style={[
                chartStyles.barFill,
                {
                  height: `${Math.round((d.amount / max) * 100)}%`,
                  backgroundColor: i === data.length - 1 ? adminColors.accent : adminColors.chartBlue,
                },
              ]}
            />
          </View>
          <Text style={chartStyles.label}>{d.date.split(' ')[1]}</Text>
          <Text style={chartStyles.val}>₹{d.amount}Cr</Text>
        </View>
      ))}
    </View>
  );
};

const chartStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    height: 140,
    marginTop: 10,
  },
  col: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  barBg: {
    flex: 1,
    width: '60%',
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  label: {
    fontSize: 9,
    color: adminColors.fgMuted,
    fontWeight: '700',
  },
  val: {
    fontSize: 8,
    color: adminColors.fgSub,
    fontWeight: '600',
  },
});

// ─── Risk Segment Row Component ──────────────────────────────────────────────
const RiskRow = ({ label, value, color }) => (
  <View style={riskStyles.row}>
    <View style={[riskStyles.dot, { backgroundColor: color }]} />
    <Text style={riskStyles.label}>{label}</Text>
    <View style={riskStyles.bar}>
      <View style={[riskStyles.fill, { width: `${value}%`, backgroundColor: color }]} />
    </View>
    <Text style={[riskStyles.pct, { color }]}>{value}%</Text>
  </View>
);

const riskStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  dot: { width: 8, height: 8, borderRadius: 99 },
  label: { fontSize: 11, color: adminColors.fgSub, fontWeight: '600', width: 80 },
  bar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
    borderRadius: 99,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 99 },
  pct: { fontSize: 11, fontWeight: '700', width: 32, textAlign: 'right' },
});

// ─── Activity Icon Map ────────────────────────────────────────────────────────
const activityMap = {
  approval: { icon: 'checkmark-circle', color: adminColors.success },
  flag: { icon: 'flag', color: adminColors.warning },
  collection: { icon: 'cash', color: adminColors.chartBlue },
  config: { icon: 'settings', color: adminColors.chartPurple },
  user: { icon: 'person-add', color: adminColors.chartTeal },
};

/**
 * DashboardPage — primary lending operations command center.
 */
const DashboardPage = ({ activeTab, onNavigate, searchQuery, onSearch }) => {
  return (
    <AdminLayout activeTab={activeTab} onNavigate={onNavigate} searchQuery={searchQuery} onSearch={onSearch}>

      {/* ─── Row 1: KPI Cards ────────────────────────────────────────────────── */}
      <View style={styles.gridRow}>
        {/* Card 1: Approved Loans */}
        <View style={styles.kpiCard}>
          <View style={styles.kpiCardHeader}>
            <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(144, 238, 144,0.1)' }]}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#36e436ff" />
            </View>
            <View style={styles.trendBadgePositive}>
              <Text style={styles.trendTextPositive}>+12.4%</Text>
            </View>
          </View>
          <Text style={styles.kpiValue}>1,842</Text>
          <Text style={styles.kpiTitle}>Approved applications</Text>
        </View>

        {/* Card 2: Rejected Loans */}
        <View style={styles.kpiCard}>
          <View style={styles.kpiCardHeader}>
            <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
              <Ionicons name="close-circle-outline" size={18} color="#ef4444" />
            </View>
            <View style={styles.trendBadgeNegative}>
              <Text style={styles.trendTextNegative}>-5.2%</Text>
            </View>
          </View>
          <Text style={styles.kpiValue}>1,247</Text>
          <Text style={styles.kpiTitle}>Declined applications</Text>
        </View>

        {/* Card 3: Pending Applications */}
        <View style={styles.kpiCard}>
          <View style={styles.kpiCardHeader}>
            <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(251,191,36,0.1)' }]}>
              <Ionicons name="time-outline" size={18} color="#fbbf24" />
            </View>
            <View style={styles.threeDot}>
              <Ionicons name="ellipsis-horizontal" size={16} color={adminColors.fgMuted} />
            </View>
          </View>
          <Text style={styles.kpiValue}>2,146</Text>
          <Text style={styles.kpiTitle}>Applications in progress</Text>
        </View>

        {/* Card 4: Total Loan Value */}
        <View style={styles.kpiCard}>
          <View style={styles.kpiCardHeader}>
            <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(29,78,216,0.1)' }]}>
              <Ionicons name="wallet-outline" size={18} color={adminColors.accent} />
            </View>
            <View style={styles.trendBadgePositive}>
              <Text style={styles.trendTextPositive}>+8.7%</Text>
            </View>
          </View>
          <Text style={styles.kpiValue}>₹7,27,30,000</Text>
          <Text style={styles.kpiTitle}>Net active portfolio</Text>
        </View>
      </View>

      {/* ─── Row 2: Circular Metrics & Loan Mix Split ───────────────────────── */}
      <View style={styles.gridRow}>
        {/* Card 1: Verified Customers */}
        <View style={styles.progressCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardHeaderTitle}>Verified Customers</Text>
            <Text style={styles.progressCardVal}>1,842</Text>
            <Text style={styles.progressCardSub}>3.5% more than last week</Text>
          </View>
          <CircularProgress percentage={52} color="#36e436ff" />
        </View>

        {/* Card 2: Short-Term Loans */}
        <View style={styles.progressCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardHeaderTitle}>Short-Term Loans</Text>
            <Text style={styles.progressCardVal}>987</Text>
            <Text style={styles.progressCardSub}>2.4% less than last week</Text>
          </View>
          <CircularProgress percentage={46} color={adminColors.accent} />
        </View>

        {/* Card 3: Types of Loan */}
        <View style={styles.progressCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardHeaderTitle}>Types of Loan</Text>
            <SegmentedProgress
              segments={[
                { percentage: 35, color: adminColors.accent },
                { percentage: 25, color: adminColors.chartBlue },
                { percentage: 40, color: adminColors.chartTeal },
              ]}
            />
            <View style={styles.segmentedLegend}>
              <View style={styles.legendCol}>
                <View style={[styles.legendDotSmall, { backgroundColor: adminColors.accent }]} />
                <Text style={styles.legendLabelSmall}>Home (35%)</Text>
              </View>
              <View style={styles.legendCol}>
                <View style={[styles.legendDotSmall, { backgroundColor: adminColors.chartBlue }]} />
                <Text style={styles.legendLabelSmall}>Personal (25%)</Text>
              </View>
              <View style={styles.legendCol}>
                <View style={[styles.legendDotSmall, { backgroundColor: adminColors.chartTeal }]} />
                <Text style={styles.legendLabelSmall}>Vehicle (40%)</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* ─── Row 3: Large Chart + Side Portfolio Risk ────────────────────────── */}
      <View style={styles.gridRow}>
        {/* Left: Disbursement Trend */}
        <View style={[styles.card, { flex: 2, minWidth: 400 }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Disbursement Trend</Text>
              <Text style={styles.cardSub}>Daily lending performance summary</Text>
            </View>
            <View style={styles.trendBadgePositive}>
              <Text style={styles.trendTextPositive}>8.7% higher than prev. month</Text>
            </View>
          </View>
          <DisbursementChart />
        </View>

        {/* Right: Portfolio Risk Split */}
        <View style={[styles.card, { flex: 1, minWidth: 260 }]}>
          <Text style={styles.cardTitle}>Portfolio Risk Split</Text>
          <Text style={[styles.cardSub, { marginBottom: 16 }]}>By credit rating exposure</Text>
          {riskDistribution.map((r) => (
            <RiskRow key={r.label} {...r} />
          ))}
        </View>
      </View>

      {/* ─── Row 4: Recent Activity & Quick Insights ───────────────────────── */}
      <View style={styles.gridRow}>
        {/* Left: Recent Activity Feed */}
        <View style={[styles.card, { flex: 1.2, minWidth: 320 }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Recent Activity</Text>
            <TouchableOpacity style={styles.viewAll}>
              <Text style={styles.viewAllText}>View all</Text>
              <Ionicons name="chevron-forward" size={12} color={adminColors.accent} />
            </TouchableOpacity>
          </View>
          {recentActivity.slice(0, 3).map((a) => {
            const { icon, color } = activityMap[a.type] || { icon: 'ellipse', color: adminColors.fgMuted };
            return (
              <View key={a.id} style={styles.actRow}>
                <View style={[styles.actIcon, { backgroundColor: `${color}10` }]}>
                  <Ionicons name={icon} size={14} color={color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actMsg}>{a.message}</Text>
                  <Text style={styles.actMeta}>{a.user} · {a.time}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Right: Quick Insights */}
        <View style={[styles.statsCol, { flex: 0.8, minWidth: 240 }]}>
          {[
            { label: 'Auto-Approved', value: '38%', sub: 'of total applications', icon: 'checkmark-done-circle', color: adminColors.success },
            { label: 'Avg Credit Score', value: '701', sub: 'portfolio average', icon: 'star', color: adminColors.chartBlue },
            { label: 'Net Profit Margin', value: '25.3%', sub: 'operating margin', icon: 'trending-up', color: adminColors.chartPurple },
            { label: 'Overdue EMIs', value: '3', sub: 'active overdue accounts', icon: 'alert-circle', color: adminColors.danger },
          ].map((s) => (
            <View key={s.label} style={styles.quickStat}>
              <View style={[styles.quickIcon, { backgroundColor: `${s.color}10` }]}>
                <Ionicons name={s.icon} size={16} color={s.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.quickLabel}>{s.label}</Text>
                <Text style={styles.quickSub}>{s.sub}</Text>
              </View>
              <Text style={[styles.quickVal, { color: s.color }]}>{s.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ─── Row 5: Module Snapshot Cards ────────────────────────────────────── */}
      <View style={styles.snapshotGrid}>
        {/* Snapshot 1: Revenue */}
        <View style={styles.snapshotCard}>
          <View style={styles.snapshotHeader}>
            <Ionicons name="wallet-outline" size={18} color={adminColors.accent} />
            <Text style={styles.snapshotTitle}>Revenue</Text>
          </View>
          <View style={styles.snapshotBody}>
            <View style={styles.snapshotMetric}>
              <Text style={styles.snapshotLabel}>Total Revenue</Text>
              <Text style={styles.snapshotValue}>₹1.24 Cr</Text>
            </View>
            <View style={styles.snapshotMetric}>
              <Text style={styles.snapshotLabel}>Monthly Growth</Text>
              <Text style={styles.snapshotValue}>+12.8%</Text>
            </View>
            <View style={styles.snapshotMetric}>
              <Text style={styles.snapshotLabel}>Interest Income</Text>
              <Text style={styles.snapshotValue}>₹74.8 L</Text>
            </View>
            <View style={styles.snapshotMetric}>
              <Text style={styles.snapshotLabel}>Collection Revenue</Text>
              <Text style={styles.snapshotValue}>₹22.6 L</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.snapshotLink}
            onPress={() => onNavigate('revenue')}
            activeOpacity={0.75}
          >
            <Text style={styles.snapshotLinkText}>Open Revenue</Text>
            <Ionicons name="arrow-forward" size={12} color={adminColors.accent} />
          </TouchableOpacity>
        </View>

        {/* Snapshot 2: Loan Management */}
        <View style={styles.snapshotCard}>
          <View style={styles.snapshotHeader}>
            <Ionicons name="layers-outline" size={18} color={adminColors.accent} />
            <Text style={styles.snapshotTitle}>Loan Management</Text>
          </View>
          <View style={styles.snapshotBody}>
            <View style={styles.snapshotMetric}>
              <Text style={styles.snapshotLabel}>Total Loan Value</Text>
              <Text style={styles.snapshotValue}>₹612 Cr</Text>
            </View>
            <View style={styles.snapshotMetric}>
              <Text style={styles.snapshotLabel}>Active Loans</Text>
              <Text style={styles.snapshotValue}>2,41,831</Text>
            </View>
            <View style={styles.snapshotMetric}>
              <Text style={styles.snapshotLabel}>Disbursed Today</Text>
              <Text style={styles.snapshotValue}>₹48.6 Cr</Text>
            </View>
            <View style={styles.snapshotMetric}>
              <Text style={styles.snapshotLabel}>Average Tenure</Text>
              <Text style={styles.snapshotValue}>36 Months</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.snapshotLink}
            onPress={() => onNavigate('loan')}
            activeOpacity={0.75}
          >
            <Text style={styles.snapshotLinkText}>Open Loans</Text>
            <Ionicons name="arrow-forward" size={12} color={adminColors.accent} />
          </TouchableOpacity>
        </View>

        {/* Snapshot 3: Collections */}
        <View style={styles.snapshotCard}>
          <View style={styles.snapshotHeader}>
            <Ionicons name="wallet-outline" size={18} color={adminColors.success} />
            <Text style={styles.snapshotTitle}>Collections</Text>
          </View>
          <View style={styles.snapshotBody}>
            <View style={styles.snapshotMetric}>
              <Text style={styles.snapshotLabel}>Overdue Accounts</Text>
              <Text style={styles.snapshotValue}>6,998</Text>
            </View>
            <View style={styles.snapshotMetric}>
              <Text style={styles.snapshotLabel}>Recovered Today</Text>
              <Text style={styles.snapshotValue}>₹1.2 Cr</Text>
            </View>
            <View style={styles.snapshotMetric}>
              <Text style={styles.snapshotLabel}>Collection Rate</Text>
              <Text style={styles.snapshotValue}>97.86%</Text>
            </View>
            <View style={styles.snapshotMetric}>
              <Text style={styles.snapshotLabel}>NPL Ratio</Text>
              <Text style={[styles.snapshotValue, { color: adminColors.danger }]}>2.14%</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.snapshotLink}
            onPress={() => onNavigate('collections')}
            activeOpacity={0.75}
          >
            <Text style={styles.snapshotLinkText}>Open Collections</Text>
            <Ionicons name="arrow-forward" size={12} color={adminColors.accent} />
          </TouchableOpacity>
        </View>

        {/* Snapshot 4: User Management */}
        <View style={styles.snapshotCard}>
          <View style={styles.snapshotHeader}>
            <Ionicons name="people-outline" size={18} color={adminColors.chartPurple} />
            <Text style={styles.snapshotTitle}>User Management</Text>
          </View>
          <View style={styles.snapshotBody}>
            <View style={styles.snapshotMetric}>
              <Text style={styles.snapshotLabel}>Total Borrowers</Text>
              <Text style={styles.snapshotValue}>1,84,209</Text>
            </View>
            <View style={styles.snapshotMetric}>
              <Text style={styles.snapshotLabel}>Active Users</Text>
              <Text style={styles.snapshotValue}>1,34,431</Text>
            </View>
            <View style={styles.snapshotMetric}>
              <Text style={styles.snapshotLabel}>KYC Verified (tier-2)</Text>
              <Text style={styles.snapshotValue}>73%</Text>
            </View>
            <View style={styles.snapshotMetric}>
              <Text style={styles.snapshotLabel}>Suspended Users</Text>
              <Text style={[styles.snapshotValue, { color: adminColors.danger }]}>28</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.snapshotLink}
            onPress={() => onNavigate('users')}
            activeOpacity={0.75}
          >
            <Text style={styles.snapshotLinkText}>Open Users</Text>
            <Ionicons name="arrow-forward" size={12} color={adminColors.accent} />
          </TouchableOpacity>
        </View>
      </View>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  gridRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: adminColors.card,
    borderRadius: adminColors.r12,
    borderWidth: 1,
    borderColor: adminColors.border,
    padding: 16,
    ...adminColors.shadowSm,
  },
  kpiCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  kpiIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadgePositive: {
    backgroundColor: 'rgba(144, 238, 144,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
  },
  trendTextPositive: {
    fontSize: 10,
    color: '#36e436ff',
    fontWeight: '700',
  },
  trendBadgeNegative: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
  },
  trendTextNegative: {
    fontSize: 10,
    color: '#ef4444',
    fontWeight: '700',
  },
  threeDot: {
    padding: 4,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '600',
    color: adminColors.fg,
    letterSpacing: -0.5,
  },
  kpiTitle: {
    fontSize: 11,
    color: adminColors.fgMuted,
    fontWeight: '600',
    marginTop: 6,
  },
  progressCard: {
    flex: 1,
    minWidth: 240,
    backgroundColor: adminColors.card,
    borderRadius: adminColors.r12,
    borderWidth: 1,
    borderColor: adminColors.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...adminColors.shadowSm,
  },
  cardHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: adminColors.fgMuted,
    marginBottom: 8,
  },
  progressCardVal: {
    fontSize: 20,
    fontWeight: '600',
    color: adminColors.fg,
  },
  progressCardSub: {
    fontSize: 10,
    color: adminColors.fgSub,
    fontWeight: '500',
    marginTop: 4,
  },
  segmentedLegend: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  legendCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 99,
  },
  legendLabelSmall: {
    fontSize: 9,
    color: adminColors.fgSub,
    fontWeight: '600',
  },
  card: {
    backgroundColor: adminColors.card,
    borderRadius: adminColors.r16,
    borderWidth: 1,
    borderColor: adminColors.border,
    padding: 20,
    ...adminColors.shadowSm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: adminColors.fg,
    letterSpacing: -0.2,
  },
  cardSub: {
    fontSize: 11,
    color: adminColors.fgMuted,
    fontWeight: '500',
    marginTop: 3,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewAllText: {
    fontSize: 12,
    color: adminColors.accent,
    fontWeight: '600',
  },
  actRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: adminColors.border,
  },
  actIcon: {
    width: 30,
    height: 30,
    borderRadius: adminColors.r8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actMsg: {
    fontSize: 12,
    fontWeight: '600',
    color: adminColors.fg,
    lineHeight: 17,
  },
  actMeta: {
    fontSize: 10,
    color: adminColors.fgMuted,
    fontWeight: '500',
    marginTop: 3,
  },
  statsCol: {
    gap: 10,
  },
  quickStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: adminColors.card,
    borderWidth: 1,
    borderColor: adminColors.border,
    borderRadius: adminColors.r12,
    padding: 12,
    flex: 1,
    ...adminColors.shadowSm,
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: adminColors.r8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: adminColors.fg,
  },
  quickSub: {
    fontSize: 10,
    color: adminColors.fgMuted,
    fontWeight: '500',
    marginTop: 2,
  },
  quickVal: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  snapshotGrid: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    marginTop: 8,
  },
  snapshotCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: adminColors.card,
    borderRadius: adminColors.r16,
    borderWidth: 1,
    borderColor: adminColors.border,
    padding: 16,
    justifyContent: 'space-between',
    ...adminColors.shadowSm,
  },
  snapshotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  snapshotTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: adminColors.fg,
  },
  snapshotBody: {
    gap: 8,
    marginBottom: 16,
  },
  snapshotMetric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  snapshotLabel: {
    fontSize: 11,
    color: adminColors.fgMuted,
    fontWeight: '500',
  },
  snapshotValue: {
    fontSize: 12,
    fontWeight: '700',
    color: adminColors.fg,
  },
  snapshotLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: adminColors.border,
    paddingTop: 12,
  },
  snapshotLinkText: {
    fontSize: 11,
    color: adminColors.accent,
    fontWeight: '700',
  },
});

export default DashboardPage;
