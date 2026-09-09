import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { UserPlus, Activity, Droplet } from 'lucide-react-native';

const MOCK_FAMILY = [
  { id: '1', name: 'Mom', relation: 'Parent', status: 'Active', heartRate: 68, oxygen: 99, avatar: 'https://i.pravatar.cc/150?u=mom' },
  { id: '2', name: 'Dad', relation: 'Parent', status: 'Active', heartRate: 75, oxygen: 97, avatar: 'https://i.pravatar.cc/150?u=dad' },
  { id: '3', name: 'Lily', relation: 'Child', status: 'Pending', avatar: 'https://i.pravatar.cc/150?u=lily' },
];

export default function FamilyCircleScreen({ navigation }) {
  const [familyMembers, setFamilyMembers] = useState(MOCK_FAMILY);

  const handleAddFamily = () => {
    if (navigation) {
      navigation.navigate('FamilySetup');
    }
  };

  const renderMember = ({ item }) => (
    <TouchableOpacity style={styles.memberCard}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberRelation}>{item.relation}</Text>
        
        {item.status === 'Active' ? (
          <View style={styles.statsContainer}>
            <View style={styles.statBadge}>
              <Activity color="#00BFA5" size={14} />
              <Text style={styles.statText}>{item.heartRate} bpm</Text>
            </View>
            <View style={styles.statBadge}>
              <Droplet color="#2196F3" size={14} />
              <Text style={styles.statText}>{item.oxygen}%</Text>
            </View>
          </View>
        ) : (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>Pending Invite</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Life Circle</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddFamily}>
          <UserPlus color="#003344" size={24} />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Monitor your family's well-being</Text>

      <View style={styles.backgroundPanel}>
        <FlatList
          data={familyMembers}
          keyExtractor={item => item.id}
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
    backgroundColor: '#002B36',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 50,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#7A9EA8',
    fontSize: 16,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#00BFA5',
    padding: 10,
    borderRadius: 50,
  },
  backgroundPanel: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingTop: 30,
  },
  listContainer: {
    paddingBottom: 20,
  },
  memberCard: {
    backgroundColor: '#F4F6F8',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    color: '#333333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  memberRelation: {
    color: '#A0A0A0',
    fontSize: 14,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E8EAF6',
  },
  statText: {
    color: '#333333',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '600',
  },
  pendingBadge: {
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  pendingText: {
    color: '#FFA500',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
