import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import adminColors from '../theme/adminColors';
import AdminLayout from '../components/AdminLayout';
import AdminMetricCard from '../components/AdminMetricCard';

// ─── Revenue Trend Chart (Monthly) ──────────────────────────────────────────
const RevenueTrendChart = () => {
  const data = [
    { month: 'Jan', amount: 82 },
    { month: 'Feb', amount: 95 },
    { month: 'Mar', amount: 104 },
    { month: 'Apr', amount: 110 },
    { month: 'May', amount: 118 },
    { month: 'Jun', amount: 124 },
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
          <Text style={chartStyles.label}>{d.month}</Text>
          <Text style={chartStyles.val}>₹{d.amount}L</Text>
        </View>
      ))}
    </View>
  );
};

const chartStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    height: 160,
    marginTop: 10,
  },
  col: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  barBg: {
    flex: 1,
    width: '50%',
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
    fontSize: 10,
    color: adminColors.fgMuted,
    fontWeight: '700',
  },
  val: {
    fontSize: 9,
    color: adminColors.fgSub,
    fontWeight: '600',
  },
});

// ─── Revenue Breakdown Row ───────────────────────────────────────────────────
const BreakdownRow = ({ label, percentage, value, color }) => (
  <View style={breakdownStyles.row}>
    <View style={[breakdownStyles.dot, { backgroundColor: color }]} />
    <Text style={breakdownStyles.label}>{label}</Text>
    <View style={breakdownStyles.bar}>
      <View style={[breakdownStyles.fill, { width: `${percentage}%`, backgroundColor: color }]} />
    </View>
    <Text style={breakdownStyles.valText}>₹{value}</Text>
    <Text style={[breakdownStyles.pct, { color }]}>{percentage}%</Text>
  </View>
);

const breakdownStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  dot: { width: 8, height: 8, borderRadius: 99 },
  label: { fontSize: 11, color: adminColors.fgSub, fontWeight: '600', width: 120 },
  bar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
    borderRadius: 99,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 99 },
  valText: { fontSize: 11, fontWeight: '700', color: adminColors.fg, width: 50, textAlign: 'right' },
  pct: { fontSize: 11, fontWeight: '700', width: 36, textAlign: 'right' },
});

// ─── Mock Financial Activity ────────────────────────────────────────────────
const recentFinancialEvents = [
  { id: '1', title: 'EMI Repayment Received', desc: 'Loan LN-1002 · Aanya K.', time: '10 mins ago', amount: '₹45,000', type: 'repayment' },
  { id: '2', title: 'Processing Fee Collected', desc: 'Application APP-2849 · Rahul S.', time: '1 hour ago', amount: '₹3,500', type: 'fee' },
  { id: '3', title: 'Late Payment Penalty Posted', desc: 'Loan LN-1005 · Karan P.', time: '3 hours ago', amount: '₹2,500', type: 'penalty' },
  { id: '4', title: 'Bulk Loan Disbursal Paid', desc: 'Disbursement ID #8129', time: '5 hours ago', amount: '₹14.6 L', type: 'disbursal' },
  { id: '5', title: 'Refund Reversal Processed', desc: 'Txn #9024 · Double payment return', time: '1 day ago', amount: '₹12,000', type: 'refund' },
];

const financialEventColors = {
  repayment: '#36e436ff', // green
  fee: '#3b82f6', // blue
  penalty: '#f59e0b', // amber
  disbursal: '#8b5cf6', // purple
  refund: '#ef4444', // red
};

/**
 * RevenuePage — financial operations & lending performance dashboard.
 */
