import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Plus, Users } from 'lucide-react-native';
import { useProfile } from '../context/ProfileContext';

export default function ProfileSwitcher({ navigation }) {
  const { profiles, activeProfileId, switchProfile } = useProfile();

  const handleAddPress = () => {
    if (navigation) {
      navigation.navigate('FamilySetup');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleWithBadge}>
          <Users color="#00BFA5" size={16} style={{ marginRight: 6 }} />
          <Text style={styles.headerLabel}>Family</Text>
        </View>
        <Text style={styles.switchHint}>Tap a profile to view their health</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {profiles.map((profile) => {
          const isActive = profile.id === activeProfileId;

          return (
            <TouchableOpacity
              key={profile.id}
              style={[styles.profileItem, isActive && styles.activeProfileItem]}
              onPress={() => switchProfile(profile.id)}
              activeOpacity={0.7}
            >
              {/* Ring around Avatar */}
              <View
                style={[
                  styles.avatarRing,
                  isActive ? styles.avatarRingActive : styles.avatarRingInactive,
                ]}
              >
                <View style={styles.avatarInner}>
                  {profile.avatar ? (
                    <Image source={{ uri: profile.avatar }} style={styles.avatarImg} />
                  ) : (
                    <View style={styles.initialsBox}>
                      <Text style={styles.initialsText}>{profile.initials || 'U'}</Text>
                    </View>
                  )}
                </View>

                {/* Active Online Indicator */}
                {isActive && (
                  <View style={styles.activeDotBadge}>
                    <View style={styles.activeDotInner} />
                  </View>
                )}
              </View>

              {/* Profile Name */}
              <Text
                style={[styles.profileName, isActive && styles.profileNameActive]}
                numberOfLines={1}
              >
                {profile.name}
              </Text>

              {/* Relationship Badge */}
              <View style={[styles.roleBadge, isActive && styles.roleBadgeActive]}>
                <Text style={[styles.roleText, isActive && styles.roleTextActive]}>
                  {profile.role ? `${profile.role}` : 'Family Circle'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Add Family Member Profile Button */}
        <TouchableOpacity
          style={styles.addProfileItem}
          onPress={handleAddPress}
          activeOpacity={0.7}
        >
          <View style={styles.addRing}>
            <Plus color="#00BFA5" size={20} />
          </View>
          <Text style={styles.addText} numberOfLines={1}>
            + Invite
          </Text>
          <View style={styles.addRoleBadge}>
            <Text style={styles.addRoleText}>Invite</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    backgroundColor: '#002B36',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(122, 158, 168, 0.12)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  switchHint: {
    fontSize: 11,
    color: '#8FAAB2',
  },
  scrollList: {
    paddingHorizontal: 16,
    gap: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileItem: {
    alignItems: 'center',
    width: 72,
    outlineStyle: 'none',
  },
  activeProfileItem: {
    transform: [{ scale: 1.02 }],
  },
  avatarRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2.5,
    position: 'relative',
  },
  avatarRingActive: {
    borderWidth: 2.5,
    borderColor: '#00BFA5',
    backgroundColor: 'rgba(0, 191, 165, 0.12)',
  },
  avatarRingInactive: {
    borderWidth: 1.5,
    borderColor: 'rgba(122, 158, 168, 0.25)',
    backgroundColor: '#001F27',
  },
  avatarInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#001F27',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  initialsBox: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#004D40',
  },
  initialsText: {
    color: '#00BFA5',
    fontWeight: 'bold',
    fontSize: 16,
  },
  activeDotBadge: {
    position: 'absolute',
    bottom: 0,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#002B36',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDotInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#00E676',
  },
  profileName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8FAAB2',
    marginTop: 5,
    textAlign: 'center',
  },
  profileNameActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  roleBadge: {
    marginTop: 3,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    backgroundColor: 'rgba(122, 158, 168, 0.12)',
  },
  roleBadgeActive: {
    backgroundColor: 'rgba(0, 191, 165, 0.18)',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 191, 165, 0.4)',
  },
  roleText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#7A9EA8',
  },
  roleTextActive: {
    color: '#00BFA5',
  },
  addProfileItem: {
    alignItems: 'center',
    width: 70,
    outlineStyle: 'none',
  },
  addRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    borderColor: '#00BFA5',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 191, 165, 0.06)',
  },
  addText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00BFA5',
    marginTop: 5,
    textAlign: 'center',
  },
  addRoleBadge: {
    marginTop: 3,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 191, 165, 0.1)',
  },
  addRoleText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#00BFA5',
  },
});
