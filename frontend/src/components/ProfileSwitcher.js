import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Plus, User, ShieldCheck } from 'lucide-react-native';
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
          <ShieldCheck color="#00BFA5" size={16} style={{ marginRight: 6 }} />
          <Text style={styles.headerLabel}>Family Profiles</Text>
        </View>
        <Text style={styles.switchHint}>Tap to switch activity</Text>
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
              {/* Instagram-style Ring around Avatar */}
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

                {/* Active Indicator Pulse Dot */}
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

              {/* Role Badge */}
              <View style={[styles.roleBadge, isActive && styles.roleBadgeActive]}>
                <Text style={[styles.roleText, isActive && styles.roleTextActive]}>
                  {profile.role || 'Member'}
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
            <Plus color="#00BFA5" size={22} />
          </View>
          <Text style={styles.addText} numberOfLines={1}>
            + Invite
          </Text>
          <View style={styles.addRoleBadge}>
            <Text style={styles.addRoleText}>New</Text>
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
    borderBottomColor: 'rgba(122, 158, 168, 0.15)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  switchHint: {
    fontSize: 11,
    color: '#7A9EA8',
  },
  scrollList: {
    paddingHorizontal: 16,
    gap: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileItem: {
    alignItems: 'center',
    width: 76,
    outlineStyle: 'none',
  },
  activeProfileItem: {
    transform: [{ scale: 1.04 }],
  },
  avatarRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
    position: 'relative',
  },
  avatarRingActive: {
    borderWidth: 2.5,
    borderColor: '#00BFA5',
    backgroundColor: 'rgba(0, 191, 165, 0.12)',
    shadowColor: '#00BFA5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  avatarRingInactive: {
    borderWidth: 1.5,
    borderColor: 'rgba(122, 158, 168, 0.3)',
    backgroundColor: '#001F27',
  },
  avatarInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
    fontSize: 18,
  },
  activeDotBadge: {
    position: 'absolute',
    bottom: 0,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#001F27',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00E676',
  },
  profileName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7A9EA8',
    marginTop: 6,
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
    borderRadius: 8,
    backgroundColor: 'rgba(122, 158, 168, 0.15)',
  },
  roleBadgeActive: {
    backgroundColor: 'rgba(0, 191, 165, 0.2)',
    borderWidth: 0.5,
    borderColor: '#00BFA5',
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
    width: 74,
    outlineStyle: 'none',
  },
  addRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#00BFA5',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 191, 165, 0.08)',
  },
  addText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00BFA5',
    marginTop: 6,
    textAlign: 'center',
  },
  addRoleBadge: {
    marginTop: 3,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 191, 165, 0.1)',
  },
  addRoleText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#00BFA5',
  },
});