const RevenuePage = ({ activeTab, onNavigate, searchQuery, onSearch }) => {
  return (
    <AdminLayout activeTab={activeTab} onNavigate={onNavigate} searchQuery={searchQuery} onSearch={onSearch}>

      {/* ── KPI Row ── */}
      <View style={styles.kpiRow}>
        <AdminMetricCard icon="wallet-outline" iconColor={adminColors.accent} label="Total Revenue" value="₹1.24 Cr" change="+12.8%" positive />
        <AdminMetricCard icon="trending-up-outline" iconColor={adminColors.chartBlue} label="Interest Income" value="₹74.8 L" change="+9.4%" positive />
        <AdminMetricCard icon="receipt-outline" iconColor={adminColors.chartPurple} label="Processing Fees" value="₹18.2 L" change="+14.2%" positive />
        <AdminMetricCard icon="card-outline" iconColor={adminColors.success} label="Collection Revenue" value="₹22.6 L" change="+11.5%" positive />
        <AdminMetricCard icon="cash-outline" iconColor={adminColors.chartTeal} label="Net Profit" value="₹31.4 L" change="+8.6%" positive />
        <AdminMetricCard icon="stats-chart-outline" iconColor={adminColors.warning} label="Growth Rate" value="+12.8%" change="+2.1%" positive />
      </View>

      {/* ── Analytics Row ── */}
      <View style={styles.chartsRow}>
        {/* Left: Revenue Trend */}
        <View style={[styles.card, { flex: 2, minWidth: 400 }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Revenue Trend</Text>
              <Text style={styles.cardSub}>Monthly financial performance summary</Text>
            </View>
            <View style={styles.trendBadge}>
              <Text style={styles.trendText}>+12.8% vs last month</Text>
            </View>
          </View>
          <RevenueTrendChart />
        </View>

        {/* Right: Revenue Breakdown */}
        <View style={[styles.card, { flex: 1.2, minWidth: 280 }]}>
          <Text style={styles.cardTitle}>Revenue Breakdown</Text>
          <Text style={[styles.cardSub, { marginBottom: 20 }]}>Distribution by revenue source</Text>
          <BreakdownRow label="Interest Income" percentage={60} value="74.8 L" color={adminColors.accent} />
          <BreakdownRow label="Collection Revenue" percentage={20} value="22.6 L" color={adminColors.chartBlue} />
          <BreakdownRow label="Processing Fees" percentage={15} value="18.2 L" color={adminColors.chartPurple} />
          <BreakdownRow label="Penalty / Late Fees" percentage={5} value="8.4 L" color={adminColors.danger} />
        </View>
      </View>

      {/* ── Insights & Activity Row ── */}
      <View style={styles.chartsRow}>
        {/* Left: Financial Performance Widgets */}
        <View style={{ flex: 1.2, gap: 16, minWidth: 320 }}>
          {/* Collection Performance Summary */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Collection Performance</Text>
            <Text style={[styles.cardSub, { marginBottom: 16 }]}>Current month overdue recovery performance</Text>

            <View style={styles.insightRow}>
              <View style={styles.insightBox}>
                <Text style={styles.insightLabel}>Collected This Month</Text>
                <Text style={styles.insightVal}>₹9.4 Cr</Text>
              </View>
              <View style={styles.insightBox}>
                <Text style={styles.insightLabel}>Overdue Recovered</Text>
                <Text style={styles.insightVal}>₹1.8 Cr</Text>
              </View>
              <View style={styles.insightBox}>
                <Text style={styles.insightLabel}>Success Rate</Text>
                <Text style={[styles.insightVal, { color: adminColors.success }]}>97.86%</Text>
              </View>
            </View>
          </View>

          {/* Top Revenue Products */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Top Revenue Products</Text>
            <Text style={[styles.cardSub, { marginBottom: 16 }]}>Loan types generating highest earnings</Text>

            <View style={styles.productSplit}>
              {[
                { name: 'Home Loan', amount: '₹43.4 L', share: '35%' },
                { name: 'Business Loan', amount: '₹37.2 L', share: '30%' },
                { name: 'Personal Loan', amount: '₹24.8 L', share: '20%' },
                { name: 'Vehicle Loan', amount: '₹18.6 L', share: '15%' },
              ].map((p, i) => (
                <View key={i} style={styles.productRow}>
                  <Text style={styles.productName}>{p.name}</Text>
                  <View style={styles.productMetrics}>
                    <Text style={styles.productVal}>{p.amount}</Text>
                    <Text style={styles.productShare}>({p.share})</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Right: Recent Financial Events */}
        <View style={[styles.card, { flex: 1, minWidth: 260 }]}>
          <Text style={styles.cardTitle}>Recent Financial Events</Text>
          <Text style={[styles.cardSub, { marginBottom: 16 }]}>Logs of transactions & postings</Text>
          {recentFinancialEvents.map((e) => {
            const color = financialEventColors[e.type] || adminColors.fgMuted;
            return (
              <View key={e.id} style={styles.eventRow}>
                <View style={[styles.eventDot, { backgroundColor: color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventTitle}>{e.title}</Text>
                  <Text style={styles.eventDesc}>{e.desc} · {e.time}</Text>
                </View>
                <Text style={[styles.eventAmount, { color }]}>{e.amount}</Text>
              </View>
            );
          })}
        </View>
      </View>

    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  kpiRow: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chartsRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  card: {
    backgroundColor: adminColors.card,
    borderRadius: adminColors.r16,
    borderWidth: 1,
    borderColor: adminColors.border,
    padding: 20,
    justifyContent: 'center',
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
  trendBadge: {
    backgroundColor: 'rgba(144, 238, 144,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
  },
  trendText: {
    fontSize: 10,
    color: '#36e436ff',
    fontWeight: '700',
  },
  insightRow: {
    flexDirection: 'row',
    gap: 12,
  },
  insightBox: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.02)',
    borderWidth: 1,
    borderColor: adminColors.border,
    borderRadius: adminColors.r12,
    padding: 14,
  },
  insightLabel: {
    fontSize: 10,
    color: adminColors.fgMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  insightVal: {
    fontSize: 16,
    fontWeight: '600',
    color: adminColors.fg,
  },
  productSplit: {
    gap: 10,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: adminColors.border,
  },
  productName: {
    fontSize: 12,
    color: adminColors.fgSub,
    fontWeight: '600',
  },
  productMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  productVal: {
    fontSize: 12,
    fontWeight: '700',
    color: adminColors.fg,
  },
  productShare: {
    fontSize: 10,
    color: adminColors.fgMuted,
    fontWeight: '600',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: adminColors.border,
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 99,
  },
  eventTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: adminColors.fg,
  },
  eventDesc: {
    fontSize: 10,
    color: adminColors.fgMuted,
    fontWeight: '500',
    marginTop: 2,
  },
  eventAmount: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default RevenuePage;
