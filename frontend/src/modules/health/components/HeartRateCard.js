import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  Heart,
  RefreshCw,
  AlertCircle,
  Clock,
  ShieldAlert,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react-native';

/**
 * Reusable Heart Rate Card for Android Health Connect
 *
 * @param {Object} props
 * @param {Object|null} props.heartRateData - { beatsPerMinute, formattedTime, formattedDate, source }
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.refreshing - Refreshing state
 * @param {boolean} props.permissionGranted - Permission status
 * @param {boolean} props.isAvailable - Health Connect availability
 * @param {string|null} props.error - Error message if any
 * @param {Function} props.onRefresh - Callback to refresh data
 * @param {Function} props.onRequestPermission - Callback to request permission
 * @param {Function} props.onOpenSettings - Callback to open Health Connect settings
 */
export default function HeartRateCard({
  heartRateData,
  loading = false,
  refreshing = false,
  permissionGranted = false,
  isAvailable = true,
  error = null,
  onRefresh,
  onRequestPermission,
  onOpenSettings,
}) {
  // 1. Health Connect unavailable on device
  if (!isAvailable) {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconBadge, { backgroundColor: 'rgba(255, 82, 82, 0.14)' }]}>
              <Heart color="#FF5252" size={20} />
            </View>
            <Text style={styles.cardTitle}>Heart Rate</Text>
          </View>
        </View>

        <View style={styles.stateContainer}>
          <HelpCircle color="#FFA726" size={36} style={styles.stateIcon} />
          <Text style={styles.stateTitle}>Health Connect Unavailable</Text>
          <Text style={styles.stateDescription}>
            Health Connect is not available on this Android device. Please install or update Health Connect from Google Play.
          </Text>
          {onOpenSettings && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onOpenSettings}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>Open Health Connect Settings</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // 2. Permission not granted
  if (!permissionGranted) {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconBadge, { backgroundColor: 'rgba(255, 82, 82, 0.14)' }]}>
              <Heart color="#FF5252" size={20} />
            </View>
            <Text style={styles.cardTitle}>Heart Rate</Text>
          </View>
        </View>

        <View style={styles.stateContainer}>
          <ShieldAlert color="#FF5252" size={36} style={styles.stateIcon} />
          <Text style={styles.stateTitle}>Permission Required</Text>
          <Text style={styles.stateDescription}>
            Heart rate permission is required to display your health data from Pebble Halo via Health Connect.
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onRequestPermission}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#001F27" size="small" />
            ) : (
              <Text style={styles.actionButtonText}>Grant Heart Rate Access</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 3. Unexpected read error
  if (error && !heartRateData) {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconBadge, { backgroundColor: 'rgba(255, 82, 82, 0.14)' }]}>
              <Heart color="#FF5252" size={20} />
            </View>
            <Text style={styles.cardTitle}>Heart Rate</Text>
          </View>
        </View>

        <View style={styles.stateContainer}>
          <AlertCircle color="#FF5252" size={36} style={styles.stateIcon} />
          <Text style={styles.stateTitle}>Read Failed</Text>
          <Text style={styles.stateDescription}>
            Unable to read heart rate data. Please try again.
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onRefresh}
            activeOpacity={0.8}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator color="#001F27" size="small" />
            ) : (
              <Text style={styles.actionButtonText}>Retry</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 4. Initial loading state (no data yet)
  if (loading && !heartRateData) {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconBadge, { backgroundColor: 'rgba(255, 82, 82, 0.14)' }]}>
              <Heart color="#FF5252" size={20} />
            </View>
            <Text style={styles.cardTitle}>Heart Rate</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00BFA5" />
          <Text style={styles.loadingText}>Reading from Health Connect...</Text>
        </View>
      </View>
    );
  }

  // 5. Empty state (permission granted, but no records in Health Connect)
  if (!heartRateData) {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconBadge, { backgroundColor: 'rgba(255, 82, 82, 0.14)' }]}>
              <Heart color="#FF5252" size={20} />
            </View>
            <Text style={styles.cardTitle}>Heart Rate</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshIconButton}
            onPress={onRefresh}
            disabled={refreshing}
            activeOpacity={0.7}
          >
            <RefreshCw
              color="#00BFA5"
              size={18}
              style={refreshing ? styles.rotating : null}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.stateContainer}>
          <HelpCircle color="#7A9EA8" size={36} style={styles.stateIcon} />
          <Text style={styles.stateTitle}>No Data Available</Text>
          <Text style={styles.stateDescription}>
            No heart rate data is available in Health Connect yet. Make sure Pebble Halo is synced with your Pebble Band and syncing to Health Connect.
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onRefresh}
            activeOpacity={0.8}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator color="#001F27" size="small" />
            ) : (
              <Text style={styles.actionButtonText}>Check Again</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 6. Data available: Render real heart rate reading
  const bpm = heartRateData.beatsPerMinute;
  const lastUpdated = heartRateData.formattedTime || '--:--';
  const updatedDate = heartRateData.formattedDate || '';
  const source = heartRateData.source || 'Health Connect';

  // Zone status based on dynamic reading
  let zoneLabel = 'Normal';
  let zoneColor = '#00BFA5';
  if (bpm < 60) {
    zoneLabel = 'Resting';
    zoneColor = '#64B5F6';
  } else if (bpm > 100) {
    zoneLabel = 'Elevated';
    zoneColor = '#FFB74D';
  }

  return (
    <View style={styles.cardContainer}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBadge, { backgroundColor: 'rgba(255, 82, 82, 0.14)' }]}>
            <Heart color="#FF5252" size={20} />
          </View>
          <View>
            <Text style={styles.cardTitle}>Heart Rate</Text>
            <Text style={styles.cardSubtitle}>Real-time Health Connect Data</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={[styles.zoneBadge, { backgroundColor: `${zoneColor}22` }]}>
            <View style={[styles.zoneDot, { backgroundColor: zoneColor }]} />
            <Text style={[styles.zoneText, { color: zoneColor }]}>{zoneLabel}</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshIconButton}
            onPress={onRefresh}
            disabled={refreshing}
            activeOpacity={0.7}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color="#00BFA5" />
            ) : (
              <RefreshCw color="#00BFA5" size={18} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Metric Display */}
      <View style={styles.metricSection}>
        <View style={styles.valueRow}>
          <Text style={styles.mainValue}>{bpm}</Text>
          <Text style={styles.valueUnit}>BPM</Text>
        </View>

        {/* Pulse waveform visual */}
        <View style={styles.waveformRow}>
          <View style={[styles.waveformBar, { height: 8 }]} />
          <View style={[styles.waveformBar, { height: 14 }]} />
          <View style={[styles.waveformBar, { height: 26, backgroundColor: '#FF5252' }]} />
          <View style={[styles.waveformBar, { height: 38, backgroundColor: '#FF5252' }]} />
          <View style={[styles.waveformBar, { height: 18, backgroundColor: '#FF5252' }]} />
          <View style={[styles.waveformBar, { height: 10 }]} />
          <View style={[styles.waveformBar, { height: 6 }]} />
        </View>
      </View>

      {/* Metadata / Details Footer */}
      <View style={styles.detailsContainer}>
        {/* Last updated */}
        <View style={styles.detailItem}>
          <View style={styles.detailLabelRow}>
            <Clock color="#7A9EA8" size={13} style={{ marginRight: 5 }} />
            <Text style={styles.detailLabel}>Last updated</Text>
          </View>
          <Text style={styles.detailValue}>
            {lastUpdated}
            {updatedDate ? ` (${updatedDate})` : ''}
          </Text>
        </View>

        <View style={styles.detailDivider} />

        {/* Source */}
        <View style={styles.detailItem}>
          <View style={styles.detailLabelRow}>
            <CheckCircle2 color="#00BFA5" size={13} style={{ marginRight: 5 }} />
            <Text style={styles.detailLabel}>Source</Text>
          </View>
          <Text style={styles.detailValue} numberOfLines={1}>
            {source}
          </Text>
        </View>
      </View>

      {/* Manual Refresh Action */}
      <TouchableOpacity
        style={styles.refreshActionButton}
        onPress={onRefresh}
        activeOpacity={0.8}
        disabled={refreshing}
      >
        {refreshing ? (
          <View style={styles.btnContentRow}>
            <ActivityIndicator color="#001F27" size="small" style={{ marginRight: 8 }} />
            <Text style={styles.refreshActionText}>Updating from Health Connect...</Text>
          </View>
        ) : (
          <View style={styles.btnContentRow}>
            <RefreshCw color="#001F27" size={15} style={{ marginRight: 8 }} />
            <Text style={styles.refreshActionText}>Refresh Health Connect Data</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#00252F',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#7A9EA8',
    marginTop: 2,
  },
  zoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 10,
  },
  zoneDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  zoneText: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  refreshIconButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 191, 165, 0.1)',
  },
  metricSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(122, 158, 168, 0.1)',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  mainValue: {
    fontSize: 52,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  valueUnit: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF5252',
    marginLeft: 8,
    marginBottom: 6,
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 42,
    gap: 4,
    paddingBottom: 4,
  },
  waveformBar: {
    width: 4,
    backgroundColor: 'rgba(255, 82, 82, 0.25)',
    borderRadius: 2,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 16,
  },
  detailItem: {
    flex: 1,
  },
  detailDivider: {
    width: 1,
    backgroundColor: 'rgba(122, 158, 168, 0.14)',
    marginHorizontal: 12,
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 11,
    color: '#7A9EA8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  refreshActionButton: {
    backgroundColor: '#00BFA5',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshActionText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#001F27',
  },
  stateContainer: {
    paddingVertical: 24,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateIcon: {
    marginBottom: 12,
  },
  stateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  stateDescription: {
    fontSize: 13,
    color: '#8FAAB2',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
    maxWidth: 280,
  },
  actionButton: {
    backgroundColor: '#00BFA5',
    paddingVertical: 11,
    paddingHorizontal: 22,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#001F27',
  },
  loadingContainer: {
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: '#7A9EA8',
    marginTop: 12,
  },
});
