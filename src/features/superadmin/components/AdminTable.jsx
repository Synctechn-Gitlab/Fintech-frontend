import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import adminColors from '../theme/adminColors';

/**
 * AdminTable — reusable desktop-style data table.
 *
 * Props:
 *   columns  — array of { key, label, width, align, render }
 *   data     — array of row objects
 *   onRowPress  — optional (row) => void
 *   emptyText   — string shown when data is empty
 *   maxHeight   — optional max height for scrollable body
 */
const AdminTable = ({ columns = [], data = [], onRowPress, emptyText = 'No records found', maxHeight }) => {
  return (
    <View style={styles.container}>
      {/* Header row */}
      <View style={styles.headerRow}>
        {columns.map((col, i) => (
          <View
            key={col.key}
            style={[
              styles.headerCell,
              { width: col.width, flex: col.flex, alignItems: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start' },
              i === 0 && { paddingLeft: 18 },
              i === columns.length - 1 && { paddingRight: 18 },
            ]}
          >
            <Text style={styles.headerText}>{col.label}</Text>
          </View>
        ))}
      </View>

      {/* Body */}
      <ScrollView style={[styles.body, maxHeight && { maxHeight }]} nestedScrollEnabled showsVerticalScrollIndicator={false}>
        {data.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="document-outline" size={28} color={adminColors.fgMuted} />
            <Text style={styles.emptyText}>{emptyText}</Text>
          </View>
        ) : (
          data.map((row, rowIdx) => (
            <TouchableOpacity
              key={row.id || rowIdx}
              style={[styles.row, rowIdx % 2 === 1 && styles.rowAlt]}
              onPress={onRowPress ? () => onRowPress(row) : undefined}
              activeOpacity={onRowPress ? 0.65 : 1}
            >
              {columns.map((col, i) => (
                <View
                  key={col.key}
                  style={[
                    styles.cell,
                    { width: col.width, flex: col.flex, alignItems: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start' },
                    i === 0 && { paddingLeft: 18 },
                    i === columns.length - 1 && { paddingRight: 18 },
                  ]}
                >
                  {col.render
                    ? col.render(row[col.key], row)
                    : <Text style={styles.cellText} numberOfLines={1}>{String(row[col.key] ?? '—')}</Text>
                  }
                </View>
              ))}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: adminColors.r16,
    borderWidth: 1,
    borderColor: adminColors.border,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: adminColors.muted,
    height: 42,
    borderBottomWidth: 1,
    borderBottomColor: adminColors.border,
  },
  headerCell: {
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 10,
    fontWeight: '700',
    color: adminColors.fgMuted,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  body: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: adminColors.border,
    backgroundColor: adminColors.card,
  },
  rowAlt: {
    backgroundColor: adminColors.bg,
  },
  cell: {
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 13,
    color: adminColors.fg,
    fontWeight: '500',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 10,
    backgroundColor: adminColors.card,
  },
  emptyText: {
    fontSize: 13,
    color: adminColors.fgMuted,
    fontWeight: '500',
  },
});

export default AdminTable;
