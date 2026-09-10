import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
  Watch,
  MessageSquare,
  Flame,
  Activity,
  Footprints,
  Clock,
  Moon,
  Heart,
  Droplets,
  BatteryCharging,
  Sparkles,
  Award,
} from 'lucide-react-native';
import ProfileSwitcher from '../components/ProfileSwitcher';
import { useProfile } from '../context/ProfileContext';

export default function HomeScreen({ navigation }) {
  const { activeProfile } = useProfile();
  const m = activeProfile.metrics || {};

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.addDeviceChip}
            onPress={() => navigation?.navigate('Device')}
          >
            <Watch color="#00BFA5" size={16} />
            <Text style={styles.addDeviceText}>
              {activeProfile.name}'s Band • {activeProfile.battery || 90}%
            </Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Health Telemetry</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => navigation?.navigate('FamilySetup')}
          >
            <MessageSquare color="#FFFFFF" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Instagram-style Profile Switcher */}
      <ProfileSwitcher navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Active Profile Info Banner */}
        <View style={styles.activeBanner}>
          <View style={styles.activeBannerLeft}>
            <Sparkles color="#00BFA5" size={16} style={{ marginRight: 6 }} />
            <Text style={styles.activeBannerText}>
              Live Telemetry: <Text style={styles.activeBannerName}>{activeProfile.name}</Text> ({activeProfile.role})
            </Text>
          </View>
          <View style={styles.statusPill}>
            <View style={styles.livePulse} />
            <Text style={styles.statusPillText}>{m.statusText || 'Normal'}</Text>
          </View>
        </View>

        {/* Main Activity Ring Card */}
        <View style={styles.mainCard}>
          <View style={styles.mainCardContent}>
            {/* Calories / Activity */}
            <View style={styles.activityRow}>
              <Flame color="#FF4B4B" size={18} />
              <Text style={styles.activityLabel}>Active Energy</Text>
            </View>
            <Text style={styles.activityValue}>
              {m.calories || 0}{' '}
              <Text style={styles.activityUnit}>/{m.caloriesGoal || 500} kcal</Text>
            </Text>

            {/* Exercise Minutes */}
            <View style={styles.activityRow}>
              <Activity color="#00E676" size={18} />
              <Text style={styles.activityLabelGreen}>Workout</Text>
            </View>
            <Text style={styles.activityValue}>
              {m.exerciseMins || 0}{' '}
              <Text style={styles.activityUnit}>/{m.exerciseGoal || 30} min</Text>
            </Text>

            {/* Walking Hours */}
            <View style={styles.activityRow}>
              <Footprints color="#2196F3" size={18} />
              <Text style={styles.activityLabelBlue}>Move Hours</Text>
            </View>
            <Text style={styles.activityValue}>
              {m.walkingHours || 0}{' '}
              <Text style={styles.activityUnit}>/{m.walkingGoal || 12} hr</Text>
            </Text>
          </View>

          {/* Visual Activity Rings */}
          <View style={styles.mainCardGraphic}>
            <View style={styles.ringOuter}>
              <View style={styles.ringMiddle}>
                <View style={styles.ringInner}>
                  <Flame color="#FF4B4B" size={20} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Grid Cards for Specific Health Metrics */}
        <View style={styles.grid}>
          {/* Steps */}
          <View style={styles.gridCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.gridTitle}>Daily Steps</Text>
              <Footprints color="#00BFA5" size={20} />
            </View>
            <Text style={styles.gridMainValue}>
              {(m.steps || 0).toLocaleString()}
            </Text>
            <Text style={styles.gridSubText}>Goal: 10,000 steps</Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(100, ((m.steps || 0) / 10000) * 100)}%` },
                ]}
              />
            </View>
          </View>

          {/* Heart Rate */}
          <View style={styles.gridCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.gridTitle}>Heart Rate</Text>
              <Heart color="#FF4B4B" size={20} />
            </View>
            <Text style={[styles.gridMainValue, { color: '#FF4B4B' }]}>
              {m.heartRate || 72} <Text style={styles.gridUnit}>bpm</Text>
            </Text>
            <Text style={styles.gridSubText}>Real-time sensor active</Text>
            <View style={styles.pulseContainer}>
              <View style={styles.waveBar} />
              <View style={[styles.waveBar, { height: 18 }]} />
              <View style={[styles.waveBar, { height: 26, backgroundColor: '#FF4B4B' }]} />
              <View style={[styles.waveBar, { height: 14 }]} />
              <View style={styles.waveBar} />
            </View>
          </View>

          {/* Sleep */}
          <View style={styles.gridCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.gridTitle}>Sleep Rest</Text>
              <Moon color="#AB47BC" size={20} />
            </View>
            <Text style={styles.gridMainValue}>
              {m.sleepDuration || '7h 30m'}
            </Text>
            <Text style={styles.gridSubText}>Quality: Optimal</Text>
            <View style={styles.sleepBadge}>
              <Text style={styles.sleepBadgeText}>Deep: 2h 15m</Text>
            </View>
          </View>

          {/* Blood Oxygen SpO2 */}
          <View style={styles.gridCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.gridTitle}>SpO2 Blood</Text>
              <Droplets color="#2196F3" size={20} />
            </View>
            <Text style={[styles.gridMainValue, { color: '#2196F3' }]}>
              {m.oxygen || 98}%
            </Text>
            <Text style={styles.gridSubText}>Healthy saturation</Text>
            <View style={styles.oxygenBar}>
              <View style={styles.oxygenDot} />
              <Text style={styles.oxygenText}>95-100% Normal</Text>
            </View>
          </View>

          {/* Body Age */}
          <View style={styles.gridCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.gridTitle}>Body Age</Text>
              <Award color="#FFB300" size={20} />
            </View>
            <Text style={[styles.gridMainValue, { color: '#FFB300' }]}>
              {m.bodyAge || 25}{' '}
              <Text style={styles.gridUnit}>yrs</Text>
            </Text>
            <Text style={styles.gridSubText}>Fitness index: Excellent</Text>
          </View>

          {/* Burned Calories */}
          <View style={styles.gridCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.gridTitle}>Calories</Text>
              <Flame color="#FF7043" size={20} />
            </View>
            <Text style={[styles.gridMainValue, { color: '#FF7043' }]}>
              {m.calories || 0}{' '}
              <Text style={styles.gridUnit}>kcal</Text>
            </Text>
            <Text style={styles.gridSubText}>Resting: 1,420 kcal</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 46,
    paddingBottom: 14,
    backgroundColor: '#002B36',
  },
  headerLeft: {
    alignItems: 'flex-start',
  },
  addDeviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 191, 165, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 165, 0.3)',
  },
  addDeviceText: {
    color: '#00BFA5',
    marginLeft: 6,
    fontSize: 11,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#001F27',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.3)',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
  },
  activeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#002B36',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 165, 0.25)',
  },
  activeBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activeBannerText: {
    color: '#7A9EA8',
    fontSize: 12,
    fontWeight: '500',
  },
  activeBannerName: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E676',
    marginRight: 6,
  },
  statusPillText: {
    color: '#00E676',
    fontSize: 10,
    fontWeight: '700',
  },
  mainCard: {
    backgroundColor: '#002B36',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.2)',
  },
  mainCardContent: {
    flex: 1,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  activityLabel: {
    color: '#FF4B4B',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  activityLabelGreen: {
    color: '#00E676',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  activityLabelBlue: {
    color: '#2196F3',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  activityValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  activityUnit: {
    fontSize: 12,
    color: '#7A9EA8',
    fontWeight: 'normal',
  },
  mainCardGraphic: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10,
  },
  ringOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 7,
    borderColor: 'rgba(255, 75, 75, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringMiddle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 7,
    borderColor: 'rgba(0, 230, 118, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 6,
    borderColor: 'rgba(33, 150, 243, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#001F27',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridCard: {
    backgroundColor: '#002B36',
    borderRadius: 18,
    width: '48%',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.18)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7A9EA8',
  },
  gridMainValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  gridUnit: {
    fontSize: 13,
    color: '#7A9EA8',
    fontWeight: 'normal',
  },
  gridSubText: {
    fontSize: 11,
    color: '#7A9EA8',
    marginBottom: 8,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(122, 158, 168, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00BFA5',
    borderRadius: 3,
  },
  pulseContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 26,
    marginTop: 4,
  },
  waveBar: {
    width: 4,
    height: 8,
    backgroundColor: 'rgba(255, 75, 75, 0.4)',
    borderRadius: 2,
  },
  sleepBadge: {
    backgroundColor: 'rgba(171, 71, 188, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  sleepBadgeText: {
    color: '#CE93D8',
    fontSize: 10,
    fontWeight: '600',
  },
  oxygenBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  oxygenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2196F3',
  },
  oxygenText: {
    color: '#90CAF9',
    fontSize: 10,
    fontWeight: '600',
  },
});
