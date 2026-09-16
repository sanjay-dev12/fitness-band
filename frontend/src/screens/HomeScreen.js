import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import {
  Watch,
  Battery,
  MessageSquare,
  Flame,
  Activity,
  Footprints,
  Clock,
  Moon,
  Heart,
  Droplets,
  Target,
  Award,
  Zap,
  Compass,
  Shield,
  RefreshCw,
} from 'lucide-react-native';
import ProfileSwitcher from '../components/ProfileSwitcher';
import { useProfile } from '../context/ProfileContext';

export default function HomeScreen({ navigation }) {
  const {
    activeProfile,
    refreshHealthData,
    refreshDeviceHealth,
    healthMetrics,
    healthStatus,
    refreshFamily,
    syncHealthData,
    lastSyncedTime,
  } = useProfile();
  const [refreshing, setRefreshing] = useState(false);

  const formatLastSynced = (date) => {
    if (!date) return 'Connected';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Connected';
    const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    const isToday = d.toDateString() === new Date().toDateString();
    return isToday ? `Synced at ${timeStr}` : `Synced ${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (syncHealthData) {
        await syncHealthData();
      }
    } catch (e) {
      console.warn('Sync on refresh error:', e);
    }
    await Promise.all([
      refreshDeviceHealth?.(),
      refreshHealthData?.(),
      refreshFamily?.(),
    ]);
    setRefreshing(false);
  };

  const isOwner = activeProfile?.isPrimary !== false;
  const m = activeProfile?.metrics || {};

  // Integrated values: prioritize live device Health Connect metrics for owner
  const calValue = (isOwner && healthMetrics?.calories !== undefined && healthMetrics?.calories !== null)
    ? healthMetrics.calories
    : (m.calories || 0);
  const stepsValue = (isOwner && healthMetrics?.steps !== undefined && healthMetrics?.steps !== null)
    ? healthMetrics.steps
    : (m.steps || 0);

  // Goal calculations
  const calGoal = m.caloriesGoal || 500;
  const calPct = Math.round((calValue / calGoal) * 100);

  // Real reported values only — no fabricated or unvalidated derivations
  const workValue = (m.exerciseMins !== null && m.exerciseMins !== undefined) ? m.exerciseMins : null;
  const workGoal = m.exerciseGoal || 30;
  const workPct = workValue !== null ? Math.round((workValue / workGoal) * 100) : 0;

  const moveValue = (m.walkingHours !== null && m.walkingHours !== undefined) ? m.walkingHours : null;
  const moveGoal = m.walkingGoal || 12;
  const movePct = moveValue !== null ? Math.round((moveValue / moveGoal) * 100) : 0;

  // Health card interaction: prompt permissions if required, else open telemetry
  const handleHealthCardPress = async () => {
    if (healthStatus === 'permission_required') {
      await refreshDeviceHealth?.();
    } else {
      navigation?.navigate('HealthDashboard');
    }
  };

  // Status badge text mapping
  const getStatusBadge = (fieldVal) => {
    switch (healthStatus) {
      case 'loading':
        return 'Syncing';
      case 'error':
        return 'Error';
      case 'permission_required':
        return 'Tap to enable';
      case 'ready':
        return (fieldVal !== null && fieldVal !== undefined && fieldVal !== '') ? 'Live' : 'No data';
      case 'idle':
      default:
        return 'Awaiting';
    }
  };

  // Status badge color mapping
  const getBadgeColors = (badgeText) => {
    switch (badgeText) {
      case 'Live':
        return { bg: 'rgba(0, 230, 118, 0.14)', text: '#00E676' };
      case 'Syncing':
        return { bg: 'rgba(0, 191, 165, 0.14)', text: '#00BFA5' };
      case 'Tap to enable':
        return { bg: 'rgba(255, 167, 38, 0.18)', text: '#FFA726' };
      case 'Error':
        return { bg: 'rgba(255, 82, 82, 0.16)', text: '#FF5252' };
      default:
        return { bg: 'rgba(122, 158, 168, 0.14)', text: '#8FAAB2' };
    }
  };

  // Live metric resolution: prioritize on-device Health Connect metrics when owner profile is active
  const displayHr = isOwner ? (healthMetrics?.heartRate || m.heartRate || null) : (m.heartRate || null);
  const displaySleep = isOwner
    ? (healthMetrics?.sleepMinutes ? `${Math.floor(healthMetrics.sleepMinutes / 60)}h ${healthMetrics.sleepMinutes % 60}m` : (m.sleepDuration || null))
    : (m.sleepDuration || null);
  const displaySteps = isOwner
    ? (healthMetrics?.steps !== undefined && healthMetrics?.steps !== null ? healthMetrics.steps : (m.steps !== undefined && m.steps !== null ? m.steps : null))
    : (m.steps !== undefined && m.steps !== null ? m.steps : null);
  const displayOxygen = isOwner ? (healthMetrics?.oxygenLevel || m.oxygen || null) : (m.oxygen || null);
  const displayDistance = isOwner
    ? (healthMetrics?.distance !== null && healthMetrics?.distance !== undefined ? healthMetrics.distance : (m.distance ?? null))
    : (m.distance ?? null);

  // SVG Concentric Ring Geometries
  const center = 66;
  const strokeW = 8.5;

  const rOuter = 52;
  const cOuter = 2 * Math.PI * rOuter;
  const offsetOuter = cOuter * (1 - Math.min(1, calValue / calGoal));

  const rMid = 39;
  const cMid = 2 * Math.PI * rMid;
  const offsetMid = cMid * (1 - Math.min(1, (workValue || 0) / workGoal));

  const rInner = 26;
  const cInner = 2 * Math.PI * rInner;
  const offsetInner = cInner * (1 - Math.min(1, (moveValue || 0) / moveGoal));

  return (
    <View style={styles.container}>
      {/* 1. Header / Band Status */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBandChip}
          onPress={() => navigation?.navigate('Device')}
          activeOpacity={0.8}
        >
          <View style={styles.watchIconContainer}>
            <Watch color="#00BFA5" size={16} />
          </View>
          <View style={styles.bandInfoCol}>
            <View style={styles.bandNameRow}>
              <Text style={styles.bandNameText} numberOfLines={1}>
                {activeProfile.name}'s Band
              </Text>
              <View style={styles.batteryChip}>
                <Battery color="#8FAAB2" size={12} style={{ marginRight: 3 }} />
                <Text style={styles.batteryText}>
                  {activeProfile.battery !== null && activeProfile.battery !== undefined
                    ? `${activeProfile.battery}%`
                    : '--'}
                </Text>
              </View>
            </View>
            <View style={styles.statusRow}>
              <View style={styles.greenStatusDot} />
              <Text style={styles.statusLabel}>Connected</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.headerRightRow}>
          <TouchableOpacity
            style={styles.headerSyncButton}
            onPress={onRefresh}
            disabled={refreshing}
            activeOpacity={0.75}
          >
            <RefreshCw color="#00BFA5" size={16} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => navigation?.navigate('FamilySetup')}
            activeOpacity={0.8}
          >
            <MessageSquare color="#FFFFFF" size={18} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Family Profiles Section */}
      <ProfileSwitcher navigation={navigation} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00BFA5"
            colors={['#00BFA5']}
          />
        }
      >
        {/* 2. Page Title */}
        <View style={styles.pageTitleSection}>
          <Text style={styles.pageTitle}>Health Overview</Text>
          <Text style={styles.pageSubtitle}>Today's health & activity</Text>
        </View>

        {/* 4. Live Status Card */}
        <TouchableOpacity
          style={styles.liveStatusCard}
          onPress={() => navigation?.navigate('HealthDashboard')}
          activeOpacity={0.85}
        >
          <View style={styles.liveStatusLeft}>
            <View style={styles.livePulseDotContainer}>
              <View style={styles.livePulseOuter} />
              <View style={styles.livePulseInner} />
            </View>
            <View style={styles.liveStatusTextCol}>
              <Text style={styles.liveStatusTitle}>
                {activeProfile.name} is active now
              </Text>
              <View style={styles.liveStatusSubRow}>
                <Watch color="#00BFA5" size={13} style={{ marginRight: 4 }} />
                <Text style={styles.liveStatusSubtitle}>{formatLastSynced(lastSyncedTime)} • Synced</Text>
              </View>
            </View>
          </View>
          <View style={styles.liveBadge}>
            <Zap color="#00E676" size={12} style={{ marginRight: 4 }} />
            <Text style={styles.liveBadgeText}>Live Status</Text>
          </View>
        </TouchableOpacity>

        {/* 5. Main Health Summary Card ("Today's Activity") */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderTitle}>Today's Activity</Text>
            <Text style={styles.cardHeaderTag}>Summary</Text>
          </View>

          <View style={styles.metricsGrid}>
            {/* Metric 1: Calories */}
            <View style={styles.metricTile}>
              <View style={[styles.metricIconBox, { backgroundColor: 'rgba(255, 82, 82, 0.12)' }]}>
                <Flame color="#FF5252" size={18} />
              </View>
              <View style={styles.metricValueRow}>
                <Text style={styles.metricValue}>{calValue}</Text>
                <Text style={styles.metricUnit}>kcal</Text>
              </View>
              <Text style={styles.metricLabel}>Calories</Text>
            </View>

            {/* Metric 2: Workout */}
            <View style={styles.metricTile}>
              <View style={[styles.metricIconBox, { backgroundColor: 'rgba(0, 230, 118, 0.12)' }]}>
                <Activity color="#00E676" size={18} />
              </View>
              <View style={styles.metricValueRow}>
                <Text style={styles.metricValue}>{workValue !== null ? workValue : '--'}</Text>
                <Text style={styles.metricUnit}>min</Text>
              </View>
              <Text style={styles.metricLabel}>Workout</Text>
            </View>

            {/* Metric 3: Steps */}
            <View style={styles.metricTile}>
              <View style={[styles.metricIconBox, { backgroundColor: 'rgba(0, 191, 165, 0.12)' }]}>
                <Footprints color="#00BFA5" size={18} />
              </View>
              <View style={styles.metricValueRow}>
                <Text style={styles.metricValue}>{stepsValue.toLocaleString()}</Text>
                <Text style={styles.metricUnit}>steps</Text>
              </View>
              <Text style={styles.metricLabel}>Steps</Text>
            </View>

            {/* Metric 4: Move Hours */}
            <View style={styles.metricTile}>
              <View style={[styles.metricIconBox, { backgroundColor: 'rgba(41, 182, 246, 0.12)' }]}>
                <Clock color="#29B6F6" size={18} />
              </View>
              <View style={styles.metricValueRow}>
                <Text style={styles.metricValue}>{moveValue !== null ? moveValue : '--'}</Text>
                <Text style={styles.metricUnit}>hrs</Text>
              </View>
              <Text style={styles.metricLabel}>Move Hours</Text>
            </View>
          </View>
        </View>

        {/* 6 & 7. Daily Goals & Activity Rings */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.titleWithIcon}>
              <Target color="#00BFA5" size={18} style={{ marginRight: 6 }} />
              <Text style={styles.cardHeaderTitle}>Daily Goals</Text>
            </View>
            <Text style={styles.cardHeaderTag}>Target Progress</Text>
          </View>

          {/* Centered Circular Activity Visualization */}
          <View style={styles.ringsContainer}>
            <Svg width={132} height={132} viewBox="0 0 132 132">
              {/* Outer Ring: Calories (Red/Orange) */}
              <Circle
                cx={center}
                cy={center}
                r={rOuter}
                stroke="rgba(255, 82, 82, 0.16)"
                strokeWidth={strokeW}
                fill="none"
              />
              <Circle
                cx={center}
                cy={center}
                r={rOuter}
                stroke="#FF5252"
                strokeWidth={strokeW}
                fill="none"
                strokeDasharray={cOuter}
                strokeDashoffset={offsetOuter}
                strokeLinecap="round"
                transform={`rotate(-90 ${center} ${center})`}
              />

              {/* Middle Ring: Workout (Green) */}
              <Circle
                cx={center}
                cy={center}
                r={rMid}
                stroke="rgba(0, 230, 118, 0.16)"
                strokeWidth={strokeW}
                fill="none"
              />
              <Circle
                cx={center}
                cy={center}
                r={rMid}
                stroke="#00E676"
                strokeWidth={strokeW}
                fill="none"
                strokeDasharray={cMid}
                strokeDashoffset={offsetMid}
                strokeLinecap="round"
                transform={`rotate(-90 ${center} ${center})`}
              />

              {/* Inner Ring: Movement (Blue) */}
              <Circle
                cx={center}
                cy={center}
                r={rInner}
                stroke="rgba(41, 182, 246, 0.16)"
                strokeWidth={strokeW}
                fill="none"
              />
              <Circle
                cx={center}
                cy={center}
                r={rInner}
                stroke="#29B6F6"
                strokeWidth={strokeW}
                fill="none"
                strokeDasharray={cInner}
                strokeDashoffset={offsetInner}
                strokeLinecap="round"
                transform={`rotate(-90 ${center} ${center})`}
              />
            </Svg>

            {/* Center Icon */}
            <View style={styles.ringCenterIcon}>
              <Flame color="#00BFA5" size={20} />
            </View>
          </View>

          {/* Goal Progress Breakdown */}
          <View style={styles.goalProgressList}>
            {/* Calories Goal */}
            <View style={styles.goalItem}>
              <View style={styles.goalItemHeader}>
                <View style={styles.goalItemTitleRow}>
                  <View style={[styles.goalIndicatorDot, { backgroundColor: '#FF5252' }]} />
                  <Text style={styles.goalItemName}>Calories</Text>
                </View>
                <View style={styles.goalItemValueRow}>
                  <Text style={styles.goalItemValues}>
                    {calValue} <Text style={styles.goalItemTarget}>/ {calGoal} kcal</Text>
                  </Text>
                  <View style={[styles.pctBadge, { backgroundColor: 'rgba(255, 82, 82, 0.14)' }]}>
                    <Text style={[styles.pctBadgeText, { color: '#FF5252' }]}>{calPct}%</Text>
                  </View>
                </View>
              </View>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    { backgroundColor: '#FF5252', width: `${Math.min(100, calPct)}%` },
                  ]}
                />
              </View>
            </View>

            {/* Workout Goal */}
            <View style={styles.goalItem}>
              <View style={styles.goalItemHeader}>
                <View style={styles.goalItemTitleRow}>
                  <View style={[styles.goalIndicatorDot, { backgroundColor: '#00E676' }]} />
                  <Text style={styles.goalItemName}>Workout</Text>
                </View>
                <View style={styles.goalItemValueRow}>
                  <Text style={styles.goalItemValues}>
                    {workValue !== null ? workValue : '--'} <Text style={styles.goalItemTarget}>/ {workGoal} min</Text>
                  </Text>
                  <View style={[styles.pctBadge, { backgroundColor: 'rgba(0, 230, 118, 0.14)' }]}>
                    <Text style={[styles.pctBadgeText, { color: '#00E676' }]}>{workValue !== null ? `${workPct}%` : '--'}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    { backgroundColor: '#00E676', width: `${Math.min(100, workPct)}%` },
                  ]}
                />
              </View>
            </View>

            {/* Movement Goal */}
            <View style={styles.goalItem}>
              <View style={styles.goalItemHeader}>
                <View style={styles.goalItemTitleRow}>
                  <View style={[styles.goalIndicatorDot, { backgroundColor: '#29B6F6' }]} />
                  <Text style={styles.goalItemName}>Movement</Text>
                </View>
                <View style={styles.goalItemValueRow}>
                  <Text style={styles.goalItemValues}>
                    {moveValue !== null ? moveValue : '--'} <Text style={styles.goalItemTarget}>/ {moveGoal} hrs</Text>
                  </Text>
                  <View style={[styles.pctBadge, { backgroundColor: 'rgba(41, 182, 246, 0.14)' }]}>
                    <Text style={[styles.pctBadgeText, { color: '#29B6F6' }]}>{moveValue !== null ? `${movePct}%` : '--'}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    { backgroundColor: '#29B6F6', width: `${Math.min(100, movePct)}%` },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* 8. Health Insights */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.titleWithIcon}>
              <Activity color="#00BFA5" size={18} style={{ marginRight: 6 }} />
              <Text style={styles.cardHeaderTitle}>Health Insights</Text>
            </View>
            <Text style={styles.cardHeaderTag}>Vitals</Text>
          </View>

          <View style={styles.insightsGrid}>
            {/* Insight 1: Heart Rate */}
            <TouchableOpacity
              style={styles.insightCard}
              activeOpacity={0.8}
              onPress={handleHealthCardPress}
            >
              <View style={styles.insightHeaderRow}>
                <View style={[styles.insightIconBox, { backgroundColor: 'rgba(255, 82, 82, 0.12)' }]}>
                  <Heart color="#FF5252" size={16} />
                </View>
                {(() => {
                  const badge = getStatusBadge(displayHr);
                  const colors = getBadgeColors(badge);
                  return (
                    <View style={[styles.insightStatusTag, { backgroundColor: colors.bg }]}>
                      <Text style={[styles.insightStatusTagText, { color: colors.text }]}>
                        {badge}
                      </Text>
                    </View>
                  );
                })()}
              </View>
              <Text style={styles.insightName}>Heart Rate</Text>
              <View style={styles.insightValueRow}>
                <Text style={styles.insightMainVal}>{displayHr ? displayHr : '--'}</Text>
                <Text style={styles.insightValUnit}>BPM</Text>
              </View>
              {/* Mini pulse bars */}
              <View style={styles.waveformContainer}>
                <View style={[styles.waveLine, { height: 6 }]} />
                <View style={[styles.waveLine, { height: 12 }]} />
                <View style={[styles.waveLine, { height: 18, backgroundColor: '#FF5252' }]} />
                <View style={[styles.waveLine, { height: 10 }]} />
                <View style={[styles.waveLine, { height: 6 }]} />
              </View>
            </TouchableOpacity>

            {/* Insight 2: Sleep */}
            <TouchableOpacity
              style={styles.insightCard}
              activeOpacity={0.8}
              onPress={handleHealthCardPress}
            >
              <View style={styles.insightHeaderRow}>
                <View style={[styles.insightIconBox, { backgroundColor: 'rgba(171, 71, 188, 0.12)' }]}>
                  <Moon color="#AB47BC" size={16} />
                </View>
                {(() => {
                  const badge = getStatusBadge(displaySleep);
                  const colors = getBadgeColors(badge);
                  return (
                    <View style={[styles.insightStatusTag, { backgroundColor: colors.bg }]}>
                      <Text style={[styles.insightStatusTagText, { color: colors.text }]}>
                        {badge}
                      </Text>
                    </View>
                  );
                })()}
              </View>
              <Text style={styles.insightName}>Sleep</Text>
              <View style={styles.insightValueRow}>
                <Text style={styles.insightMainVal}>{displaySleep ? displaySleep : '--'}</Text>
              </View>
              <Text style={styles.insightNote}>
                {displaySleep ? 'Optimal recovery' : 'Wear band during sleep'}
              </Text>
            </TouchableOpacity>

            {/* Insight 3: Steps */}
            <TouchableOpacity
              style={styles.insightCard}
              activeOpacity={0.8}
              onPress={handleHealthCardPress}
            >
              <View style={styles.insightHeaderRow}>
                <View style={[styles.insightIconBox, { backgroundColor: 'rgba(0, 191, 165, 0.12)' }]}>
                  <Footprints color="#00BFA5" size={16} />
                </View>
                {(() => {
                  const badge = getStatusBadge(displaySteps);
                  const colors = getBadgeColors(badge);
                  return (
                    <View style={[styles.insightStatusTag, { backgroundColor: colors.bg }]}>
                      <Text style={[styles.insightStatusTagText, { color: colors.text }]}>
                        {badge}
                      </Text>
                    </View>
                  );
                })()}
              </View>
              <Text style={styles.insightName}>Daily Steps</Text>
              <View style={styles.insightValueRow}>
                <Text style={styles.insightMainVal}>
                  {displaySteps !== null && displaySteps !== undefined ? displaySteps.toLocaleString() : '--'}
                </Text>
              </View>
              <Text style={styles.insightNote}>Goal: 10,000</Text>
            </TouchableOpacity>

            {/* Insight 4: SpO2 Blood Oxygen */}
            <TouchableOpacity
              style={styles.insightCard}
              activeOpacity={0.8}
              onPress={handleHealthCardPress}
            >
              <View style={styles.insightHeaderRow}>
                <View style={[styles.insightIconBox, { backgroundColor: 'rgba(41, 182, 246, 0.12)' }]}>
                  <Droplets color="#29B6F6" size={16} />
                </View>
                {(() => {
                  const badge = getStatusBadge(displayOxygen);
                  const colors = getBadgeColors(badge);
                  return (
                    <View style={[styles.insightStatusTag, { backgroundColor: colors.bg }]}>
                      <Text style={[styles.insightStatusTagText, { color: colors.text }]}>
                        {badge}
                      </Text>
                    </View>
                  );
                })()}
              </View>
              <Text style={styles.insightName}>Blood Oxygen</Text>
              <View style={styles.insightValueRow}>
                <Text style={styles.insightMainVal}>{displayOxygen ? `${displayOxygen}` : '--'}</Text>
                <Text style={styles.insightValUnit}>%</Text>
              </View>
              <Text style={styles.insightNote}>
                {displayOxygen ? 'Healthy saturation' : 'Sync to record SpO2'}
              </Text>
            </TouchableOpacity>

            {/* Insight 5: HRV Recovery */}
            <TouchableOpacity
              style={styles.insightCard}
              activeOpacity={0.8}
              onPress={handleHealthCardPress}
            >
              <View style={styles.insightHeaderRow}>
                <View style={[styles.insightIconBox, { backgroundColor: 'rgba(0, 230, 118, 0.12)' }]}>
                  <Zap color="#00E676" size={16} />
                </View>
                <View style={[styles.insightStatusTag, { backgroundColor: 'rgba(0, 230, 118, 0.14)' }]}>
                  <Text style={[styles.insightStatusTagText, { color: '#00E676' }]}>
                    {m.hrv ? 'Recovery' : 'Standby'}
                  </Text>
                </View>
              </View>
              <Text style={styles.insightName}>Heart Rate Var</Text>
              <View style={styles.insightValueRow}>
                <Text style={styles.insightMainVal}>{m.hrv ? m.hrv : '--'}</Text>
                <Text style={styles.insightValUnit}>ms</Text>
              </View>
              <Text style={styles.insightNote}>
                {m.hrv ? 'Pebble RMSSD score' : 'Sync to record HRV'}
              </Text>
            </TouchableOpacity>

            {/* Insight 6: Distance */}
            <TouchableOpacity
              style={styles.insightCard}
              activeOpacity={0.8}
              onPress={handleHealthCardPress}
            >
              <View style={styles.insightHeaderRow}>
                <View style={[styles.insightIconBox, { backgroundColor: 'rgba(255, 167, 38, 0.12)' }]}>
                  <Compass color="#FFA726" size={16} />
                </View>
                {(() => {
                  const badge = getStatusBadge(displayDistance);
                  const colors = getBadgeColors(badge);
                  return (
                    <View style={[styles.insightStatusTag, { backgroundColor: colors.bg }]}>
                      <Text style={[styles.insightStatusTagText, { color: colors.text }]}>
                        {badge}
                      </Text>
                    </View>
                  );
                })()}
              </View>
              <Text style={styles.insightName}>Distance</Text>
              <View style={styles.insightValueRow}>
                <Text style={styles.insightMainVal}>{displayDistance !== null && displayDistance !== undefined ? displayDistance : '--'}</Text>
                <Text style={styles.insightValUnit}>km</Text>
              </View>
              <Text style={styles.insightNote}>
                {displayDistance ? 'Pebble activity distance' : 'Sync to record distance'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001F27',
  },
  // 1. Compact Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 42,
    paddingBottom: 10,
    backgroundColor: '#002833',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(122, 158, 168, 0.1)',
  },
  headerBandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 191, 165, 0.08)',
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 165, 0.25)',
    maxWidth: '82%',
  },
  watchIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 191, 165, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  bandInfoCol: {
    justifyContent: 'center',
  },
  bandNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bandNameText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  batteryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(122, 158, 168, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  batteryText: {
    color: '#8FAAB2',
    fontSize: 10,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  greenStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E676',
    marginRight: 4,
  },
  statusLabel: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: '600',
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerSyncButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#001F27',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 165, 0.35)',
  },
  chatButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#001F27',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.25)',
  },

  // Scroll Body
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 32,
  },

  // 2. Page Title
  pageTitleSection: {
    marginBottom: 12,
  },
  pageTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    color: '#8FAAB2',
    fontSize: 12,
    marginTop: 2,
  },

  // 4. Live Status Card
  liveStatusCard: {
    backgroundColor: '#002B36',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 165, 0.22)',
  },
  liveStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  livePulseDotContainer: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
  },
  livePulseOuter: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 230, 118, 0.25)',
  },
  livePulseInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00E676',
  },
  liveStatusTextCol: {
    flex: 1,
  },
  liveStatusTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  liveStatusSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  liveStatusSubtitle: {
    color: '#8FAAB2',
    fontSize: 11,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  liveBadgeText: {
    color: '#00E676',
    fontSize: 10.5,
    fontWeight: '700',
  },

  // Cards & Layout
  sectionCard: {
    backgroundColor: '#002B36',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.15)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  cardHeaderTag: {
    fontSize: 11,
    color: '#8FAAB2',
    fontWeight: '500',
  },

  // 5. Today's Activity Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  metricTile: {
    width: '48%',
    backgroundColor: '#00232C',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.1)',
  },
  metricIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  metricUnit: {
    fontSize: 11,
    color: '#8FAAB2',
    fontWeight: '600',
  },
  metricLabel: {
    fontSize: 12,
    color: '#8FAAB2',
    marginTop: 2,
    fontWeight: '500',
  },

  // 6. Rings
  ringsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
    position: 'relative',
  },
  ringCenterIcon: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#002028',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 165, 0.2)',
  },

  // 7. Goal Progress
  goalProgressList: {
    marginTop: 10,
    gap: 10,
  },
  goalItem: {
    backgroundColor: '#00232C',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.08)',
  },
  goalItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  goalItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIndicatorDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  goalItemName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  goalItemValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  goalItemValues: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  goalItemTarget: {
    fontWeight: 'normal',
    color: '#8FAAB2',
  },
  pctBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  pctBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 5,
    backgroundColor: 'rgba(122, 158, 168, 0.15)',
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2.5,
  },

  // 8. Health Insights
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  insightCard: {
    width: '48%',
    backgroundColor: '#00232C',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.1)',
  },
  insightHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  insightIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightStatusTag: {
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  insightStatusTagText: {
    color: '#00E676',
    fontSize: 9.5,
    fontWeight: '700',
  },
  insightName: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#8FAAB2',
    marginTop: 2,
  },
  insightValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    marginTop: 2,
  },
  insightMainVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  insightValUnit: {
    fontSize: 11,
    color: '#8FAAB2',
    fontWeight: '600',
  },
  insightNote: {
    fontSize: 10,
    color: '#6A8791',
    marginTop: 4,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 18,
    marginTop: 4,
  },
  waveLine: {
    width: 3.5,
    backgroundColor: 'rgba(255, 82, 82, 0.35)',
    borderRadius: 2,
  },
});
