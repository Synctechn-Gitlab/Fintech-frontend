import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TopRightToast = ({ message, visible, onHide, type = 'success' }) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: Platform.OS === 'web' ? 20 : 50,
          useNativeDriver: true,
          speed: 12,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start(() => {
          if (onHide) onHide();
        });
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [visible, onHide, translateY, opacity]);

  if (!visible) return null;

  const isSuccess = type === 'success';

  return (
    <Animated.View style={[
      styles.container, 
      { transform: [{ translateY }], opacity },
      isSuccess ? styles.successBorder : styles.errorBorder
    ]}>
      <Ionicons 
        name={isSuccess ? "checkmark-circle" : "alert-circle"} 
        size={24} 
        color={isSuccess ? "#10B981" : "#EF4444"} 
        style={styles.icon} 
      />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 9999,
    minWidth: 250,
    maxWidth: 400,
    borderLeftWidth: 4,
  },
  successBorder: {
    borderLeftColor: '#10B981',
  },
  errorBorder: {
    borderLeftColor: '#EF4444',
  },
  icon: {
    marginRight: 12,
  },
  text: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  }
});

export default TopRightToast;
