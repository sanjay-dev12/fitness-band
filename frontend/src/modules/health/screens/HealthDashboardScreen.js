import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {
  ArrowLeft,
  Activity,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  Footprints,
  Flame,
  Moon,
  Droplets,
  Zap,
  Compass,
} from 'lucide-react-native';
import HeartRateCard from '../components/HeartRateCard';
import {
  checkHealthConnectAvailability,
  checkHealthPermissions,
  requestHealthPermissions,
  getHeartRateData,
  openSettings,
  HEALTH_CONNECT_STATUS,
} from '../health.service';
import { useProfile } from '../../../context/ProfileContext';

export default function HealthDashboardScreen({ navigation }) {
  const {
    activeProfile,
    syncHealthData,
    lastSyncedTime,
    refreshHealthData,
    showModal,
    showToast,
  } = useProfile();
  const m = activeProfile?.metrics || {};

  const [isAvailable, setIsAvailable] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [heartRateData, setHeartRateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('ready'); // 'ready' | 'syncing' | 'success' | 'permission_required' | 'error'
  const [error, setError] = useState(null);

  const formatLastSynced = (date) => {
    if (!date) return 'Not synced yet';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Not synced yet';
    const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    const isToday = d.toDateString() === new Date().toDateString();
    return isToday ? `Today, ${timeStr}` : `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
  };

  /**
   * Load and verify Health Connect status and Heart Rate readings
   */
  const loadHealthData = useCallback(async (isUserRefresh = false) => {
    if (isUserRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const availability = await checkHealthConnectAvailability();
      if (!availability.isAvailable) {
        setIsAvailable(false);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      setIsAvailable(true);

      const perms = await checkHealthPermissions();
      setPermissionGranted(perms.hasHeartRate);

      if (!perms.hasHeartRate) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const hrResult = await getHeartRateData();
      if (hrResult.hasData && hrResult.latest) {
        setHeartRateData(hrResult.latest);
      } else {
        setHeartRateData(null);
      }
    } catch (err) {
      setError(err.message || 'Unable to read health data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHealthData(false);
  }, [loadHealthData]);

  // Request permission handler
  const handleRequestPermission = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await requestHealthPermissions();
      if (res.granted) {
        setPermissionGranted(true);
        setSyncStatus('ready');
        await loadHealthData(false);
      } else {
        setPermissionGranted(false);
        setSyncStatus('permission_required');
      }
    } catch (err) {
      setError(err.message || 'Permission request failed');
    } finally {
      setLoading(false);
    }
  };

  // Sync health data action
  const handleSyncHealthData = async () => {
    if (syncStatus === 'syncing') return;
    setSyncStatus('syncing');
    setError(null);

    try {
      // 1. Verify Health Connect availability
      const avail = await checkHealthConnectAvailability();
      if (!avail.isAvailable) {
        setIsAvailable(false);
        setSyncStatus('error');
        if (showModal) {
          showModal({
            title: 'Health Connect Setup',
            message: avail.message || 'Health Connect is not available on this device.',
            type: 'warning',
            confirmText: 'Understood',
          });
        }
        setTimeout(() => setSyncStatus('ready'), 3500);
        return;
      }
      setIsAvailable(true);

      // 2. Check & request permissions if needed
      const perms = await checkHealthPermissions();
      if (!perms.hasHeartRate) {
        const reqRes = await requestHealthPermissions();
        if (!reqRes.granted) {
          setSyncStatus('permission_required');
          if (showModal) {
            showModal({
              title: 'Health Permission Required',
              message: 'Please grant read permissions for Steps, Heart Rate, Sleep, and SpO2 so Hand Band can synchronize your Pebble health data.',
              type: 'warning',
              confirmText: 'Open Settings',
              onConfirm: () => openSettings(),
            });
          }
          return;
        }
        setPermissionGranted(true);
      }

      // 3. Execute synchronized read & server push
      if (syncHealthData) {
        const res = await syncHealthData();
        if (res?.success) {
          setSyncStatus('success');
          await loadHealthData(false);
          if (refreshHealthData) {
            await refreshHealthData();
          }
          if (showToast) {
            showToast('Health data synchronized successfully', 'success');
          }
          setTimeout(() => setSyncStatus('ready'), 3500);
        } else if (res?.permissionRequired) {
          setSyncStatus('permission_required');
        } else {
          setSyncStatus('error');
          setError(res?.error || 'Synchronization failed');
          setTimeout(() => setSyncStatus('ready'), 4000);
        }
      }
    } catch (err) {
      setSyncStatus('error');
      setError(err.message || 'Synchronization failed');
      setTimeout(() => setSyncStatus('ready'), 4000);
    }
  };

  const handleRefresh = async () => {
    if (syncHealthData) {
      await syncHealthData();
    }
    await loadHealthData(true);
    if (refreshHealthData) {
      await refreshHealthData();
    }
  };

  const handleOpenSettings = () => {
    openSettings();
  };

  let statusText = 'Checking...';
  let statusColor = '#7A9EA8';
  let statusBg = 'rgba(122, 158, 168, 0.14)';

  if (!isAvailable) {
    statusText = 'Unavailable';
    statusColor = '#FFA726';
    statusBg = 'rgba(255, 167, 38, 0.14)';
  } else if (!permissionGranted) {
    statusText = 'Permission Required';
    statusColor = '#FF5252';
    statusBg = 'rgba(255, 82, 82, 0.14)';
  } else {
    statusText = 'Connected';
    statusColor = '#00BFA5';
    statusBg = 'rgba(0, 191, 165, 0.14)';
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#001F27" />
      <View style={styles.container}>
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          {navigation?.canGoBack?.() ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <ArrowLeft color="#FFFFFF" size={22} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 22 }} />
          )}

          <Text style={styles.navTitle}>Health Telemetry</Text>

          <TouchableOpacity
            style={styles.backButton}
            onPress={handleRefresh}
            activeOpacity={0.7}
          >
            <RefreshCw color="#00BFA5" size={18} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#00BFA5"
              colors={['#00BFA5']}
            />
          }
        >
          {/* Status Banner */}
          <View style={styles.statusBanner}>
            <View style={styles.statusLeft}>
              <View style={styles.healthConnectIconBox}>
                <Activity color="#00BFA5" size={20} />
              </View>
              <View>
                <Text style={styles.bannerTitle}>Health Connect</Text>
                <Text style={styles.bannerSubtitle}>Pebble Health Pipeline</Text>
              </View>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
            </View>
          </View>

          {/* Sync Health Data Action Banner */}
          <View style={styles.syncCard}>
            <View style={styles.syncCardHeader}>
              <Text style={styles.syncCardTitle}>Device Synchronization</Text>
              <Text style={styles.syncCardTime}>{formatLastSynced(lastSyncedTime)}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.syncActionButton,
                syncStatus === 'syncing' && styles.syncActionDisabled,
                syncStatus === 'error' && styles.syncActionError,
                syncStatus === 'permission_required' && styles.syncActionWarning,
              ]}
              onPress={
                syncStatus === 'permission_required'
                  ? handleRequestPermission
                  : handleSyncHealthData
              }
              disabled={syncStatus === 'syncing'}
              activeOpacity={0.8}
            >
              {syncStatus === 'syncing' ? (
                <>
                  <ActivityIndicator size="small" color="#001F27" style={{ marginRight: 8 }} />
                  <Text style={styles.syncActionText}>Syncing Health Data...</Text>
                </>
              ) : syncStatus === 'success' ? (
                <>
                  <CheckCircle2 color="#001F27" size={18} style={{ marginRight: 8 }} />
                  <Text style={styles.syncActionText}>Sync Complete</Text>
                </>
              ) : syncStatus === 'permission_required' ? (
                <>
                  <AlertTriangle color="#FFFFFF" size={18} style={{ marginRight: 8 }} />
                  <Text style={[styles.syncActionText, { color: '#FFFFFF' }]}>
                    Health Permission Required
                  </Text>
                </>
              ) : syncStatus === 'error' ? (
                <>
                  <AlertCircle color="#FFFFFF" size={18} style={{ marginRight: 8 }} />
                  <Text style={[styles.syncActionText, { color: '#FFFFFF' }]}>
                    Sync Failed — Tap to Retry
                  </Text>
                </>
              ) : (
                <>
                  <RefreshCw color="#001F27" size={18} style={{ marginRight: 8 }} />
                  <Text style={styles.syncActionText}>Sync Health Data</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Real Heart Rate Card */}
          <HeartRateCard
            heartRateData={heartRateData}
            loading={loading}
            refreshing={refreshing}
            permissionGranted={permissionGranted}
            isAvailable={isAvailable}
            error={error}
            onRefresh={handleRefresh}
            onRequestPermission={handleRequestPermission}
            onOpenSettings={handleOpenSettings}
          />

          {/* Activity & Vitals Grid */}
          <View style={styles.gridSection}>
            <Text style={styles.gridSectionTitle}>Activity Telemetry</Text>
            <View style={styles.metricsRow}>
              {/* Steps */}
              <View style={styles.metricCard}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(0, 191, 165, 0.12)' }]}>
                  <Footprints color="#00BFA5" size={18} />
                </View>
                <Text style={styles.metricCardLabel}>Daily Steps</Text>
                <Text style={styles.metricCardValue}>
                  {m.steps !== null && m.steps !== undefined ? m.steps.toLocaleString() : '--'}
                </Text>
                <Text style={styles.metricCardSub}>Goal: 10,000</Text>
              </View>

              {/* Calories */}
              <View style={styles.metricCard}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 82, 82, 0.12)' }]}>
                  <Flame color="#FF5252" size={18} />
                </View>
                <Text style={styles.metricCardLabel}>Burned</Text>
                <Text style={styles.metricCardValue}>
                  {m.calories !== null && m.calories !== undefined ? `${m.calories}` : '--'}
                </Text>
                <Text style={styles.metricCardSub}>kcal active</Text>
              </View>

              {/* Distance */}
              <View style={styles.metricCard}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 167, 38, 0.12)' }]}>
                  <Compass color="#FFA726" size={18} />
                </View>
                <Text style={styles.metricCardLabel}>Distance</Text>
                <Text style={styles.metricCardValue}>
                  {m.distance !== null && m.distance !== undefined ? `${m.distance}` : '--'}
                </Text>
                <Text style={styles.metricCardSub}>km tracked</Text>
              </View>
            </View>
          </View>

          {/* Sleep Analysis Card */}
          <View style={styles.detailCard}>
            <View style={styles.detailCardHeader}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(171, 71, 188, 0.14)' }]}>
                <Moon color="#AB47BC" size={18} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.detailCardTitle}>Sleep Analysis</Text>
                <Text style={styles.detailCardSubtitle}>Pebble Sleep Staging</Text>
              </View>
              <Text style={styles.detailCardHighlight}>
                {m.sleepDuration ? m.sleepDuration : '--'}
              </Text>
            </View>

            <View style={styles.sleepStagesRow}>
              <View style={styles.sleepStageCol}>
                <Text style={styles.sleepStageLabel}>Deep</Text>
                <Text style={styles.sleepStageVal}>
                  {m.deepSleepMinutes ? `${m.deepSleepMinutes}m` : '--'}
                </Text>
              </View>
              <View style={styles.sleepStageCol}>
                <Text style={styles.sleepStageLabel}>Light</Text>
                <Text style={styles.sleepStageVal}>
                  {m.lightSleepMinutes ? `${m.lightSleepMinutes}m` : '--'}
                </Text>
              </View>
              <View style={styles.sleepStageCol}>
                <Text style={styles.sleepStageLabel}>REM</Text>
                <Text style={styles.sleepStageVal}>
                  {m.remSleepMinutes ? `${m.remSleepMinutes}m` : '--'}
                </Text>
              </View>
              <View style={styles.sleepStageCol}>
                <Text style={styles.sleepStageLabel}>Awake</Text>
                <Text style={styles.sleepStageVal}>
                  {m.awakeSleepMinutes ? `${m.awakeSleepMinutes}m` : '--'}
                </Text>
              </View>
            </View>
          </View>

          {/* Recovery & Oxygen Card */}
          <View style={styles.detailCard}>
            <View style={styles.detailCardHeader}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(41, 182, 246, 0.14)' }]}>
                <Droplets color="#29B6F6" size={18} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.detailCardTitle}>Vitals & Recovery</Text>
                <Text style={styles.detailCardSubtitle}>SpO2 & HRV RMSSD</Text>
              </View>
            </View>

            <View style={styles.vitalsSplitRow}>
              <View style={styles.vitalsSplitItem}>
                <Text style={styles.vitalsItemLabel}>Blood Oxygen</Text>
                <Text style={styles.vitalsItemValue}>{m.oxygen ? `${m.oxygen}%` : '--'}</Text>
                <Text style={styles.vitalsItemSub}>
                  {m.oxygen ? (m.oxygen >= 95 ? 'Normal Saturation' : 'Low Saturation') : 'Awaiting sync'}
                </Text>
              </View>
              <View style={styles.vitalsDivider} />
              <View style={styles.vitalsSplitItem}>
                <Text style={styles.vitalsItemLabel}>HRV Recovery</Text>
                <Text style={styles.vitalsItemValue}>{m.hrv ? `${m.hrv} ms` : '--'}</Text>
                <Text style={styles.vitalsItemSub}>
                  {m.hrv ? 'Autonomic Balance' : 'Awaiting sync'}
                </Text>
              </View>
            </View>
          </View>

          {/* Stress & Activity Card */}
          <View style={styles.detailCard}>
            <View style={styles.detailCardHeader}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 112, 67, 0.14)' }]}>
                <Zap color="#FF7043" size={18} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.detailCardTitle}>Stress & Workouts</Text>
                <Text style={styles.detailCardSubtitle}>Pebble Health Tracking</Text>
              </View>
            </View>

            <View style={styles.vitalsSplitRow}>
              <View style={styles.vitalsSplitItem}>
                <Text style={styles.vitalsItemLabel}>Stress Level</Text>
                <Text style={styles.vitalsItemValue}>{m.stress ? `${m.stress}` : '--'}</Text>
                <Text style={styles.vitalsItemSub}>
                  {m.stress ? 'Estimated Index' : 'Not reported'}
                </Text>
              </View>
              <View style={styles.vitalsDivider} />
              <View style={styles.vitalsSplitItem}>
                <Text style={styles.vitalsItemLabel}>Recent Exercise</Text>
                <Text style={styles.vitalsItemValue} numberOfLines={1}>
                  {m.workoutType ? m.workoutType : '--'}
                </Text>
                <Text style={styles.vitalsItemSub}>
                  {m.workoutDuration ? `${m.workoutDuration} min duration` : 'No recent session'}
                </Text>
              </View>
            </View>
          </View>

          {/* Sync Pipeline Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeaderRow}>
              <Info color="#00BFA5" size={16} style={{ marginRight: 8 }} />
              <Text style={styles.infoCardTitle}>Data Sync Pipeline</Text>
            </View>
            <Text style={styles.infoCardText}>
              Pebble Band synchronizes heart rate, steps, calories, sleep, and SpO2 to Pebble Health, which publishes records to Android Health Connect. Hand Band synchronizes this authenticated source to your dashboard.
            </Text>
            <View style={styles.pipelineRow}>
              <Text style={styles.pipelineStep}>Pebble Band</Text>
              <Text style={styles.pipelineArrow}>→</Text>
              <Text style={styles.pipelineStep}>Pebble Health</Text>
              <Text style={styles.pipelineArrow}>→</Text>
              <Text style={styles.pipelineStep}>Health Connect</Text>
              <Text style={styles.pipelineArrow}>→</Text>
              <Text style={[styles.pipelineStep, styles.pipelineStepActive]}>Hand Band</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#001F27',
  },
  container: {
    flex: 1,
    backgroundColor: '#001F27',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(122, 158, 168, 0.1)',
  },
  backButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(122, 158, 168, 0.1)',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#00252F',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.14)',
    marginBottom: 12,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthConnectIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 191, 165, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bannerSubtitle: {
    fontSize: 11,
    color: '#7A9EA8',
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  syncCard: {
    backgroundColor: '#002833',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 165, 0.2)',
    marginBottom: 16,
  },
  syncCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  syncCardTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  syncCardTime: {
    color: '#7A9EA8',
    fontSize: 11,
  },
  syncActionButton: {
    backgroundColor: '#00BFA5',
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncActionDisabled: {
    opacity: 0.7,
  },
  syncActionWarning: {
    backgroundColor: '#FF9800',
  },
  syncActionError: {
    backgroundColor: '#FF5252',
  },
  syncActionText: {
    color: '#001F27',
    fontSize: 14,
    fontWeight: '700',
  },
  gridSection: {
    marginTop: 14,
    marginBottom: 14,
  },
  gridSectionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#00252F',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.12)',
    alignItems: 'center',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricCardLabel: {
    color: '#7A9EA8',
    fontSize: 11,
    fontWeight: '600',
  },
  metricCardValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  metricCardSub: {
    color: '#7A9EA8',
    fontSize: 9.5,
    marginTop: 2,
  },
  detailCard: {
    backgroundColor: '#00252F',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.14)',
    marginBottom: 14,
  },
  detailCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailCardTitle: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
  detailCardSubtitle: {
    color: '#7A9EA8',
    fontSize: 11,
    marginTop: 1,
  },
  detailCardHighlight: {
    color: '#AB47BC',
    fontSize: 16,
    fontWeight: '800',
  },
  sleepStagesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(122, 158, 168, 0.1)',
  },
  sleepStageCol: {
    alignItems: 'center',
    flex: 1,
  },
  sleepStageLabel: {
    color: '#7A9EA8',
    fontSize: 11,
  },
  sleepStageVal: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  vitalsSplitRow: {
    flexDirection: 'row',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(122, 158, 168, 0.1)',
  },
  vitalsSplitItem: {
    flex: 1,
    alignItems: 'center',
  },
  vitalsDivider: {
    width: 1,
    backgroundColor: 'rgba(122, 158, 168, 0.14)',
  },
  vitalsItemLabel: {
    color: '#7A9EA8',
    fontSize: 11,
  },
  vitalsItemValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  vitalsItemSub: {
    color: '#00BFA5',
    fontSize: 10.5,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: '#00252F',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.14)',
    marginTop: 4,
  },
  infoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoCardText: {
    fontSize: 12,
    color: '#7A9EA8',
    lineHeight: 18,
    marginBottom: 12,
  },
  pipelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#001F27',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pipelineStep: {
    fontSize: 11,
    color: '#7A9EA8',
    fontWeight: '600',
  },
  pipelineStepActive: {
    color: '#00BFA5',
    fontWeight: '700',
  },
  pipelineArrow: {
    fontSize: 11,
    color: '#7A9EA8',
  },
});
