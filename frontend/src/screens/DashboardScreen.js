import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Activity, Droplet, Footprints } from 'lucide-react-native';
import HealthRing from '../components/HealthRing';
import { useProfile } from '../context/ProfileContext';

export default function DashboardScreen() {
  const { activeProfile, refreshHealthData, syncHealthData } = useProfile();
  const [refreshing, setRefreshing] = useState(false);

  const m = activeProfile?.metrics || {};

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      if (syncHealthData) {
        await syncHealthData();
      } else if (refreshHealthData) {
        await refreshHealthData();
      }
    } catch (e) {
      console.warn('Refresh error:', e);
    } finally {
      setRefreshing(false);
    }
  }, [syncHealthData, refreshHealthData]);

  const stepGoal = 10000;
  const hrVal = m.heartRate;
  const oxVal = m.oxygen;
  const stepsVal = m.steps || 0;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00BFA5" />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Good Morning,</Text>
        <Text style={styles.userName}>{activeProfile?.name || 'User'}</Text>
      </View>

      <View style={styles.mainRingContainer}>
        <HealthRing 
          radius={110} 
          strokeWidth={18} 
          color="#FF4B4B" 
          percentage={hrVal ? Math.min(100, (hrVal / 180) * 100) : 0}
          icon={<Activity color="#FF4B4B" size={32} />}
          label="Heart Rate"
          value={hrVal ? hrVal : '--'}
          unit="BPM"
          pulse={!!hrVal}
        />
      </View>

      <View style={styles.secondaryRingsContainer}>
        <HealthRing 
          radius={70} 
          strokeWidth={12} 
          color="#00D8FF" 
          percentage={oxVal ? oxVal : 0}
          icon={<Droplet color="#00D8FF" size={24} />}
          label="SpO2 Level"
          value={oxVal ? oxVal : '--'}
          unit="%"
        />
        <HealthRing 
          radius={70} 
          strokeWidth={12} 
          color="#00FF87" 
          percentage={Math.min(100, (stepsVal / stepGoal) * 100)}
          icon={<Footprints color="#00FF87" size={24} />}
          label="Steps"
          value={stepsVal > 0 ? stepsVal.toLocaleString() : '0'}
          unit="/ 10k"
        />
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Daily Summary</Text>
        <Text style={styles.cardText}>
          {hrVal || stepsVal > 0
            ? `Synchronized telemetry from ${m.source || 'connected wearable'}. Steps: ${stepsVal.toLocaleString()} (${Math.round((stepsVal / stepGoal) * 100)}% of goal).`
            : 'No health records synchronized yet today. Pull to refresh or tap Sync Health Data in Devices.'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 24,
    paddingTop: 32,
  },
  greeting: {
    color: '#A0A0A0',
    fontSize: 18,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  mainRingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  secondaryRingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 24,
    margin: 24,
    marginTop: 40,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardText: {
    color: '#A0A0A0',
    fontSize: 14,
    lineHeight: 22,
  },
});
