import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Watch, MessageSquare, Flame, Activity, Footprints, Clock, Moon, Heart } from 'lucide-react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.addDeviceChip}>
            <Watch color="#00BFA5" size={16} />
            <Text style={styles.addDeviceText}>Add Device</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Health Data</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.editText}>Edit</Text>
          <TouchableOpacity>
            <MessageSquare color="#FFFFFF" size={24} style={{ marginLeft: 16 }} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Activity Card */}
        <View style={styles.mainCard}>
          <View style={styles.mainCardContent}>
            <View style={styles.activityRow}>
              <Flame color="#FF4B4B" size={16} />
              <Text style={styles.activityLabel}>Activity</Text>
            </View>
            <Text style={styles.activityValue}>0 <Text style={styles.activityUnit}>/500 kcal</Text></Text>

            <View style={styles.activityRow}>
              <Activity color="#00E676" size={16} />
              <Text style={styles.activityLabelGreen}>Exercise</Text>
            </View>
            <Text style={styles.activityValue}>0 <Text style={styles.activityUnit}>/30 min</Text></Text>

            <View style={styles.activityRow}>
              <Footprints color="#2196F3" size={16} />
              <Text style={styles.activityLabelBlue}>Walking</Text>
            </View>
            <Text style={styles.activityValue}>0 <Text style={styles.activityUnit}>/12 hr</Text></Text>
          </View>
          
          <View style={styles.mainCardGraphic}>
            {/* Placeholder for circular ring graphic */}
            <View style={styles.ringOuter}>
              <View style={styles.ringInner} />
            </View>
          </View>
        </View>

        {/* Grid Cards */}
        <View style={styles.grid}>
          <View style={styles.gridCard}>
            <Text style={styles.gridTitle}>Body Age</Text>
            <UserIconGraphic />
          </View>
          <View style={styles.gridCard}>
            <Text style={styles.gridTitle}>Steps</Text>
            <FootGraphic />
          </View>
          <View style={styles.gridCard}>
            <Text style={styles.gridTitle}>Sports Records</Text>
            <RunnerGraphic />
          </View>
          <View style={styles.gridCard}>
            <Text style={styles.gridTitle}>Sleep</Text>
            <MoonGraphic />
          </View>
          <View style={styles.gridCard}>
            <Text style={styles.gridTitle}>Heart Rate</Text>
          </View>
          <View style={styles.gridCard}>
            <Text style={styles.gridTitle}>Calories</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Simple placeholder graphics for the cards using raw views
const UserIconGraphic = () => (
  <View style={styles.graphicPlaceholder}>
    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0, 191, 165, 0.2)' }} />
  </View>
);
const FootGraphic = () => (
  <View style={styles.graphicPlaceholder}>
    <View style={{ width: 50, height: 50, backgroundColor: 'rgba(139, 195, 74, 0.2)', transform: [{ rotate: '45deg' }], borderRadius: 10 }} />
  </View>
);
const RunnerGraphic = () => (
  <View style={styles.graphicPlaceholder}>
    <View style={{ width: 40, height: 40, backgroundColor: 'rgba(0, 230, 118, 0.2)', borderRadius: 5 }} />
  </View>
);
const MoonGraphic = () => (
  <View style={styles.graphicPlaceholder}>
    <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(171, 71, 188, 0.4)' }} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002B36',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 50,
  },
  headerLeft: {
    alignItems: 'flex-start',
  },
  addDeviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#003E4D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  addDeviceText: {
    color: '#00BFA5',
    marginLeft: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editText: {
    color: '#7A9EA8',
    fontSize: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  mainCard: {
    backgroundColor: '#F4F6F8',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  mainCardContent: {
    flex: 1,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  activityLabel: {
    color: '#FF4B4B',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  activityLabelGreen: {
    color: '#00E676',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  activityLabelBlue: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  activityValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  activityUnit: {
    fontSize: 14,
    color: '#A0A0A0',
    fontWeight: 'normal',
  },
  mainCardGraphic: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 10,
  },
  ringOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 10,
    borderColor: 'rgba(255, 75, 75, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 10,
    borderColor: 'rgba(0, 230, 118, 0.1)',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    backgroundColor: '#F4F6F8',
    borderRadius: 24,
    width: '48%',
    height: 160,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  graphicPlaceholder: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    opacity: 0.8,
  },
});
