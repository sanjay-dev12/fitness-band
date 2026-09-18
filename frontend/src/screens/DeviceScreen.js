import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import {
  HelpCircle,
  Plus,
  Watch,
  Battery,
  Bluetooth,
  Unlink,
  ChevronRight,
} from 'lucide-react-native';
import { useProfile } from '../context/ProfileContext';
import { useTheme } from '../context/ThemeContext';
import { showLocalNotification } from '../services/notificationService';
import {
  checkHealthPermissions,
  requestHealthPermissions,
  checkHealthConnectAvailability,
} from '../modules/health/health.service';
import { formatConnectedDateTime } from '../utils/dateUtils';

export default function DeviceScreen({ navigation }) {
  const {
    activeProfile,
    profiles,
    switchProfile,
    showModal,
    showToast,
    isBluetoothConnected,
    toggleBluetooth,
    lastSyncedTime,
    isBandConnected,
    setBandConnected,
  } = useProfile();
  const { theme } = useTheme();

  const isWeb = Platform.OS === 'web';
  const [isDeviceBound, setIsDeviceBound] = useState(!isWeb && isBluetoothConnected);
  const batteryLevel = isDeviceBound && activeProfile?.battery !== null && activeProfile?.battery !== undefined ? activeProfile.battery : null;

  const [syncStatus, setSyncStatus] = useState('ready'); // 'ready' | 'syncing' | 'success' | 'permission_required' | 'error'

  // Ref to track previous connection state to trigger notification only on false -> true transition
  const prevConnectedRef = React.useRef(isBandConnected);

  React.useEffect(() => {
    if (!prevConnectedRef.current && isBandConnected) {
      // Transition from disconnected to connected
      showLocalNotification('Band Connected', 'Your Hand Band is connected successfully.');
    }
    prevConnectedRef.current = isBandConnected;
  }, [isBandConnected]);

  const formatLastSynced = (date) => {
    if (!date) return 'Not synced yet';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Not synced yet';
    const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    const isToday = d.toDateString() === new Date().toDateString();
    return isToday ? `Today, ${timeStr}` : `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
  };

  const handleSyncNow = async () => {
    if (syncStatus === 'syncing') return;

    if (!isBandConnected) {
      if (showToast) {
        showToast('Please connect your health band first', 'error');
      }
      return;
    }

    setSyncStatus('syncing');

    try {
      // 1. Verify health permissions
      const perms = await checkHealthPermissions();
      if (!perms.hasHeartRate) {
        const req = await requestHealthPermissions();
        if (!req.granted) {
          setSyncStatus('permission_required');
          if (showToast) {
            showToast('Health data permission required to read telemetry', 'error');
          }
          return;
        }
      }

      // 2. Perform synchronization
      const res = await syncHealthData();
      if (res?.success) {
        setSyncStatus('success');
        if (showToast) {
          showToast('Health data synced successfully', 'success');
        }
        // Return to ready after 4 seconds
        setTimeout(() => {
          setSyncStatus((cur) => (cur === 'success' ? 'ready' : cur));
        }, 4000);
      } else if (res?.permissionRequired) {
        setSyncStatus('permission_required');
        if (showToast) {
          showToast('Health data permission required', 'error');
        }
      } else {
        setSyncStatus('error');
        if (showToast) {
          showToast(res?.error || 'Unable to sync health data', 'error');
        }
      }
    } catch (e) {
      setSyncStatus('error');
      if (showToast) {
        showToast(e.message || 'Unable to sync health data', 'error');
      }
    }
  };

  const handleRemoveDevice = () => {
    if (showModal) {
      showModal({
        title: 'Remove Device',
        message: `Are you sure you want to unpair ${activeProfile?.name || 'this'}'s Band? Your wearable will be disconnected until re-paired.`,
        type: 'error',
        confirmText: 'Remove Device',
        onConfirm: () => {
          setBandConnected(false);
          if (showToast) {
            showToast('Device removed from your account', 'info');
          }
        },
      });
    } else {
      setBandConnected(false);
    }
  };

  const handleAddDevicePress = () => {
    if (!isDeviceBound) {
      setIsDeviceBound(true);
      setBandConnected(true);
      if (showToast) {
        showToast('Band connected successfully via Bluetooth', 'success');
      }
    } else if (navigation) {
      navigation.navigate('FamilySetup');
    }
  };

  const handleConnectionSettings = () => {
    if (showModal) {
      showModal({
        title: 'Connection Settings',
        message: `Protocol: Bluetooth Low Energy (BLE 5.2)\nStatus: ${isBluetoothConnected ? 'Connected & Active' : 'Disconnected (Off)'}\nAuto-Reconnect: Enabled\nSignal Strength: -64 dBm (Strong)`,
        type: 'info',
        confirmText: 'Got It',
      });
    }
  };

  const handleHelpPress = () => {
    if (showModal) {
      showModal({
        title: 'Wearable Assistance',
        message: '1. Keep Bluetooth enabled on your phone.\n2. Wear the band snugly above your wrist bone for accurate optical sensor readings.\n3. Charge when battery falls below 20%.',
        type: 'info',
        confirmText: 'Close',
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* 3. Header */}
      <View style={[styles.header, { backgroundColor: theme.bgCard, borderBottomColor: theme.borderSub }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Devices</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Manage your connected health bands</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleHelpPress}
            activeOpacity={0.7}
          >
            <HelpCircle color={theme.textSecondary} size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleAddDevicePress}
            activeOpacity={0.7}
          >
            <Plus color="#00BFA5" size={22} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 4. Connection Status */}
        <View style={[styles.statusCard, (!isDeviceBound || !isBluetoothConnected) && styles.statusCardDisconnected]}>
          <View style={styles.statusCardLeft}>
            <View style={[
              styles.statusDot,
              !isDeviceBound && styles.statusDotDisconnected,
              isDeviceBound && !isBluetoothConnected && { backgroundColor: '#FF5252' }
            ]} />
            <View style={styles.statusTextCol}>
              <Text style={styles.statusTitle}>
                {!isDeviceBound ? 'No Device Connected' : (!isBluetoothConnected ? 'Bluetooth Disconnected' : 'Band Connected')}
              </Text>
              <Text style={styles.statusSubtitle}>
                {!isDeviceBound
                  ? 'Connect a band to manage your device'
                  : (!isBluetoothConnected
                    ? 'Data calculation stopped while Bluetooth is OFF'
                    : `Connected • ${formatConnectedDateTime(lastSyncedTime)}`)}
              </Text>
            </View>
          </View>
          <View style={[
            styles.statusPill,
            (!isDeviceBound || !isBluetoothConnected) && styles.statusPillDisconnected,
            isDeviceBound && !isBluetoothConnected && { backgroundColor: 'rgba(255, 82, 82, 0.15)' }
          ]}>
            <Text style={[
              styles.statusPillText,
              (!isDeviceBound || !isBluetoothConnected) && styles.statusPillTextDisconnected,
              isDeviceBound && !isBluetoothConnected && { color: '#FF8A80' }
            ]}>
              {!isDeviceBound ? 'Offline' : (!isBluetoothConnected ? 'Paused' : 'Connected')}
            </Text>
          </View>
        </View>

        {isBandConnected ? (
          <>
            {/* 5. Connected Device Card */}
            <View style={styles.deviceCard}>
              <View style={styles.deviceCardHeader}>
                <View style={styles.deviceAvatarRing}>
                  <Watch color={isBluetoothConnected ? "#00BFA5" : "#8FAAB2"} size={28} />
                </View>
                <View style={styles.deviceMainInfo}>
                  <Text style={styles.deviceName} numberOfLines={1}>
                    {activeProfile?.name}'s Band
                  </Text>
                  <View style={styles.deviceSubRow}>
                    <View style={[styles.onlineDot, !isBluetoothConnected && { backgroundColor: '#FF5252' }]} />
                    <Text style={[styles.connectedText, !isBluetoothConnected && { color: '#FF8A80' }]}>
                      {isBluetoothConnected ? `Connected • ${formatConnectedDateTime(lastSyncedTime)}` : 'Bluetooth Off (Calculation Stopped)'}
                    </Text>
                  </View>
                </View>

                {/* Quick Bluetooth Toggle Button */}
                <TouchableOpacity
                  style={[
                    styles.btToggleBtn,
                    isBluetoothConnected ? styles.btToggleBtnOn : styles.btToggleBtnOff
                  ]}
                  onPress={() => toggleBluetooth?.()}
                  activeOpacity={0.7}
                >
                  <Bluetooth color={isBluetoothConnected ? "#001F27" : "#FFFFFF"} size={13} style={{ marginRight: 4 }} />
                  <Text style={[styles.btToggleBtnText, { color: isBluetoothConnected ? "#001F27" : "#FFFFFF" }]}>
                    {isBluetoothConnected ? 'BLE ON' : 'BLE OFF'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 6 & 7. Battery and Connection Status Grid */}
              <View style={styles.deviceStatsGrid}>
                <View style={styles.deviceStatTile}>
                  <View style={styles.statTileHeader}>
                    <Battery color="#00BFA5" size={16} />
                    <Text style={styles.statTileLabel}>Battery</Text>
                  </View>
                  <Text style={styles.statTileValue}>{batteryLevel !== null ? `${batteryLevel}%` : '--'}</Text>
                  <Text style={styles.statTileSub}>{batteryLevel !== null ? 'Normal health' : 'No data'}</Text>
                </View>

                <View style={styles.deviceStatTile}>
                  <View style={styles.statTileHeader}>
                    <Bluetooth color={isBluetoothConnected ? "#00E676" : "#8FAAB2"} size={16} />
                    <Text style={styles.statTileLabel}>Connection</Text>
                  </View>
                  <Text style={styles.statTileValue}>{isBluetoothConnected ? 'BLE 5.2' : 'Offline'}</Text>
                  <Text style={styles.statTileSub}>{isBluetoothConnected ? formatConnectedDateTime(lastSyncedTime, true) : 'Disconnected'}</Text>
                </View>
              </View>
            </View>

            {/* 8. Device Information */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionCardTitle}>Device Information</Text>
              <View style={styles.infoList}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Device Name</Text>
                  <Text style={styles.infoValue}>{activeProfile?.name}'s Band</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Connection Day & Time</Text>
                  <Text style={styles.infoValue}>{formatConnectedDateTime(lastSyncedTime)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Protocol</Text>
                  <Text style={styles.infoValue}>Bluetooth Low Energy 5.2</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Battery Level</Text>
                  <Text style={styles.infoValue}>{batteryLevel !== null ? `${batteryLevel}%` : '--'}</Text>
                </View>
                <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.infoLabel}>Hardware Sensors</Text>
                  <Text style={styles.infoValue}>Optical PPG & Accelerometer</Text>
                </View>
              </View>
            </View>

            {/* 9. Device Management Actions */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionCardTitle}>Device Management</Text>

              {/* Bluetooth Switch */}
              <View style={styles.actionRow}>
                <View style={styles.actionRowLeft}>
                  <View style={[styles.actionIconBox, { backgroundColor: isBluetoothConnected ? 'rgba(0, 191, 165, 0.12)' : 'rgba(255, 82, 82, 0.12)' }]}>
                    <Bluetooth color={isBluetoothConnected ? "#00BFA5" : "#FF5252"} size={18} />
                  </View>
                  <View>
                    <Text style={styles.actionTitle}>Bluetooth Connection</Text>
                    <Text style={styles.actionSubtitle}>
                      {isBluetoothConnected ? 'Band connected & transmitting' : 'Bluetooth off — Band disconnected'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isBluetoothConnected}
                  onValueChange={(val) => toggleBluetooth?.(val)}
                  trackColor={{ false: '#37474F', true: 'rgba(0, 191, 165, 0.4)' }}
                  thumbColor={isBluetoothConnected ? '#00BFA5' : '#8FAAB2'}
                />
              </View>

              {/* Connection Settings */}
              <TouchableOpacity
                style={styles.actionRow}
                onPress={handleConnectionSettings}
                activeOpacity={0.7}
              >
                <View style={styles.actionRowLeft}>
                  <View style={[styles.actionIconBox, { backgroundColor: 'rgba(0, 191, 165, 0.12)' }]}>
                    <HelpCircle color="#00BFA5" size={18} />
                  </View>
                  <View>
                    <Text style={styles.actionTitle}>Connection Settings</Text>
                    <Text style={styles.actionSubtitle}>BLE protocol, MTU & signal diagnostics</Text>
                  </View>
                </View>
                <ChevronRight color="#8FAAB2" size={18} />
              </TouchableOpacity>

              {/* Remove Device */}
              <TouchableOpacity
                style={[styles.actionRow, styles.dangerActionRow]}
                onPress={handleRemoveDevice}
                activeOpacity={0.7}
              >
                <View style={styles.actionRowLeft}>
                  <View style={[styles.actionIconBox, { backgroundColor: 'rgba(255, 75, 75, 0.12)' }]}>
                    <Unlink color="#FF5252" size={18} />
                  </View>
                  <View>
                    <Text style={[styles.actionTitle, { color: '#FF5252' }]}>Remove Device</Text>
                    <Text style={styles.actionSubtitle}>Unpair and disconnect wearable</Text>
                  </View>
                </View>
                <ChevronRight color="#FF5252" size={18} />
              </TouchableOpacity>
            </View>

            {/* 13. Multiple Family Devices */}
            {profiles && profiles.length > 1 && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionCardTitle}>Family Circle Devices</Text>
                <View style={styles.familyBandsList}>
                  {profiles.map((p) => {
                    const isCurrent = p.id === activeProfile?.id;
                    return (
                      <TouchableOpacity
                        key={p.id}
                        style={[styles.familyBandRow, isCurrent && styles.familyBandRowActive]}
                        onPress={() => switchProfile(p.id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.familyBandLeft}>
                          <View
                            style={[
                              styles.bandStatusDot,
                              { backgroundColor: isCurrent ? '#00E676' : '#8FAAB2' },
                            ]}
                          />
                          <View>
                            <Text style={[styles.familyBandName, isCurrent && styles.familyBandNameActive]}>
                              {p.name}'s Band
                            </Text>
                            <Text style={styles.familyBandRole}>
                              {p.role || 'Member'} • {p.battery || 88}% Battery
                            </Text>
                          </View>
                        </View>
                        <View style={[styles.familyBandBadge, isCurrent && styles.familyBandBadgeActive]}>
                          <Text style={[styles.familyBandBadgeText, isCurrent && styles.familyBandBadgeTextActive]}>
                            {isCurrent ? 'Active' : 'Standby'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </>
        ) : (
          /* 11. No Device Empty State */
          <View style={styles.emptyStateCard}>
            <View style={styles.emptyIconBox}>
              <Watch color="#00BFA5" size={40} />
            </View>
            <Text style={styles.emptyTitle}>No device connected</Text>
            <Text style={styles.emptySubtitle}>
              Connect your health band to start syncing your activity and health data.
            </Text>
            <TouchableOpacity
              style={styles.addDeviceBtn}
              onPress={handleAddDevicePress}
              activeOpacity={0.85}
            >
              <Plus color="#001F27" size={20} style={{ marginRight: 8 }} />
              <Text style={styles.addDeviceBtnText}>Add Device</Text>
            </TouchableOpacity>
            <Text style={styles.emptyBluetoothHint}>
              Make sure Bluetooth is enabled on your phone.
            </Text>
          </View>
        )}
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
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
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
    paddingBottom: 100, // Space so bottom navigation never covers content
  },

  // Connection Status Card
  statusCard: {
    backgroundColor: '#002B36',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 165, 0.22)',
  },
  statusCardDisconnected: {
    borderColor: 'rgba(122, 158, 168, 0.18)',
  },
  statusCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00E676',
    marginRight: 10,
  },
  statusDotDisconnected: {
    backgroundColor: '#8FAAB2',
  },
  statusTextCol: {
    flex: 1,
  },
  statusTitle: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  statusSubtitle: {
    color: '#8FAAB2',
    fontSize: 11.5,
    marginTop: 1,
  },
  statusPill: {
    backgroundColor: 'rgba(0, 230, 118, 0.14)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  statusPillDisconnected: {
    backgroundColor: 'rgba(122, 158, 168, 0.12)',
    borderColor: 'rgba(122, 158, 168, 0.25)',
  },
  statusPillText: {
    color: '#00E676',
    fontSize: 10.5,
    fontWeight: '700',
  },
  statusPillTextDisconnected: {
    color: '#8FAAB2',
  },

  // Connected Device Card
  deviceCard: {
    backgroundColor: '#002B36',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.18)',
  },
  deviceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  deviceAvatarRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0, 191, 165, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 191, 165, 0.35)',
  },
  deviceMainInfo: {
    flex: 1,
  },
  deviceName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 3,
  },
  deviceSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E676',
    marginRight: 5,
  },
  connectedText: {
    color: '#00E676',
    fontSize: 11.5,
    fontWeight: '600',
  },
  btToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  btToggleBtnOn: {
    backgroundColor: '#00BFA5',
  },
  btToggleBtnOff: {
    backgroundColor: '#C62828',
  },
  btToggleBtnText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Stats Grid
  deviceStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  deviceStatTile: {
    flex: 1,
    backgroundColor: '#00222B',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.1)',
  },
  statTileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  statTileLabel: {
    color: '#8FAAB2',
    fontSize: 11.5,
    fontWeight: '600',
  },
  statTileValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  statTileSub: {
    color: '#6A8791',
    fontSize: 10.5,
    marginTop: 2,
  },

  // Sync Button
  syncButton: {
    backgroundColor: '#00BFA5',
    height: 50,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00BFA5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  syncButtonDisabled: {
    opacity: 0.7,
  },
  syncButtonPermission: {
    backgroundColor: '#FF9800',
    shadowColor: '#FF9800',
  },
  syncButtonError: {
    backgroundColor: '#FF5252',
    shadowColor: '#FF5252',
  },
  syncButtonText: {
    color: '#001F27',
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: 0.2,
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
  sectionCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    marginBottom: 12,
  },

  // Info List
  infoList: {
    backgroundColor: '#00222B',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.08)',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(122, 158, 168, 0.08)',
  },
  infoLabel: {
    color: '#8FAAB2',
    fontSize: 12.5,
    fontWeight: '500',
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },

  // Action Rows
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#00222B',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.08)',
  },
  dangerActionRow: {
    borderColor: 'rgba(255, 75, 75, 0.2)',
  },
  actionRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '600',
  },
  actionSubtitle: {
    color: '#8FAAB2',
    fontSize: 11,
    marginTop: 1,
  },

  // Family Circle Devices List
  familyBandsList: {
    gap: 8,
  },
  familyBandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#00222B',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.08)',
  },
  familyBandRowActive: {
    borderColor: 'rgba(0, 191, 165, 0.35)',
    backgroundColor: 'rgba(0, 191, 165, 0.06)',
  },
  familyBandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bandStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  familyBandName: {
    color: '#8FAAB2',
    fontSize: 13,
    fontWeight: '600',
  },
  familyBandNameActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  familyBandRole: {
    color: '#6A8791',
    fontSize: 10.5,
    marginTop: 1,
  },
  familyBandBadge: {
    backgroundColor: 'rgba(122, 158, 168, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  familyBandBadgeActive: {
    backgroundColor: 'rgba(0, 230, 118, 0.14)',
  },
  familyBandBadgeText: {
    color: '#8FAAB2',
    fontSize: 10,
    fontWeight: '600',
  },
  familyBandBadgeTextActive: {
    color: '#00E676',
    fontWeight: '700',
  },

  // 11. Empty State
  emptyStateCard: {
    backgroundColor: '#002B36',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.16)',
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 191, 165, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 165, 0.3)',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8FAAB2',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  addDeviceBtn: {
    backgroundColor: '#00BFA5',
    width: '100%',
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#00BFA5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  addDeviceBtnText: {
    color: '#001F27',
    fontSize: 16,
    fontWeight: '800',
  },
  emptyBluetoothHint: {
    fontSize: 11.5,
    color: '#6A8791',
    textAlign: 'center',
  },

  // Connected Health Card
  connectedHealthCard: {
    backgroundColor: '#002B36',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 165, 0.25)',
  },
  connectedHealthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  connectedHealthLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  connectedHealthIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 191, 165, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 165, 0.3)',
  },
  connectedHealthTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  connectedHealthSub: {
    color: '#8FAAB2',
    fontSize: 11,
    marginTop: 1,
  },
  connectedHealthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  connectedHealthBadgeText: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: '700',
  },
  connectedHealthDesc: {
    color: '#8FAAB2',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },
  connectedHealthButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  openDashboardButton: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 191, 165, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 165, 0.3)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  openDashboardButtonText: {
    color: '#00BFA5',
    fontSize: 12.5,
    fontWeight: '700',
  },
  quickSyncSmallButton: {
    height: 42,
    borderRadius: 12,
    backgroundColor: '#00BFA5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  quickSyncSmallButtonText: {
    color: '#001F27',
    fontSize: 12.5,
    fontWeight: '700',
  },
});
