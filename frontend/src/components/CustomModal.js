import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal as RNModal,
  Platform,
} from 'react-native';
import { CheckCircle2, AlertCircle, Info, Sparkles, ShieldCheck, X } from 'lucide-react-native';
import { useProfile } from '../context/ProfileContext';

export default function CustomModal() {
  const { modal, hideModal } = useProfile();
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (modal.visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 70,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [modal.visible]);

  if (!modal.visible) return null;

  const handleConfirm = () => {
    if (modal.onConfirm) {
      modal.onConfirm();
    }
    hideModal();
  };

  const getIcon = () => {
    switch (modal.type) {
      case 'error':
        return <AlertCircle color="#FF4B4B" size={36} />;
      case 'info':
        return <Info color="#00E5FF" size={36} />;
      case 'success':
      default:
        return <CheckCircle2 color="#00BFA5" size={36} />;
    }
  };

  const getHeaderBadgeStyle = () => {
    switch (modal.type) {
      case 'error':
        return {
          backgroundColor: 'rgba(255, 75, 75, 0.15)',
          borderColor: '#FF4B4B',
        };
      case 'info':
        return {
          backgroundColor: 'rgba(0, 229, 255, 0.15)',
          borderColor: '#00E5FF',
        };
      case 'success':
      default:
        return {
          backgroundColor: 'rgba(0, 191, 165, 0.15)',
          borderColor: '#00BFA5',
        };
    }
  };

  const getButtonStyle = () => {
    switch (modal.type) {
      case 'error':
        return { backgroundColor: '#FF4B4B' };
      case 'info':
        return { backgroundColor: '#00E5FF' };
      case 'success':
      default:
        return { backgroundColor: '#00BFA5' };
    }
  };

  return (
    <RNModal
      transparent
      visible={modal.visible}
      animationType="none"
      onRequestClose={hideModal}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalCard,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
              borderColor:
                modal.type === 'error'
                  ? '#FF4B4B'
                  : modal.type === 'info'
                  ? '#00E5FF'
                  : '#00BFA5',
            },
          ]}
        >
          {/* Top Close Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={hideModal} activeOpacity={0.7}>
            <X color="#7A9EA8" size={18} />
          </TouchableOpacity>

          {/* Animated Icon Circle Header */}
          <View style={[styles.iconCircle, getHeaderBadgeStyle()]}>{getIcon()}</View>

          {/* Title */}
          <Text style={styles.title}>{modal.title || 'Notification'}</Text>

          {/* Subtitle Message */}
          {modal.message ? <Text style={styles.message}>{modal.message}</Text> : null}

          {/* Primary Action Button */}
          <TouchableOpacity
            style={[styles.confirmButton, getButtonStyle()]}
            onPress={handleConfirm}
            activeOpacity={0.85}
          >
            <Text style={styles.confirmText}>{modal.confirmText || 'OK'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 15, 22, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(10px)' } : {}),
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#002B36',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1.5,
    position: 'relative',
    shadowColor: '#00BFA5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(122, 158, 168, 0.1)',
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    marginBottom: 16,
    marginTop: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  message: {
    fontSize: 14,
    color: '#A0C0C8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 21,
    fontWeight: '400',
  },
  confirmButton: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#00BFA5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  confirmText: {
    color: '#001F27',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
