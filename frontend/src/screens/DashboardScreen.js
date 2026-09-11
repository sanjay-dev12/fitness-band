import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Activity, Droplet, Footprints } from 'lucide-react-native';
import HealthRing from '../components/HealthRing';
import { useProfile } from '../context/ProfileContext';

export default function DashboardScreen() {
  const { activeProfile } = useProfile();
  const [refreshing, setRefreshing] = useState(false);
  const [healthData, setHealthData] = useState({
    heartRate: 72,
    oxygenLevel: 98,
    steps: 6430,
    goal: 10000,
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate fetching new data
    setTimeout(() => {
      setHealthData({
        heartRate: Math.floor(Math.random() * (100 - 60 + 1) + 60),
        oxygenLevel: Math.floor(Math.random() * (100 - 95 + 1) + 95),
        steps: Math.floor(Math.random() * (10000 - 5000 + 1) + 5000),
        goal: 10000,
      });
      setRefreshing(false);
    }, 1500);
  }, []);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF4B4B" />
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
          percentage={(healthData.heartRate / 180) * 100}
          icon={<Activity color="#FF4B4B" size={32} />}
          label="Heart Rate"
          value={healthData.heartRate}
          unit="BPM"
          pulse={true}
        />
      </View>

      <View style={styles.secondaryRingsContainer}>
        <HealthRing 
          radius={70} 
          strokeWidth={12} 
          color="#00D8FF" 
          percentage={healthData.oxygenLevel}
          icon={<Droplet color="#00D8FF" size={24} />}
          label="SpO2 Level"
          value={healthData.oxygenLevel}
          unit="%"
        />
        <HealthRing 
          radius={70} 
          strokeWidth={12} 
          color="#00FF87" 
          percentage={(healthData.steps / healthData.goal) * 100}
          icon={<Footprints color="#00FF87" size={24} />}
          label="Steps"
          value={healthData.steps}
          unit="/ 10k"
        />
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Daily Summary</Text>
        <Text style={styles.cardText}>You are doing great today! Your heart rate is stable and you've hit 64% of your daily step goal.</Text>
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
