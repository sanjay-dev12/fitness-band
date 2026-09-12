import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  HelpCircle,
  Plus,
  Watch,
  Battery,
  RefreshCw,
  Bluetooth,
  Unlink,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react-native';
import { useProfile } from '../context/ProfileContext';

export default function DeviceScreen({ navigation }) {
  const {
    activeProfile,
    profiles,
    switchProfile,
    showModal,
    showToast,
    syncHealthTelemetry,
  } = useProfile();

  const [isDeviceBound, setIsDeviceBound] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedText, setLastSyncedText] = useState('Just now');

  const batteryLevel = activeProfile?.battery || 98;

  const handleSyncNow = async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    try {
      const m = activeProfile?.metrics || {};
      const payload = {
        heartRate: m.heartRate || 72,
        oxygenLevel: m.oxygen || 98,
        steps: m.steps || 0,
        calories: m.calories || 0,
        exerciseMins: m.exerciseMins || 0,
        walkingHours: m.walkingHours || 0,
        battery: batteryLevel,
        sleepDuration: m.sleepDuration || null,
        statusText: 'Synchronized',
      };

      if (syncHealthTelemetry) {
        await syncHealthTelemetry(payload);
      }
      setLastSyncedText('Just now');
      if (showToast) {
        showToast('Health telemetry synchronized with server', 'success');
      }
    } catch (e) {
      if (showToast) {
        showToast(e.message || 'Sync failed', 'error');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRemoveDevice = () => {
    if (showModal) {
      showModal({
        title: 'Remove Device',
        message: `Are you sure you want to unpair ${activeProfile?.name || 'this'}'s Band? Your wearable will no longer sync activity data until reconnected.`,
        type: 'error',
        confirmText: 'Remove Device',
        onConfirm: () => {
          setIsDeviceBound(false);
          if (showToast) {
            showToast('Device removed from your account', 'info');
          }
        },
      });
    } else {
      setIsDeviceBound(false);
    }
  };

  const handleAddDevicePress = () => {
    if (!isDeviceBound) {
      setIsDeviceBound(true);
      setLastSyncedText('Just now');
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
        message: 'Protocol: Bluetooth Low Energy (BLE 5.2)\nAuto-Sync: Enabled (every 15 min)\nBackground Telemetry: Active\nStatus: Connected',
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
    <View style={styles.container}>
      {/* 3. Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Devices</Text>
          <Text style={styles.headerSubtitle}>Manage your connected health bands</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleHelpPress}
            activeOpacity={0.7}
          >
            <HelpCircle color="#8FAAB2" size={20} />
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
        <View style={[styles.statusCard, !isDeviceBound && styles.statusCardDisconnected]}>
          <View style={styles.statusCardLeft}>
            <View style={[styles.statusDot, !isDeviceBound && styles.statusDotDisconnected]} />
            <View style={styles.statusTextCol}>
              <Text style={styles.statusTitle}>
                {isDeviceBound ? 'Band Connected' : 'No Device Connected'}
              </Text>
              <Text style={styles.statusSubtitle}>
                {isDeviceBound
                  ? isSyncing
                    ? 'Synchronizing health telemetry...'
                    : 'Syncing your health data'
                  : 'Connect a band to sync your telemetry'}
              </Text>
            </View>
          </View>
          <View style={[styles.statusPill, !isDeviceBound && styles.statusPillDisconnected]}>
            <Text style={[styles.statusPillText, !isDeviceBound && styles.statusPillTextDisconnected]}>
              {isDeviceBound ? (isSyncing ? 'Syncing' : 'Connected') : 'Offline'}
            </Text>
          </View>
        </View>

        {isDeviceBound ? (
          <>
            {/* 5. Connected Device Card */}
            <View style={styles.deviceCard}>
              <View style={styles.deviceCardHeader}>
                <View style={styles.deviceAvatarRing}>
                  <Watch color="#00BFA5" size={28} />
                </View>
                <View style={styles.deviceMainInfo}>
                  <Text style={styles.deviceName} numberOfLines={1}>
                    {activeProfile?.name}'s Band
                  </Text>
                  <View style={styles.deviceSubRow}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.connectedText}>Connected via Bluetooth</Text>
                  </View>
                </View>
              </View>

              {/* 6 & 7. Battery and Last Sync Stats Grid */}
              <View style={styles.deviceStatsGrid}>
                <View style={styles.deviceStatTile}>
                  <View style={styles.statTileHeader}>
                    <Battery color="#00BFA5" size={16} />
                    <Text style={styles.statTileLabel}>Battery</Text>
                  </View>
                  <Text style={styles.statTileValue}>{batteryLevel}%</Text>
                  <Text style={styles.statTileSub}>Normal health</Text>
                </View>

                <View style={styles.deviceStatTile}>
                  <View style={styles.statTileHeader}>
                    <RefreshCw color="#29B6F6" size={16} />
                    <Text style={styles.statTileLabel}>Last Synced</Text>
                  </View>
                  <Text style={styles.statTileValue}>{lastSyncedText}</Text>
                  <Text style={styles.statTileSub}>Telemetry active</Text>
                </View>
              </View>

              {/* 8. Sync Now Button */}
              <TouchableOpacity
                style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
                onPress={handleSyncNow}
                disabled={isSyncing}
                activeOpacity={0.8}
              >
                {isSyncing ? (
                  <>
                    <ActivityIndicator size="small" color="#001F27" style={{ marginRight: 8 }} />
                    <Text style={styles.syncButtonText}>Syncing Telemetry...</Text>
                  </>
                ) : (
                  <>
                    <RefreshCw color="#001F27" size={18} style={{ marginRight: 8 }} />
                    <Text style={styles.syncButtonText}>Sync Now</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* 9. Device Information */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionCardTitle}>Device Information</Text>
              <View style={styles.infoList}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Device Name</Text>
                  <Text style={styles.infoValue}>{activeProfile?.name}'s Band</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Connection</Text>
                  <Text style={styles.infoValue}>Bluetooth Low Energy</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Battery Level</Text>
                  <Text style={styles.infoValue}>{batteryLevel}%</Text>
                </View>
                <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.infoLabel}>Real-Time Sensor</Text>
                  <Text style={styles.infoValue}>Heart Rate & SpO2 Active</Text>
                </View>
              </View>
            </View>

            {/* 10. Device Management Actions */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionCardTitle}>Device Management</Text>

              <TouchableOpacity
                style={styles.actionRow}
                onPress={handleConnectionSettings}
                activeOpacity={0.7}
              >
                <View style={styles.actionRowLeft}>
                  <View style={[styles.actionIconBox, { backgroundColor: 'rgba(0, 191, 165, 0.12)' }]}>
                    <Bluetooth color="#00BFA5" size={18} />
                  </View>
                  <View>
                    <Text style={styles.actionTitle}>Connection Settings</Text>
                    <Text style={styles.actionSubtitle}>Manage Bluetooth and auto-sync</Text>
                  </View>
                </View>
                <ChevronRight color="#8FAAB2" size={18} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionRow}
                onPress={handleSyncNow}
                activeOpacity={0.7}
              >
                <View style={styles.actionRowLeft}>
                  <View style={[styles.actionIconBox, { backgroundColor: 'rgba(41, 182, 246, 0.12)' }]}>
                    <RefreshCw color="#29B6F6" size={18} />
                  </View>
                  <View>
                    <Text style={styles.actionTitle}>Sync Health Data</Text>
                    <Text style={styles.actionSubtitle}>Force immediate telemetry update</Text>
                  </View>
                </View>
                <ChevronRight color="#8FAAB2" size={18} />
              </TouchableOpacity>

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
});
