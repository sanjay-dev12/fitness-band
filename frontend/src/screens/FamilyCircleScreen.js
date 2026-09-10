import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { UserPlus, Activity, Droplet, ArrowRight, ShieldCheck } from 'lucide-react-native';
import ProfileSwitcher from '../components/ProfileSwitcher';
import { useProfile } from '../context/ProfileContext';

export default function FamilyCircleScreen({ navigation }) {
  const { profiles, activeProfileId, switchProfile } = useProfile();

  const handleAddFamily = () => {
    if (navigation) {
      navigation.navigate('FamilySetup');
    }
  };

  const handleSelectMember = (profileId) => {
    switchProfile(profileId);
    if (navigation) {
      navigation.navigate('Home');
    }
  };

  const renderMember = ({ item }) => {
    const isActive = item.id === activeProfileId;

    return (
      <TouchableOpacity
        style={[styles.memberCard, isActive && styles.activeMemberCard]}
        onPress={() => handleSelectMember(item.id)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.memberInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.memberName}>{item.name}</Text>
            {isActive && (
              <View style={styles.activeTag}>
                <Text style={styles.activeTagText}>Active</Text>
              </View>
            )}
          </View>
          <Text style={styles.memberRelation}>{item.role || 'Member'}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statBadge}>
              <Activity color="#00BFA5" size={14} />
              <Text style={styles.statText}>{item.metrics?.heartRate || 72} bpm</Text>
            </View>
            <View style={styles.statBadge}>
              <Droplet color="#2196F3" size={14} />
              <Text style={styles.statText}>{item.metrics?.oxygen || 98}% SpO2</Text>
            </View>
          </View>
        </View>
        <ArrowRight color="#7A9EA8" size={18} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Life Circle</Text>
          <Text style={styles.subtitle}>Family Connected Members</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddFamily}>
          <UserPlus color="#001F27" size={20} />
        </TouchableOpacity>
      </View>

      {/* Instagram-style Profile Switcher */}
      <ProfileSwitcher navigation={navigation} />

      <View style={styles.backgroundPanel}>
        <Text style={styles.listSectionTitle}>Connected Family Devices</Text>
        <FlatList
          data={profiles}
          keyExtractor={(item) => item.id}
          renderItem={renderMember}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
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
    paddingTop: 48,
    paddingBottom: 14,
    backgroundColor: '#002B36',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#7A9EA8',
    fontSize: 13,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#00BFA5',
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundPanel: {
    flex: 1,
    backgroundColor: '#001F27',
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  listSectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  listContainer: {
    paddingBottom: 24,
    gap: 12,
  },
  memberCard: {
    backgroundColor: '#002B36',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.2)',
  },
  activeMemberCard: {
    borderColor: '#00BFA5',
    backgroundColor: 'rgba(0, 43, 54, 0.95)',
    borderWidth: 1.5,
    shadowColor: '#00BFA5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 14,
    backgroundColor: '#001F27',
  },
  memberInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeTag: {
    backgroundColor: 'rgba(0, 230, 118, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#00E676',
  },
  activeTagText: {
    color: '#00E676',
    fontSize: 10,
    fontWeight: '700',
  },
  memberRelation: {
    color: '#7A9EA8',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#001F27',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.2)',
  },
  statText: {
    color: '#FFFFFF',
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '600',
  },
});
