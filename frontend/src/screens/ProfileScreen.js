import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  User,
  ChevronRight,
  Settings,
  HelpCircle,
  MessageCircle,
  ShieldCheck,
  LogOut,
  Watch,
  Battery,
  Mail,
  Phone,
  Lock,
  Bell,
  Info,
  Pencil,
} from 'lucide-react-native';
import { useProfile } from '../context/ProfileContext';
import { getStoredUser, setAuthToken, setStoredUser, getMeApi, updateProfileApi } from '../services/api';

export default function ProfileScreen({ navigation }) {
  const { profiles, showToast, showModal } = useProfile();

  const storedUser = getStoredUser();
  const [currentUser, setCurrentUser] = useState(storedUser);

  useEffect(() => {
    getMeApi().then((res) => {
      if (res?.success && res.data) {
        setCurrentUser(res.data);
      }
    });
  }, []);

  // CRITICAL: Identify the authenticated account OWNER independently of family switching
  const ownerProfile =
    profiles?.find((p) => p.isPrimary) || profiles?.[0] || {};

  const ownerName = currentUser?.fullName || storedUser?.fullName || ownerProfile.name || 'Account Owner';
  const ownerEmail =
    currentUser?.email ||
    storedUser?.email ||
    (currentUser?.identifier?.includes('@')
      ? currentUser.identifier
      : storedUser?.identifier?.includes('@')
      ? storedUser.identifier
      : null) ||
    'owner@handband.app';
  const ownerPhone =
    currentUser?.phone ||
    storedUser?.phone ||
    (!currentUser?.identifier?.includes('@') && currentUser?.identifier
      ? currentUser.identifier
      : !storedUser?.identifier?.includes('@') && storedUser?.identifier
      ? storedUser.identifier
      : null) ||
    'Not provided';
  const ownerAvatar = ownerProfile.avatar || null;
  const ownerInitials = (ownerName || 'ME').slice(0, 2).toUpperCase();
  const ownerBattery = ownerProfile.battery || 98;

  const handleLogoutConfirm = () => {
    if (showModal) {
      showModal({
        title: 'Sign Out',
        message: 'Are you sure you want to sign out of your account?',
        type: 'error',
        confirmText: 'Sign Out',
        onConfirm: () => {
          setAuthToken(null);
          setStoredUser(null);
          if (showToast) {
            showToast('Signed out successfully', 'info');
          }
          if (navigation) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        },
      });
    } else {
      setAuthToken(null);
      setStoredUser(null);
      if (navigation) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    }
  };

  const handleEditProfile = () => {
    if (showModal) {
      showModal({
        title: 'Edit Personal Profile',
        message: `Your account details are linked to your registered profile (${ownerName}). Personal info is verified via account security.`,
        type: 'info',
        confirmText: 'Got It',
      });
    }
  };

  const handleOpenSetting = (title, message) => {
    if (showModal) {
      showModal({
        title,
        message,
        type: 'info',
        confirmText: 'Got It',
      });
    } else if (showToast) {
      showToast(title, 'info');
    }
  };

  return (
    <View style={styles.container}>
      {/* 3. Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <Text style={styles.headerSubtitle}>Manage your personal account</Text>
        </View>
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() =>
            handleOpenSetting(
              'App Preferences',
              'System Units: Metric (km, kg, bpm)\nTheme: Dark Health Cyan\nVersion: 1.0.0'
            )
          }
          activeOpacity={0.7}
        >
          <Settings color="#8FAAB2" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 4 & 5. Owner Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarRing}>
              {ownerAvatar ? (
                <Image source={{ uri: ownerAvatar }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>{ownerInitials}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.avatarEditBadge}
              onPress={handleEditProfile}
              activeOpacity={0.8}
            >
              <Pencil color="#001F27" size={12} />
            </TouchableOpacity>
          </View>

          <Text style={styles.ownerName} numberOfLines={1}>
            {ownerName}
          </Text>

          <View style={styles.roleBadge}>
            <ShieldCheck color="#00BFA5" size={13} style={{ marginRight: 4 }} />
            <Text style={styles.roleBadgeText}>Account Owner</Text>
          </View>

          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={handleEditProfile}
            activeOpacity={0.8}
          >
            <Pencil color="#00BFA5" size={15} style={{ marginRight: 6 }} />
            <Text style={styles.editProfileBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* 6. Owner Personal Information */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={handleEditProfile}
              activeOpacity={0.7}
            >
              <View style={styles.settingRowLeft}>
                <View style={[styles.settingIconBox, { backgroundColor: 'rgba(0, 191, 165, 0.12)' }]}>
                  <User color="#00BFA5" size={18} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Full Name</Text>
                  <Text style={styles.settingValue}>{ownerName}</Text>
                </View>
              </View>
              <ChevronRight color="#8FAAB2" size={18} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={handleEditProfile}
              activeOpacity={0.7}
            >
              <View style={styles.settingRowLeft}>
                <View style={[styles.settingIconBox, { backgroundColor: 'rgba(41, 182, 246, 0.12)' }]}>
                  <Mail color="#29B6F6" size={18} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Email Address</Text>
                  <Text style={styles.settingValue}>{ownerEmail}</Text>
                </View>
              </View>
              <ChevronRight color="#8FAAB2" size={18} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingRow, { borderBottomWidth: 0 }]}
              onPress={handleEditProfile}
              activeOpacity={0.7}
            >
              <View style={styles.settingRowLeft}>
                <View style={[styles.settingIconBox, { backgroundColor: 'rgba(0, 230, 118, 0.12)' }]}>
                  <Phone color="#00E676" size={18} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Phone Number</Text>
                  <Text style={styles.settingValue}>{ownerPhone}</Text>
                </View>
              </View>
              <ChevronRight color="#8FAAB2" size={18} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 8. My Device (Owner's Wearable Only) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>My Device</Text>
          <TouchableOpacity
            style={styles.deviceRow}
            onPress={() => navigation?.navigate('Device')}
            activeOpacity={0.75}
          >
            <View style={styles.deviceRowLeft}>
              <View style={styles.deviceIconBox}>
                <Watch color="#00BFA5" size={24} />
              </View>
              <View style={styles.deviceTextCol}>
                <Text style={styles.deviceBandName}>{ownerName}'s Band</Text>
                <View style={styles.deviceStatusSub}>
                  <View style={styles.greenStatusDot} />
                  <Text style={styles.deviceStatusLabel}>
                    Connected • {ownerBattery}% Battery
                  </Text>
                </View>
              </View>
            </View>
            <ChevronRight color="#8FAAB2" size={18} />
          </TouchableOpacity>
        </View>

        {/* 9. Account Settings */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account & Security</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() =>
                handleOpenSetting(
                  'Password & Security',
                  'Password was set during registration. To change, use the Reset Password action on the login screen.'
                )
              }
              activeOpacity={0.7}
            >
              <View style={styles.settingRowLeft}>
                <View style={[styles.settingIconBox, { backgroundColor: 'rgba(255, 179, 0, 0.12)' }]}>
                  <Lock color="#FFB300" size={18} />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Password & Security</Text>
                  <Text style={styles.settingSubtitle}>Credentials & authentication</Text>
                </View>
              </View>
              <ChevronRight color="#8FAAB2" size={18} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() =>
                handleOpenSetting(
                  'Notifications',
                  'Push Notifications: Enabled\nHealth Goal Reminders: Active\nLow Battery Alerts: Active'
                )
              }
              activeOpacity={0.7}
            >
              <View style={styles.settingRowLeft}>
                <View style={[styles.settingIconBox, { backgroundColor: 'rgba(0, 191, 165, 0.12)' }]}>
                  <Bell color="#00BFA5" size={18} />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Notifications</Text>
                  <Text style={styles.settingSubtitle}>Alerts & goal reminders</Text>
                </View>
              </View>
              <ChevronRight color="#8FAAB2" size={18} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingRow, { borderBottomWidth: 0 }]}
              onPress={() =>
                handleOpenSetting(
                  'Data Privacy & Security',
                  'All health telemetry transmitted from your wearable is protected with 256-bit encryption. Your private metrics are only accessible to you.'
                )
              }
              activeOpacity={0.7}
            >
              <View style={styles.settingRowLeft}>
                <View style={[styles.settingIconBox, { backgroundColor: 'rgba(0, 230, 118, 0.12)' }]}>
                  <ShieldCheck color="#00E676" size={18} />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Privacy & Encryption</Text>
                  <Text style={styles.settingSubtitle}>Protected biometric telemetry</Text>
                </View>
              </View>
              <ChevronRight color="#8FAAB2" size={18} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 10. Help & Support */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Help & Support</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() =>
                handleOpenSetting(
                  'Help Center',
                  'Wearable Tips:\n1. Wear band snugly above your wrist bone.\n2. Keep Bluetooth enabled on your phone.\n3. Keep the sensor window clean for optimal readings.'
                )
              }
              activeOpacity={0.7}
            >
              <View style={styles.settingRowLeft}>
                <View style={[styles.settingIconBox, { backgroundColor: 'rgba(41, 182, 246, 0.12)' }]}>
                  <HelpCircle color="#29B6F6" size={18} />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Help Center</Text>
                  <Text style={styles.settingSubtitle}>User guides & troubleshooting</Text>
                </View>
              </View>
              <ChevronRight color="#8FAAB2" size={18} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() =>
                handleOpenSetting(
                  'Customer Support',
                  'Support is available 24/7. For assistance, reach out to support@handband.app or visit the help desk.'
                )
              }
              activeOpacity={0.7}
            >
              <View style={styles.settingRowLeft}>
                <View style={[styles.settingIconBox, { backgroundColor: 'rgba(171, 71, 188, 0.12)' }]}>
                  <MessageCircle color="#AB47BC" size={18} />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Contact Support</Text>
                  <Text style={styles.settingSubtitle}>24/7 customer care</Text>
                </View>
              </View>
              <ChevronRight color="#8FAAB2" size={18} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingRow, { borderBottomWidth: 0 }]}
              onPress={() =>
                handleOpenSetting(
                  'About HandBand',
                  'HandBand Health Platform\nVersion: 1.0.0 (Production Release)\nEncrypted Family & Personal Wellness Ecosystem'
                )
              }
              activeOpacity={0.7}
            >
              <View style={styles.settingRowLeft}>
                <View style={[styles.settingIconBox, { backgroundColor: 'rgba(122, 158, 168, 0.12)' }]}>
                  <Info color="#8FAAB2" size={18} />
                </View>
                <View>
                  <Text style={styles.settingTitle}>About HandBand</Text>
                  <Text style={styles.settingSubtitle}>Version 1.0.0</Text>
                </View>
              </View>
              <ChevronRight color="#8FAAB2" size={18} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 11. Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleLogoutConfirm}
          activeOpacity={0.8}
        >
          <LogOut color="#FF5252" size={18} style={{ marginRight: 8 }} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001F27',
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 46,
    paddingBottom: 14,
    backgroundColor: '#002833',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(122, 158, 168, 0.1)',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: '#8FAAB2',
    fontSize: 13,
    marginTop: 2,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#002129',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.2)',
  },

  // Scroll Body
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100, // Ample space so bottom navigation never covers content
  },

  // 4 & 5. Owner Profile Card
  profileCard: {
    backgroundColor: '#002B36',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.18)',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarRing: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 2.5,
    borderColor: '#00BFA5',
    padding: 3,
    backgroundColor: 'rgba(0, 191, 165, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    backgroundColor: '#004D40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#00BFA5',
    fontSize: 26,
    fontWeight: '800',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00BFA5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#002B36',
  },
  ownerName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 191, 165, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 191, 165, 0.3)',
    marginBottom: 16,
  },
  roleBadgeText: {
    color: '#00BFA5',
    fontSize: 11.5,
    fontWeight: '700',
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 191, 165, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 165, 0.3)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    width: '100%',
    height: 44,
  },
  editProfileBtnText: {
    color: '#00BFA5',
    fontSize: 13.5,
    fontWeight: '700',
  },

  // Section Cards
  sectionCard: {
    backgroundColor: '#002B36',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.15)',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    marginBottom: 12,
  },

  // Settings List
  settingsList: {
    backgroundColor: '#00222B',
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.08)',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(122, 158, 168, 0.08)',
    minHeight: 52, // Comfortable 44px+ touch target
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  settingIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    color: '#8FAAB2',
    fontSize: 11,
    fontWeight: '500',
  },
  settingValue: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '600',
    marginTop: 1,
  },
  settingTitle: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '600',
  },
  settingSubtitle: {
    color: '#8FAAB2',
    fontSize: 11,
    marginTop: 1,
  },

  // 8. My Device Row
  deviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#00222B',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.1)',
  },
  deviceRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 191, 165, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 165, 0.25)',
  },
  deviceTextCol: {
    flex: 1,
  },
  deviceBandName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  deviceStatusSub: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E676',
    marginRight: 5,
  },
  deviceStatusLabel: {
    color: '#00E676',
    fontSize: 11.5,
    fontWeight: '600',
  },

  // 11. Sign Out Button
  signOutButton: {
    backgroundColor: 'rgba(255, 75, 75, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 75, 75, 0.25)',
    height: 50,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  signOutText: {
    color: '#FF4B4B',
    fontSize: 15,
    fontWeight: '700',
  },
});
