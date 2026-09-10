import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react-native';
import { useProfile } from '../context/ProfileContext';

export default function Toast() {
  const { toast, hideToast } = useProfile();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast.visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: Platform.OS === 'web' ? 20 : 50,
          friction: 8,
          tension: 60,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();

      const timer = setTimeout(() => {
        handleDismiss();
      }, 3500);

      return () => clearTimeout(timer);
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 250,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }
  }, [toast.visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      hideToast();
    });
  };

  if (!toast.visible && opacityAnim._value === 0) {
    return null;
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'error':
        return <AlertCircle color="#FF4B4B" size={20} />;
      case 'info':
        return <Info color="#00E5FF" size={20} />;
      case 'success':
      default:
        return <CheckCircle2 color="#00BFA5" size={20} />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'error':
        return '#FF4B4B';
      case 'info':
        return '#00E5FF';
      case 'success':
      default:
        return '#00BFA5';
    }
  };

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
          borderColor: getBorderColor(),
        },
      ]}
      pointerEvents={toast.visible ? 'auto' : 'none'}
    >
      <View style={styles.iconBox}>{getIcon()}</View>
      <Text style={styles.toastMessage} numberOfLines={2}>
        {toast.message}
      </Text>
      <TouchableOpacity style={styles.closeBtn} onPress={handleDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <X color="#7A9EA8" size={16} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    zIndex: 99999,
    maxWidth: 460,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 31, 39, 0.95)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: '#00BFA5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(12px)' } : {}),
  },
  iconBox: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toastMessage: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  closeBtn: {
    marginLeft: 8,
    padding: 4,
  },
});
