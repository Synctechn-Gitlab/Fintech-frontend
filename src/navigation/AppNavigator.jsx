import React, { useState, useEffect, useRef } from 'react';
import { View, Platform, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { authStore } from '../store/authStore';
import { authService } from '../services/authService';

import LoginScreen from '../features/auth/pages/LoginPage';
import VerifyEmailPage from '../features/auth/pages/VerifyEmailPage';
import VideoIntroPage from '../features/auth/pages/VideoIntroPage';
import HomePage from '../features/dashboard/pages/HomePage';
import DashboardScreen from '../features/dashboard/pages/DashboardPage';
import LoansScreen from '../features/loans/pages/LoansPage';
import PersonalLoanDetailsPage from '../features/loans/pages/PersonalLoanDetailsPage';
import PaymentsScreen from '../features/payments/pages/PaymentsPage';
import ProfileScreen from '../features/profile/pages/ProfilePage';
import SuperAdminScreen from '../features/superadmin/SuperAdminScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Tab Button with Spring Scale & Opacity transitions
const TabBarButton = ({ route, label, isFocused, onPress, onLongPress }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(isFocused ? 1 : 0.65)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: isFocused ? 1.15 : 1.0,
        useNativeDriver: true,
        friction: 5,
        tension: 40,
      }),
      Animated.timing(opacityValue, {
        toValue: isFocused ? 1.0 : 0.65,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused]);



  const icons = {
    Dashboard: { active: 'analytics', inactive: 'analytics-outline' },
    Loans:     { active: 'card', inactive: 'card-outline' },
    Home:      { active: 'home', inactive: 'home-outline' },
    Payments:  { active: 'calendar', inactive: 'calendar-outline' },
    Profile:   { active: 'person', inactive: 'person-outline' },
  };

  const getIconName = () => {
    const iconConfig = icons[route.name];
    if (!iconConfig) return 'ellipse';
    return isFocused ? iconConfig.active : iconConfig.inactive;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabButton}
      activeOpacity={0.7}
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }], opacity: opacityValue, alignItems: 'center' }}>
        <View style={{
          width: 42,
          height: 28,
          borderRadius: 14,
          backgroundColor: isFocused ? colors.success : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 3,
          shadowColor: isFocused ? colors.success : 'transparent',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isFocused ? 0.3 : 0,
          shadowRadius: 4,
          elevation: isFocused ? 3 : 0,
        }}>
          <Ionicons
            name={getIconName()}
            size={18}
            color={isFocused ? '#111827' : '#6B7280'}
          />
        </View>
        <Text style={[styles.tabLabel, { color: isFocused ? '#FFFFFF' : '#6B7280' }]}>
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Animated Custom Hovering Tab Bar component
const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBarWrapper}>
      <View style={styles.tabContainer}>
        {state.routes.map((route, index) => {
          if (route.name === 'PersonalLoanDetails') return null;

          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabBarButton
              key={route.key}
              route={route}
              label={label}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
};

const MainTabs = () => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
    initialRouteName="Home"
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Loans" component={LoansScreen} />
    <Tab.Screen name="Home" component={HomePage} />
    <Tab.Screen name="Payments" component={PaymentsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
    <Tab.Screen name="PersonalLoanDetails" component={PersonalLoanDetailsPage} />
  </Tab.Navigator>
);

const linking = {
  prefixes: ['http://localhost:8081', 'http://localhost:19006', 'fintech://'],
  config: {
    screens: {
      VideoIntro: {
        path: '',
        alias: ['intro'],
      },
      Login: 'login',
      VerifyEmail: 'verify-email',
      SuperAdmin: 'super-admin',
      Main: {
        path: 'user',
        screens: {
          Home: '',
          Dashboard: 'dashboard',
          Loans: 'loans',
          Payments: 'payments',
          Profile: 'profile',
        },
      },
      PersonalLoanDetails: 'user/loan-details',
    },
  },
};

export const navigationRef = createNavigationContainerRef();

const AppNavigator = () => {
  const [authState, setAuthState] = useState(authStore.getState());

  useEffect(() => {
    let lastAuth = authStore.getState().isAuthenticated;
    let lastRole = authStore.getState().user?.role;

    // Subscribe to auth state — ONLY re-render or redirect if authentication status or role changes
    const unsubscribe = authStore.subscribe((state) => {
      const isAuthenticated = state.isAuthenticated;
      const role = state.user?.role;

      if (isAuthenticated !== lastAuth || role !== lastRole) {
        lastAuth = isAuthenticated;
        lastRole = role;
        setAuthState(state);

        const isSuperAdmin = role?.toLowerCase() === 'superadmin';

        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          const pathname = window.location.pathname;
          if (isAuthenticated) {
            if (isSuperAdmin && !pathname.startsWith('/super-admin')) {
              window.location.replace('/super-admin');
              return;
            } else if (!isSuperAdmin && !pathname.startsWith('/user')) {
              window.location.replace('/user');
              return;
            }
          } else {
            if (pathname !== '/login' && pathname !== '/' && pathname !== '/intro' && !pathname.startsWith('/verify-email')) {
              window.location.replace('/');
              return;
            }
          }
        }
      }
    });

    return unsubscribe;
  }, []);

  const isAuthenticated = authState.isAuthenticated;
  const isSuperAdmin = authState.user?.role?.toLowerCase() === 'superadmin';

  if (!authState.isHydrated) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  const containerKey = isAuthenticated
    ? (isSuperAdmin ? 'superadmin-stack' : 'user-stack')
    : 'guest-stack';

  return (
    <NavigationContainer key={containerKey} linking={linking} ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated && isSuperAdmin ? (
          <Stack.Screen name="SuperAdmin" component={SuperAdminScreen} />
        ) : isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
          </>
        ) : (
          <>
            <Stack.Screen name="VideoIntro" component={VideoIntroPage} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="VerifyEmail" component={VerifyEmailPage} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: Platform.OS === 'ios' ? 88 : 74,
    backgroundColor: '#F4F5F9', // Solid light color so content doesn't bleed behind
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  tabContainer: {
    width: '94%',
    maxWidth: 440,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    marginTop: 6,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  centerButtonOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -14,
    width: 54,
    zIndex: 99,
  },
  centerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    elevation: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  tabLabel: {
    fontSize: 8.5,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.1,
  }
});

export default AppNavigator;
