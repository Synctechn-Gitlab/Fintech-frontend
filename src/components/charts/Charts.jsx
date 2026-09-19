import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, {
  Path, Defs, LinearGradient, Stop, Circle, Line, Text as SvgText, G,
} from 'react-native-svg';
import colors from '../../theme/colors';

const { width: SCREEN_W } = Dimensions.get('window');

// ── Loan Progress (circular donut) ───────────────────────────────────────────
export const LoanProgressChart = ({ outstanding = 22320, principal = 48000, size = 90 }) => {
  const paid = principal - outstanding;
  const pct = principal > 0 ? Math.max(0, Math.min(1, paid / principal)) : 0;
  const percentage = Math.round(pct * 100);

  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - pct * circumference;
  const center = size / 2;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={colors.success} stopOpacity="1" />
            <Stop offset="100%" stopColor="#86efac" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        {/* Track */}
        <Circle
          cx={center} cy={center} r={radius}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth} fill="transparent"
        />
        {/* Progress */}
        <Circle
          cx={center} cy={center} r={radius}
          stroke="url(#progressGrad)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ fontSize: size * 0.2, fontWeight: '600', color: colors.foreground, letterSpacing: -0.5 }}>
          {percentage}%
        </Text>
      </View>
    </View>
  );
};

// ── Payment Trend (stacked bars) ─────────────────────────────────────────────
export const PaymentTrendChart = () => {
  const W = 320, H = 140, padX = 36, padY = 12;
  const cW = W - padX - 10;
  const cH = H - padY - 22;
  const totalEMI = 1290;
  const barW = 22;
  const barGap = cW / 6;

  const data = [
    { label: 'Jan', principal: 940, interest: 250, fees: 50 },
    { label: 'Feb', principal: 950, interest: 240, fees: 50 },
    { label: 'Mar', principal: 960, interest: 230, fees: 50 },
    { label: 'Apr', principal: 970, interest: 220, fees: 50 },
    { label: 'May', principal: 980, interest: 210, fees: 50 },
    { label: 'Jun', principal: 990, interest: 200, fees: 50 },
  ];

  return (
    <View style={styles.container}>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* Grid lines */}
        {[0, 0.5, 1].map((fraction, i) => {
          const y = padY + (1 - fraction) * cH;
          return (
            <G key={i}>
              <Line
                x1={padX} y1={y} x2={W - 10} y2={y}
                stroke="rgba(255,255,255,0.04)"
                strokeDasharray={fraction === 0 ? '0' : '3 4'}
              />
              <SvgText
                x={padX - 6} y={y + 3}
                textAnchor="end"
                fill={colors.mutedForeground} fontSize="7" fontWeight="500"
              >
                {fraction === 0 ? '₹0' : fraction === 0.5 ? '₹645' : '₹1.3K'}
              </SvgText>
            </G>
          );
        })}

        {data.map((d, i) => {
          const x = padX + i * barGap + (barGap - barW) / 2;
          const pH = (d.principal / totalEMI) * cH;
          const iH = (d.interest / totalEMI) * cH;
          const fH = (d.fees / totalEMI) * cH;
          const yF = padY + cH - fH;
          const yI = yF - iH;
          const yP = yI - pH;
          const rounding = 3;
          const isLast = i === data.length - 1;

          return (
            <G key={i}>
              {/* Principal (top, rounded) */}
              <Path
                d={`M ${x + rounding} ${yP} L ${x + barW - rounding} ${yP}
                  Q ${x + barW} ${yP} ${x + barW} ${yP + rounding}
                  L ${x + barW} ${yP + pH} L ${x} ${yP + pH}
                  L ${x} ${yP + rounding} Q ${x} ${yP} ${x + rounding} ${yP} Z`}
                fill={isLast ? '#86efac' : colors.success}
                opacity={0.9}
              />
              {/* Interest */}
              <Path
                d={`M ${x} ${yI} L ${x + barW} ${yI} L ${x + barW} ${yI + iH} L ${x} ${yI + iH} Z`}
                fill={colors.chartBlue}
                opacity={0.85}
              />
              {/* Fees (bottom, rounded) */}
              <Path
                d={`M ${x} ${yF} L ${x + barW} ${yF} L ${x + barW} ${yF + fH - rounding}
                  Q ${x + barW} ${yF + fH} ${x + barW - rounding} ${yF + fH}
                  L ${x + rounding} ${yF + fH}
                  Q ${x} ${yF + fH} ${x} ${yF + fH - rounding} L ${x} ${yF} Z`}
                fill={colors.chartPurple}
                opacity={0.8}
              />
              <SvgText
                x={x + barW / 2} y={H - 5}
                textAnchor="middle" fill={colors.mutedForeground}
                fontSize="8" fontWeight="500"
              >
                {d.label}
              </SvgText>
            </G>
          );
        })}
      </Svg>

      <View style={styles.legend}>
        {[
          { color: colors.success, label: 'Principal' },
          { color: colors.chartBlue, label: 'Interest' },
          { color: colors.chartPurple, label: 'Fees' },
        ].map(({ color, label }) => (
          <View key={label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={styles.legendText}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// ── EMI Breakdown (donut pie) ─────────────────────────────────────────────────
export const EmiBreakdownChart = ({ breakdown = { principal: 980, interest: 210, fees: 50 } }) => {
  const total = breakdown.principal + breakdown.interest + breakdown.fees;
  const cx = 60, cy = 60, r = 52;
  const innerR = 34;
  const GAP_ANGLE = 0.04; // radians gap between segments

  const segments = [
    { value: breakdown.principal, color: colors.success },
    { value: breakdown.interest, color: colors.chartBlue },
    { value: breakdown.fees, color: colors.chartPurple },
  ];

  let startAngle = -Math.PI / 2;
  const paths = segments.map((seg) => {
    const angle = (seg.value / total) * 2 * Math.PI - GAP_ANGLE;
    const x1 = cx + r * Math.cos(startAngle + GAP_ANGLE / 2);
    const y1 = cy + r * Math.sin(startAngle + GAP_ANGLE / 2);
    const endAngle = startAngle + angle + GAP_ANGLE;
    const x2 = cx + r * Math.cos(endAngle - GAP_ANGLE / 2);
    const y2 = cy + r * Math.sin(endAngle - GAP_ANGLE / 2);
    const xi1 = cx + innerR * Math.cos(startAngle + GAP_ANGLE / 2);
    const yi1 = cy + innerR * Math.sin(startAngle + GAP_ANGLE / 2);
    const xi2 = cx + innerR * Math.cos(endAngle - GAP_ANGLE / 2);
    const yi2 = cy + innerR * Math.sin(endAngle - GAP_ANGLE / 2);
    const largeArc = angle > Math.PI ? 1 : 0;
    const d = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${innerR} ${innerR} 0 ${largeArc} 0 ${xi1} ${yi1} Z`;
    startAngle = endAngle;
    return { d, color: seg.color };
  });

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={120} height={120} viewBox="0 0 120 120">
        {paths.map((p, i) => (
          <Path key={i} d={p.d} fill={p.color} opacity={0.9} />
        ))}
        <SvgText x={cx} y={cy - 5} textAnchor="middle" fill={colors.foreground} fontSize="11" fontWeight="800">
          ₹{total.toLocaleString('en-IN')}
        </SvgText>
        <SvgText x={cx} y={cy + 9} textAnchor="middle" fill={colors.mutedForeground} fontSize="7">
          per EMI
        </SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  chartHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  chartSubLabel: {
    fontSize: 10, textTransform: 'uppercase', letterSpacing: 1,
    color: colors.mutedForeground, fontWeight: '600',
  },
  chartTitle: { fontSize: 13, fontWeight: '700', color: colors.foreground, marginTop: 2 },
  legend: {
    flexDirection: 'row', justifyContent: 'center', gap: 18, marginTop: 12,
    paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 2 },
  legendText: { fontSize: 11, color: colors.mutedForeground, fontWeight: '500' },
});

export default LoanProgressChart;
