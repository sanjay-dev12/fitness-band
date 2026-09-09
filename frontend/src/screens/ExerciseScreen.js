import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Activity, Play } from 'lucide-react-native';

export default function ExerciseScreen() {
  return (
    <View style={styles.container}>
      {/* Map Background Placeholder */}
      <View style={styles.mapBackground}>
        <View style={styles.mapLine} />
        <View style={[styles.mapLine, { top: 300, left: -50, transform: [{ rotate: '-20deg' }] }]} />
      </View>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Exercise</Text>
      </View>

      <View style={styles.cardContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity style={[styles.exerciseCard, styles.exerciseCardActive]}>
            <Activity color="#1A1A1A" size={32} />
            <Text style={styles.exerciseCardTitleActive}>Outdoor Run</Text>
            <View style={styles.activeIndicator} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.exerciseCard}>
            <Activity color="#A0A0A0" size={32} />
            <Text style={styles.exerciseCardTitle}>Indoor Run</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exerciseCard}>
            <Activity color="#A0A0A0" size={32} />
            <Text style={styles.exerciseCardTitle}>Outdoor Walk</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>You have kept doing sports for 0.00km. Keep moving!</Text>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.goButton}>
          <Text style={styles.goButtonText}>GO</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.trainingLink}>? Training Instructions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Remove redundant import

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8', // Lighter background for the map area
  },
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E8EDF2',
    opacity: 0.5,
  },
  mapLine: {
    position: 'absolute',
    top: 150,
    left: 50,
    width: 500,
    height: 20,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
    borderRadius: 10,
  },
  header: {
    backgroundColor: '#002B36',
    padding: 24,
    paddingTop: 50,
    paddingBottom: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  cardContainer: {
    marginTop: -30,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    width: 140,
    height: 120,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  exerciseCardActive: {
    borderWidth: 1,
    borderColor: '#00BFA5',
  },
  exerciseCardTitle: {
    color: '#A0A0A0',
    fontSize: 16,
    marginTop: 12,
  },
  exerciseCardTitleActive: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },
  activeIndicator: {
    width: 20,
    height: 4,
    backgroundColor: '#00BFA5',
    borderRadius: 2,
    marginTop: 8,
  },
  statsContainer: {
    padding: 24,
    alignItems: 'center',
  },
  statsText: {
    color: '#333333',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  goButton: {
    backgroundColor: '#00BFA5',
    width: 200,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#00BFA5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  goButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  trainingLink: {
    color: '#5C6BC0',
    fontSize: 16,
  },
});
