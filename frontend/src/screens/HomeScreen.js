import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useTheme } from '../context/ThemeContext';
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
} from 'lucide-react-native';
import ProfileSwitcher from '../components/ProfileSwitcher';
import { useProfile } from '../context/ProfileContext';

export default function HomeScreen({ navigation }) {
  const { activeProfile, refreshHealthData, refreshFamily, syncHealthData, lastSyncedTime } = useProfile();
  const { theme } = useTheme();
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
    await Promise.all([refreshHealthData?.(), refreshFamily?.()]);
    setRefreshing(false);
  };

  const m = activeProfile?.metrics || {};

  // Goal calculations
  const calValue = m.calories || 0;
  const calGoal = m.caloriesGoal || 500;
  const calPct = Math.round((calValue / calGoal) * 100);

  const workValue = m.exerciseMins || 0;
  const workGoal = m.exerciseGoal || 30;
  const workPct = Math.round((workValue / workGoal) * 100);

  const moveValue = m.walkingHours || 0;
  const moveGoal = m.walkingGoal || 12;
  const movePct = Math.round((moveValue / moveGoal) * 100);

  // SVG Concentric Ring Geometries
  const center = 66;
  const strokeW = 8.5;

  const rOuter = 52;
  const cOuter = 2 * Math.PI * rOuter;
  const offsetOuter = cOuter * (1 - Math.min(1, calValue / calGoal));

  const rMid = 39;
  const cMid = 2 * Math.PI * rMid;
  const offsetMid = cMid * (1 - Math.min(1, workValue / workGoal));

  const rInner = 26;
  const cInner = 2 * Math.PI * rInner;
  const offsetInner = cInner * (1 - Math.min(1, moveValue / moveGoal));

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* 1. Header / Band Status */}
      <View style={[styles.header, { backgroundColor: theme.bgCard, borderBottomColor: theme.borderSub }]}>
        <TouchableOpacity
          style={styles.headerBandChip}
          onPress={() => navigation?.navigate('Device')}
          activeOpacity={0.8}
        >
          <View style={styles.watchIconContainer}>
            <Watch color={theme.accent} size={16} />
          </View>
          <View style={styles.bandInfoCol}>
            <View style={styles.bandNameRow}>
              <Text style={[styles.bandNameText, { color: theme.textPrimary }]} numberOfLines={1}>
                {activeProfile.name}'s Band
              </Text>
              <View style={styles.batteryChip}>
                <Battery color={theme.textSecondary} size={12} style={{ marginRight: 3 }} />
                <Text style={[styles.batteryText, { color: theme.textSecondary }]}>
                  {activeProfile.battery !== null && activeProfile.battery !== undefined
                    ? `${activeProfile.battery}%`
                    : '--'}
                </Text>
              </View>
            </View>
            <View style={styles.statusRow}>
              <View style={styles.greenStatusDot} />
              <Text style={[styles.statusLabel, { color: theme.textSuccess }]}>Connected</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chatButton, { backgroundColor: theme.bg, borderColor: theme.border }]}
          onPress={() => navigation?.navigate('FamilySetup')}
          activeOpacity={0.8}
        >
          <MessageSquare color={theme.textPrimary} size={18} />
        </TouchableOpacity>
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
          <Text style={[styles.pageTitle, { color: theme.textPrimary }]}>Health Overview</Text>
          <Text style={[styles.pageSubtitle, { color: theme.textSecondary }]}>Today's health & activity</Text>
        </View>

        {/* 4. Live Status Card */}
        <View style={[styles.liveStatusCard, { backgroundColor: theme.bgCard, borderColor: theme.bgTagBorder }]}>
          <View style={styles.liveStatusLeft}>
            <View style={styles.livePulseDotContainer}>
              <View style={styles.livePulseOuter} />
              <View style={styles.livePulseInner} />
            </View>
            <View style={styles.liveStatusTextCol}>
              <Text style={[styles.liveStatusTitle, { color: theme.textPrimary }]}>
                {activeProfile.name} is active now
              </Text>
              <View style={styles.liveStatusSubRow}>
                <Watch color={theme.accent} size={13} style={{ marginRight: 4 }} />
                <Text style={[styles.liveStatusSubtitle, { color: theme.textSecondary }]}>{formatLastSynced(lastSyncedTime)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.liveBadge}>
            <Zap color="#00E676" size={12} style={{ marginRight: 4 }} />
            <Text style={styles.liveBadgeText}>Live Status</Text>
          </View>
        </View>

        {/* 5. Main Health Summary Card ("Today's Activity") */}
        <View style={[styles.sectionCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardHeaderTitle, { color: theme.textPrimary }]}>Today's Activity</Text>
            <Text style={[styles.cardHeaderTag, { color: theme.textSecondary }]}>Summary</Text>
          </View>

          <View style={styles.metricsGrid}>
            {/* Metric 1: Calories */}
            <View style={[styles.metricTile, { backgroundColor: theme.bgCardAlt, borderColor: theme.borderSub }]}>
              <View style={[styles.metricIconBox, { backgroundColor: 'rgba(255, 82, 82, 0.12)' }]}>
                <Flame color="#FF5252" size={18} />
              </View>
              <View style={styles.metricValueRow}>
                <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{calValue}</Text>
                <Text style={[styles.metricUnit, { color: theme.textSecondary }]}>kcal</Text>
              </View>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Calories</Text>
            </View>

            {/* Metric 2: Workout */}
            <View style={[styles.metricTile, { backgroundColor: theme.bgCardAlt, borderColor: theme.borderSub }]}>
              <View style={[styles.metricIconBox, { backgroundColor: 'rgba(0, 230, 118, 0.12)' }]}>
                <Activity color="#00E676" size={18} />
              </View>
              <View style={styles.metricValueRow}>
                <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{workValue}</Text>
                <Text style={[styles.metricUnit, { color: theme.textSecondary }]}>min</Text>
              </View>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Workout</Text>
            </View>

            {/* Metric 3: Steps */}
            <View style={[styles.metricTile, { backgroundColor: theme.bgCardAlt, borderColor: theme.borderSub }]}>
              <View style={[styles.metricIconBox, { backgroundColor: 'rgba(0, 191, 165, 0.12)' }]}>
                <Footprints color="#00BFA5" size={18} />
              </View>
              <View style={styles.metricValueRow}>
                <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{(m.steps || 0).toLocaleString()}</Text>
                <Text style={[styles.metricUnit, { color: theme.textSecondary }]}>steps</Text>
              </View>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Steps</Text>
            </View>

            {/* Metric 4: Move Hours */}
            <View style={[styles.metricTile, { backgroundColor: theme.bgCardAlt, borderColor: theme.borderSub }]}>
              <View style={[styles.metricIconBox, { backgroundColor: 'rgba(41, 182, 246, 0.12)' }]}>
                <Clock color="#29B6F6" size={18} />
              </View>
              <View style={styles.metricValueRow}>
                <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{moveValue}</Text>
                <Text style={[styles.metricUnit, { color: theme.textSecondary }]}>hrs</Text>
              </View>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Move Hours</Text>
            </View>
          </View>
        </View>

        {/* 6 & 7. Daily Goals & Activity Rings */}
        <View style={[styles.sectionCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.titleWithIcon}>
              <Target color={theme.accent} size={18} style={{ marginRight: 6 }} />
              <Text style={[styles.cardHeaderTitle, { color: theme.textPrimary }]}>Daily Goals</Text>
            </View>
            <Text style={[styles.cardHeaderTag, { color: theme.textSecondary }]}>Target Progress</Text>
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
            <View style={[styles.ringCenterIcon, { backgroundColor: theme.bgCardDeep, borderColor: theme.bgTagBorder }]}>
              <Flame color={theme.accent} size={20} />
            </View>
          </View>

          {/* Goal Progress Breakdown */}
          <View style={styles.goalProgressList}>
            {/* Calories Goal */}
            <View style={[styles.goalItem, { backgroundColor: theme.bgCardAlt, borderColor: theme.borderFaint }]}>
              <View style={styles.goalItemHeader}>
                <View style={styles.goalItemTitleRow}>
                  <View style={[styles.goalIndicatorDot, { backgroundColor: '#FF5252' }]} />
                  <Text style={[styles.goalItemName, { color: theme.textPrimary }]}>Calories</Text>
                </View>
                <View style={styles.goalItemValueRow}>
                  <Text style={[styles.goalItemValues, { color: theme.textPrimary }]}>
                    {calValue} <Text style={[styles.goalItemTarget, { color: theme.textSecondary }]}>/ {calGoal} kcal</Text>
                  </Text>
                  <View style={[styles.pctBadge, { backgroundColor: 'rgba(255, 82, 82, 0.14)' }]}>
                    <Text style={[styles.pctBadgeText, { color: '#FF5252' }]}>{calPct}%</Text>
                  </View>
                </View>
              </View>
              <View style={[styles.progressBarTrack, { backgroundColor: theme.bgProgressTrack }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    { backgroundColor: '#FF5252', width: `${Math.min(100, calPct)}%` },
                  ]}
                />
              </View>
            </View>

            {/* Workout Goal */}
            <View style={[styles.goalItem, { backgroundColor: theme.bgCardAlt, borderColor: theme.borderFaint }]}>
              <View style={styles.goalItemHeader}>
                <View style={styles.goalItemTitleRow}>
                  <View style={[styles.goalIndicatorDot, { backgroundColor: '#00E676' }]} />
                  <Text style={[styles.goalItemName, { color: theme.textPrimary }]}>Workout</Text>
                </View>
                <View style={styles.goalItemValueRow}>
                  <Text style={[styles.goalItemValues, { color: theme.textPrimary }]}>
                    {workValue} <Text style={[styles.goalItemTarget, { color: theme.textSecondary }]}>/ {workGoal} min</Text>
                  </Text>
                  <View style={[styles.pctBadge, { backgroundColor: 'rgba(0, 230, 118, 0.14)' }]}>
                    <Text style={[styles.pctBadgeText, { color: '#00E676' }]}>{workPct}%</Text>
                  </View>
                </View>
              </View>
              <View style={[styles.progressBarTrack, { backgroundColor: theme.bgProgressTrack }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    { backgroundColor: '#00E676', width: `${Math.min(100, workPct)}%` },
                  ]}
                />
              </View>
            </View>

            {/* Movement Goal */}
            <View style={[styles.goalItem, { backgroundColor: theme.bgCardAlt, borderColor: theme.borderFaint }]}>
              <View style={styles.goalItemHeader}>
                <View style={styles.goalItemTitleRow}>
                  <View style={[styles.goalIndicatorDot, { backgroundColor: '#29B6F6' }]} />
                  <Text style={[styles.goalItemName, { color: theme.textPrimary }]}>Movement</Text>
                </View>
                <View style={styles.goalItemValueRow}>
                  <Text style={[styles.goalItemValues, { color: theme.textPrimary }]}>
                    {moveValue} <Text style={[styles.goalItemTarget, { color: theme.textSecondary }]}>/ {moveGoal} hrs</Text>
                  </Text>
                  <View style={[styles.pctBadge, { backgroundColor: 'rgba(41, 182, 246, 0.14)' }]}>
                    <Text style={[styles.pctBadgeText, { color: '#29B6F6' }]}>{movePct}%</Text>
                  </View>
                </View>
              </View>
              <View style={[styles.progressBarTrack, { backgroundColor: theme.bgProgressTrack }]}>
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
        <View style={[styles.sectionCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.titleWithIcon}>
              <Activity color={theme.accent} size={18} style={{ marginRight: 6 }} />
              <Text style={[styles.cardHeaderTitle, { color: theme.textPrimary }]}>Health Insights</Text>
            </View>
            <Text style={[styles.cardHeaderTag, { color: theme.textSecondary }]}>Vitals</Text>
          </View>

          <View style={styles.insightsGrid}>
            {/* Insight 1: Heart Rate */}
            <TouchableOpacity
              style={[styles.insightCard, { backgroundColor: theme.bgCardAlt, borderColor: theme.borderSub }]}
              activeOpacity={0.8}
              onPress={() => navigation?.navigate('HealthDashboard')}
            >
              <View style={styles.insightHeaderRow}>
                <View style={[styles.insightIconBox, { backgroundColor: 'rgba(255, 82, 82, 0.12)' }]}>
                  <Heart color="#FF5252" size={16} />
                </View>
                <View style={styles.insightStatusTag}>
                  <Text style={styles.insightStatusTagText}>
                    {m.heartRate ? (m.heartRate < 60 ? 'Resting' : m.heartRate > 100 ? 'Elevated' : 'Normal') : 'Awaiting'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.insightName, { color: theme.textSecondary }]}>Heart Rate</Text>
              <View style={styles.insightValueRow}>
                <Text style={[styles.insightMainVal, { color: theme.textPrimary }]}>{m.heartRate ? m.heartRate : '--'}</Text>
                <Text style={[styles.insightValUnit, { color: theme.textSecondary }]}>BPM</Text>
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
            <View style={[styles.insightCard, { backgroundColor: theme.bgCardAlt, borderColor: theme.borderSub }]}>
              <View style={styles.insightHeaderRow}>
                <View style={[styles.insightIconBox, { backgroundColor: 'rgba(171, 71, 188, 0.12)' }]}>
                  <Moon color="#AB47BC" size={16} />
                </View>
                <View style={[styles.insightStatusTag, { backgroundColor: 'rgba(171, 71, 188, 0.14)' }]}>
                  <Text style={[styles.insightStatusTagText, { color: '#CE93D8' }]}>
                    {m.sleepDuration ? 'Good' : 'Tracking'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.insightName, { color: theme.textSecondary }]}>Sleep</Text>
              <View style={styles.insightValueRow}>
                <Text style={[styles.insightMainVal, { color: theme.textPrimary }]}>{m.sleepDuration ? m.sleepDuration : '--'}</Text>
              </View>
              <Text style={[styles.insightNote, { color: theme.textMuted }]}>
                {m.sleepDuration ? 'Optimal recovery' : 'Wear band during sleep'}
              </Text>
            </View>

            {/* Insight 3: Steps */}
            <View style={[styles.insightCard, { backgroundColor: theme.bgCardAlt, borderColor: theme.borderSub }]}>
              <View style={styles.insightHeaderRow}>
                <View style={[styles.insightIconBox, { backgroundColor: 'rgba(0, 191, 165, 0.12)' }]}>
                  <Footprints color="#00BFA5" size={16} />
                </View>
                <View style={[styles.insightStatusTag, { backgroundColor: 'rgba(0, 191, 165, 0.14)' }]}>
                  <Text style={[styles.insightStatusTagText, { color: '#00BFA5' }]}>
                    {(m.steps || 0) > 0 ? 'Active' : 'Standby'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.insightName, { color: theme.textSecondary }]}>Daily Steps</Text>
              <View style={styles.insightValueRow}>
                <Text style={[styles.insightMainVal, { color: theme.textPrimary }]}>{(m.steps || 0).toLocaleString()}</Text>
              </View>
              <Text style={[styles.insightNote, { color: theme.textMuted }]}>Goal: 10,000</Text>
            </View>

            {/* Insight 4: SpO2 Blood Oxygen */}
            <View style={[styles.insightCard, { backgroundColor: theme.bgCardAlt, borderColor: theme.borderSub }]}>
              <View style={styles.insightHeaderRow}>
                <View style={[styles.insightIconBox, { backgroundColor: 'rgba(41, 182, 246, 0.12)' }]}>
                  <Droplets color="#29B6F6" size={16} />
                </View>
                <View style={[styles.insightStatusTag, { backgroundColor: 'rgba(41, 182, 246, 0.14)' }]}>
                  <Text style={[styles.insightStatusTagText, { color: '#90CAF9' }]}>
                    {m.oxygen ? (m.oxygen >= 95 ? 'Optimal' : 'Low') : 'Awaiting'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.insightName, { color: theme.textSecondary }]}>Blood Oxygen</Text>
              <View style={styles.insightValueRow}>
                <Text style={[styles.insightMainVal, { color: theme.textPrimary }]}>{m.oxygen ? m.oxygen : '--'}</Text>
                <Text style={[styles.insightValUnit, { color: theme.textSecondary }]}>%</Text>
              </View>
              <Text style={[styles.insightNote, { color: theme.textMuted }]}>
                {m.oxygen ? 'Healthy saturation' : 'Sync to record SpO2'}
              </Text>
            </View>

            {/* Insight 5: HRV Recovery */}
            <View style={[styles.insightCard, { backgroundColor: theme.bgCardAlt, borderColor: theme.borderSub }]}>
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
              <Text style={[styles.insightName, { color: theme.textSecondary }]}>Heart Rate Var</Text>
              <View style={styles.insightValueRow}>
                <Text style={[styles.insightMainVal, { color: theme.textPrimary }]}>{m.hrv ? m.hrv : '--'}</Text>
                <Text style={[styles.insightValUnit, { color: theme.textSecondary }]}>ms</Text>
              </View>
              <Text style={[styles.insightNote, { color: theme.textMuted }]}>
                {m.hrv ? 'Pebble RMSSD score' : 'Sync to record HRV'}
              </Text>
            </View>

            {/* Insight 6: Distance */}
            <View style={[styles.insightCard, { backgroundColor: theme.bgCardAlt, borderColor: theme.borderSub }]}>
              <View style={styles.insightHeaderRow}>
                <View style={[styles.insightIconBox, { backgroundColor: 'rgba(255, 167, 38, 0.12)' }]}>
                  <Compass color="#FFA726" size={16} />
                </View>
                <View style={[styles.insightStatusTag, { backgroundColor: 'rgba(255, 167, 38, 0.14)' }]}>
                  <Text style={[styles.insightStatusTagText, { color: '#FFA726' }]}>
                    {m.distance ? 'Tracked' : 'Standby'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.insightName, { color: theme.textSecondary }]}>Distance</Text>
              <View style={styles.insightValueRow}>
                <Text style={[styles.insightMainVal, { color: theme.textPrimary }]}>{m.distance !== null && m.distance !== undefined ? m.distance : '--'}</Text>
                <Text style={[styles.insightValUnit, { color: theme.textSecondary }]}>km</Text>
              </View>
              <Text style={[styles.insightNote, { color: theme.textMuted }]}>
                {m.distance ? 'Pebble activity distance' : 'Sync to record distance'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // 1. Compact Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 42,
    paddingBottom: 10,
    borderBottomWidth: 1,
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
    fontSize: 11,
    fontWeight: '600',
  },
  chatButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
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
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  // 4. Live Status Card
  liveStatusCard: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
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
    fontSize: 13,
    fontWeight: '700',
  },
  liveStatusSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  liveStatusSubtitle: {
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
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
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
    letterSpacing: 0.2,
  },
  cardHeaderTag: {
    fontSize: 11,
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
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
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
  },
  metricUnit: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricLabel: {
    fontSize: 12,
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
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },

  // 7. Goal Progress
  goalProgressList: {
    marginTop: 10,
    gap: 10,
  },
  goalItem: {
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
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
  },
  goalItemValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  goalItemValues: {
    fontSize: 11,
    fontWeight: '700',
  },
  goalItemTarget: {
    fontWeight: 'normal',
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
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
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
  },
  insightValUnit: {
    fontSize: 11,
    fontWeight: '600',
  },
  insightNote: {
    fontSize: 10,
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
