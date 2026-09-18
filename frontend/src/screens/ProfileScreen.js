import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  TextInput,
  ActivityIndicator,
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
  Sun,
  Moon,
  Image as ImageIcon,
  MapPin
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useProfile } from '../context/ProfileContext';
import { useTheme } from '../context/ThemeContext';
import { getStoredUser, setAuthToken, setStoredUser, getMeApi, updateProfileApi } from '../services/api';

export default function ProfileScreen({ navigation }) {
  const { profiles, showToast, showModal } = useProfile();
  const { theme, toggleTheme, isDark } = useTheme();

  const storedUser = getStoredUser();
  const [currentUser, setCurrentUser] = useState(storedUser);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatar: '',
    country: '',
    state: '',
  });

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
  const ownerAvatar = currentUser?.avatar || storedUser?.avatar || ownerProfile.avatar || null;
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
    if (isEditing) return; // Already editing
    setEditForm({
      fullName: currentUser?.fullName || storedUser?.fullName || '',
      email: currentUser?.email || storedUser?.email || '',
      phone: currentUser?.phone || storedUser?.phone || '',
      avatar: currentUser?.avatar || storedUser?.avatar || '',
      country: currentUser?.country || storedUser?.country || '',
      state: currentUser?.state || storedUser?.state || '',
    });
    setIsEditing(true);
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setEditForm({ ...editForm, avatar: base64Img });
      }
    } catch (error) {
      if (showToast) showToast('Failed to pick image', 'error');
    }
  };

  const handleRemoveImage = () => {
    setEditForm({ ...editForm, avatar: '' });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await updateProfileApi({
        fullName: editForm.fullName,
        avatar: editForm.avatar,
        country: editForm.country,
        state: editForm.state,
      });
      if (response.success && response.data) {
        setCurrentUser(response.data);
        if (showToast) showToast('Profile updated successfully', 'success');
        setIsEditing(false);
      } else {
        if (showToast) showToast(response.error || 'Failed to update profile', 'error');
      }
    } catch (error) {
      if (showToast) showToast('Error saving profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
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
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* 3. Header */}
      <View style={[styles.header, { backgroundColor: theme.bgCard, borderBottomColor: theme.borderSub }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>My Profile</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Manage your personal account</Text>
        </View>
        <TouchableOpacity
          style={[styles.headerIconButton, { backgroundColor: isDark ? 'rgba(255,179,0,0.12)' : 'rgba(0,120,110,0.1)', borderRadius: 20, padding: 8 }]}
          onPress={toggleTheme}
          activeOpacity={0.7}
        >
          {isDark
            ? <Sun color="#FFB300" size={22} />
            : <Moon color="#008B7A" size={22} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 4 & 5. Owner Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
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

          <Text style={[styles.ownerName, { color: theme.textPrimary }]} numberOfLines={1}>
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
        <View style={[styles.sectionCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Personal Information</Text>
          <View style={[styles.settingsList, { backgroundColor: theme.bgCardAlt, borderColor: theme.borderFaint }]}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={handleEditProfile}
              activeOpacity={isEditing ? 1 : 0.7}
            >
              <View style={styles.settingRowLeft}>
                <View style={[styles.settingIconBox, { backgroundColor: 'rgba(0, 191, 165, 0.12)' }]}>
                  <User color="#00BFA5" size={18} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: theme.textSecondary }]}>Full Name</Text>
                  {isEditing ? (
                    <TextInput
                      style={[styles.editInput, { color: theme.textPrimary, borderColor: theme.borderSub }]}
                      value={editForm.fullName}
                      onChangeText={(text) => setEditForm({ ...editForm, fullName: text })}
                      placeholder="Enter full name"
                      placeholderTextColor={theme.textMuted}
                    />
                  ) : (
                    <Text style={[styles.settingValue, { color: theme.textPrimary }]}>{ownerName}</Text>
                  )}
                </View>
              </View>
              {!isEditing && <ChevronRight color={theme.textSecondary} size={18} />}
            </TouchableOpacity>

            <View style={styles.settingRow}>
              <View style={styles.settingRowLeft}>
                <View style={[styles.settingIconBox, { backgroundColor: 'rgba(41, 182, 246, 0.12)' }]}>
                  <Mail color="#29B6F6" size={18} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: theme.textSecondary }]}>Email Address</Text>
                  <Text style={[styles.settingValue, { color: theme.textPrimary }]}>{ownerEmail}</Text>
                  {isEditing && <Text style={{ color: theme.textMuted, fontSize: 10, marginTop: 2 }}>Email cannot be changed here.</Text>}
                </View>
              </View>
            </View>

            <View style={[styles.settingRow, !isEditing && { borderBottomWidth: 0 }]}>
              <View style={styles.settingRowLeft}>
                <View style={[styles.settingIconBox, { backgroundColor: 'rgba(0, 230, 118, 0.12)' }]}>
                  <Phone color="#00E676" size={18} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: theme.textSecondary }]}>Phone Number</Text>
                  <Text style={[styles.settingValue, { color: theme.textPrimary }]}>{ownerPhone}</Text>
                  {isEditing && <Text style={{ color: theme.textMuted, fontSize: 10, marginTop: 2 }}>Phone cannot be changed here.</Text>}
                </View>
              </View>
            </View>

            {/* Country */}
            <View style={[styles.settingRow, { borderBottomWidth: 1, borderColor: theme.borderFaint }]}>
              <View style={styles.settingRowLeft}>
                <View style={[styles.settingIconBox, { backgroundColor: 'rgba(255, 152, 0, 0.12)' }]}>
                  <MapPin color="#FF9800" size={18} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: theme.textSecondary }]}>Country</Text>
                  {isEditing ? (
                    <TextInput
                      style={[styles.editInput, { color: theme.textPrimary, borderColor: theme.borderSub }]}
                      value={editForm.country}
                      onChangeText={(text) => setEditForm({ ...editForm, country: text })}
                      placeholder="Enter country"
                      placeholderTextColor={theme.textMuted}
                    />
                  ) : (
                    <Text style={[styles.settingValue, { color: theme.textPrimary }]}>{currentUser?.country || storedUser?.country || 'Not set'}</Text>
                  )}
                </View>
              </View>
            </View>

            {/* State */}
            <View style={[styles.settingRow, { borderBottomWidth: isEditing ? 1 : 0, borderColor: theme.borderFaint }]}>
              <View style={styles.settingRowLeft}>
                <View style={[styles.settingIconBox, { backgroundColor: 'rgba(255, 152, 0, 0.12)' }]}>
                  <MapPin color="#FF9800" size={18} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: theme.textSecondary }]}>State/Province</Text>
                  {isEditing ? (
                    <TextInput
                      style={[styles.editInput, { color: theme.textPrimary, borderColor: theme.borderSub }]}
                      value={editForm.state}
                      onChangeText={(text) => setEditForm({ ...editForm, state: text })}
                      placeholder="Enter state"
                      placeholderTextColor={theme.textMuted}
                    />
                  ) : (
                    <Text style={[styles.settingValue, { color: theme.textPrimary }]}>{currentUser?.state || storedUser?.state || 'Not set'}</Text>
                  )}
                </View>
              </View>
            </View>

            {/* Avatar Picker */}
            {isEditing && (
              <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
                <View style={styles.settingRowLeft}>
                  <View style={[styles.settingIconBox, { backgroundColor: 'rgba(178, 102, 255, 0.12)' }]}>
                    <ImageIcon color="#B266FF" size={18} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.settingLabel, { color: theme.textSecondary, marginBottom: 8 }]}>Profile Image (Optional)</Text>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {editForm.avatar ? (
                        <Image source={{ uri: editForm.avatar }} style={{ width: 50, height: 50, borderRadius: 25, marginRight: 12, borderWidth: 1, borderColor: theme.borderSub }} />
                      ) : (
                        <View style={{ width: 50, height: 50, borderRadius: 25, marginRight: 12, backgroundColor: theme.bgCardAlt, borderWidth: 1, borderColor: theme.borderSub, justifyContent: 'center', alignItems: 'center' }}>
                          <User color={theme.textMuted} size={24} />
                        </View>
                      )}
                      
                      <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity 
                          style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(0, 191, 165, 0.1)', borderRadius: 6, borderWidth: 1, borderColor: '#00BFA5' }}
                          onPress={handlePickImage}
                        >
                          <Text style={{ color: '#00BFA5', fontSize: 12, fontWeight: '600' }}>
                            {editForm.avatar ? 'Change Image' : 'Select Image'}
                          </Text>
                        </TouchableOpacity>
                        
                        {!!editForm.avatar && (
                          <TouchableOpacity 
                            style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(255, 82, 82, 0.1)', borderRadius: 6, borderWidth: 1, borderColor: '#FF5252' }}
                            onPress={handleRemoveImage}
                          >
                            <Text style={{ color: '#FF5252', fontSize: 12, fontWeight: '600' }}>Remove</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {isEditing && (
              <View style={styles.editActionRow}>
                <TouchableOpacity style={[styles.editActionBtn, styles.editCancelBtn]} onPress={handleCancelEdit} disabled={isSaving}>
                  <Text style={styles.editCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.editActionBtn, styles.editSaveBtn, { backgroundColor: theme.accent }]} onPress={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.editSaveText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* 8. My Device (Owner's Wearable Only) */}
        <View style={[styles.sectionCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>My Device</Text>
          <TouchableOpacity
            style={[styles.deviceRow, { backgroundColor: theme.bgCardAlt, borderColor: theme.borderSub }]}
            onPress={() => navigation?.navigate('Device')}
            activeOpacity={0.75}
          >
            <View style={styles.deviceRowLeft}>
              <View style={styles.deviceIconBox}>
                <Watch color={theme.accent} size={24} />
              </View>
              <View style={styles.deviceTextCol}>
                <Text style={[styles.deviceBandName, { color: theme.textPrimary }]}>{ownerName}'s Band</Text>
                <View style={styles.deviceStatusSub}>
                  <View style={styles.greenStatusDot} />
                  <Text style={styles.deviceStatusLabel}>
                    Connected • {ownerBattery}% Battery
                  </Text>
                </View>
              </View>
            </View>
            <ChevronRight color={theme.textSecondary} size={18} />
          </TouchableOpacity>
        </View>

        {/* 9. Account Settings */}
        <View style={[styles.sectionCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Account & Security</Text>
          <View style={[styles.settingsList, { backgroundColor: theme.bgCardAlt, borderColor: theme.borderFaint }]}>
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
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Password & Security</Text>
                  <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>Credentials & authentication</Text>
                </View>
              </View>
              <ChevronRight color={theme.textSecondary} size={18} />
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
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Notifications</Text>
                  <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>Alerts & goal reminders</Text>
                </View>
              </View>
              <ChevronRight color={theme.textSecondary} size={18} />
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
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Privacy & Encryption</Text>
                  <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>Protected biometric telemetry</Text>
                </View>
              </View>
              <ChevronRight color={theme.textSecondary} size={18} />
            </TouchableOpacity>

            {/* Theme Toggle Row */}
            <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
              <View style={styles.settingRowLeft}>
                <View style={[styles.settingIconBox, { backgroundColor: isDark ? 'rgba(122,158,168,0.12)' : 'rgba(255,179,0,0.12)' }]}>
                  <Settings color={isDark ? '#8FAAB2' : '#FFB300'} size={18} />
                </View>
                <View>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>{isDark ? 'Dark Mode' : 'Light Mode'}</Text>
                  <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>{isDark ? 'Tap to switch to Light' : 'Tap to switch to Dark'}</Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: 'rgba(122,158,168,0.25)', true: theme.accent }}
                thumbColor={isDark ? '#FFFFFF' : '#8FAAB2'}
              />
            </View>
          </View>
        </View>


        {/* 10. Help & Support */}
        <View style={[styles.sectionCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Help & Support</Text>
          <View style={[styles.settingsList, { backgroundColor: theme.bgCardAlt, borderColor: theme.borderFaint }]}>
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
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Help Center</Text>
                  <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>User guides & troubleshooting</Text>
                </View>
              </View>
              <ChevronRight color={theme.textSecondary} size={18} />
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
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Contact Support</Text>
                  <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>24/7 customer care</Text>
                </View>
              </View>
              <ChevronRight color={theme.textSecondary} size={18} />
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
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>About HandBand</Text>
                  <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>Version 1.0.0</Text>
                </View>
              </View>
              <ChevronRight color={theme.textSecondary} size={18} />
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
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 46,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
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
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
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
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 12,
  },

  // Settings List
  settingsList: {
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
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
    fontSize: 12,
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  editInput: {
    borderBottomWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 0,
    fontSize: 14,
    fontWeight: '600',
  },
  editActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  editActionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editCancelBtn: {
    backgroundColor: 'rgba(122, 158, 168, 0.1)',
  },
  editCancelText: {
    color: '#8FAAB2',
    fontWeight: '600',
    fontSize: 14,
  },
  editSaveBtn: {
    backgroundColor: '#00BFA5',
  },
  editSaveText: {
    color: '#001F27',
    fontWeight: '700',
    fontSize: 14,
  },
  settingTitle: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  settingSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },

  // 8. My Device Row
  deviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
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
