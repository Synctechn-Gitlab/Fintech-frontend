import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import adminColors from './theme/adminColors';
import DashboardPage from './pages/DashboardPage';
import RevenuePage from './pages/RevenuePage';
import UserManagementPage from './pages/UserManagementPage';
import LoanManagementPage from './pages/LoanManagementPage';
import CollectionsPage from './pages/CollectionsPage';
import ConfigPage from './pages/ConfigPage';

/**
 * SuperAdminScreen
 *
 * Self-contained super-admin shell. Manages its own page routing
 * with internal state so it can be dropped into any navigator as
 * a single screen node without extra Stack/Tab config.
 *
 * Usage:
 *   <Stack.Screen name="SuperAdmin" component={SuperAdminScreen} />
 */
const PAGES = {
  dashboard: DashboardPage,
  users: UserManagementPage,
  loan: LoanManagementPage,
  revenue: RevenuePage,
  collections: CollectionsPage,
  config: ConfigPage,
};

const SuperAdminScreen = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavigate = (key) => {
    setActiveTab(key);
    setSearchQuery('');   // clear search on page change
  };

  const PageComponent = PAGES[activeTab] || DashboardPage;

  return (
    <SafeAreaView style={styles.safe}>
      <PageComponent
        activeTab={activeTab}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: adminColors.bg,
  },
});

export default SuperAdminScreen;
