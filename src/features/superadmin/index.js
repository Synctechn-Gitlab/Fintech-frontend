/**
 * Super Admin Feature — Barrel Export
 *
 * Usage (from anywhere in the app):
 *   import SuperAdminScreen from '../features/superadmin';
 *
 * Or individual pieces:
 *   import { AdminLayout, AdminMetricCard, AdminTable, StatusBadge } from '../features/superadmin';
 */

// ── Main entry screen ────────────────────────────────────────────────────────
export { default } from './SuperAdminScreen';
export { default as SuperAdminScreen } from './SuperAdminScreen';

// ── Reusable layout / compound components ────────────────────────────────────
export { default as AdminLayout } from './components/AdminLayout';
export { default as AdminSidebar } from './components/AdminSidebar';
export { default as AdminHeader } from './components/AdminHeader';
export { default as AdminMetricCard } from './components/AdminMetricCard';
export { default as AdminTable } from './components/AdminTable';
export { default as StatusBadge, getStatusVariant } from './components/StatusBadge';

// ── Pages (can be used standalone inside AdminLayout) ────────────────────────
export { default as DashboardPage } from './pages/DashboardPage';
export { default as RevenuePage } from './pages/RevenuePage';
export { default as UserManagementPage } from './pages/UserManagementPage';
export { default as LoanManagementPage } from './pages/LoanManagementPage';
export { default as CollectionsPage } from './pages/CollectionsPage';
export { default as ConfigPage } from './pages/ConfigPage';

// ── Theme & Data ──────────────────────────────────────────────────────────────
export { default as adminColors } from './theme/adminColors';
export * as mockData from './data/mockData';
