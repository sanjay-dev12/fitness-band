import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
} from 'react-native';
import {
  UserPlus,
  Heart,
  Droplets,
  ChevronRight,
  Activity,
  TriangleAlert,
  Users,
  Watch,
  Plus,
} from 'lucide-react-native';
import ProfileSwitcher from '../components/ProfileSwitcher';
import { useProfile } from '../context/ProfileContext';

export default function FamilyCircleScreen({ navigation }) {
  const { profiles, activeProfileId, switchProfile, refreshFamily } = useProfile();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshFamily?.();
    setRefreshing(false);
  };

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

  // Real family circle members (excluding primary account owner)
  const familyMembers = profiles?.filter((p) => !p.isPrimary) || [];
  const totalFamilyMembers = familyMembers.length;

  // Dynamic Family Health Pulse statistics
  const connectedCount = familyMembers.filter((p) => p.online !== false).length;
  const activeCount = familyMembers.filter(
    (p) =>
      p.metrics?.statusText?.toLowerCase().includes('active') ||
      (p.metrics?.exerciseMins && p.metrics?.exerciseMins > 0) ||
      (p.metrics?.steps && p.metrics?.steps > 0)
  ).length;
  const restingCount = Math.max(0, totalFamilyMembers - activeCount);

  // Check if any member has an actual attention condition (offline or battery < 20)
  const attentionMembers =
    familyMembers.filter(
      (p) => p.online === false || (p.battery && p.battery < 20)
    ) || [];

  return (
    <View style={styles.container}>
      {/* 3. Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Family</Text>
          <Text style={styles.headerSubtitle}>
            Stay connected with your family's health
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddFamily}
          activeOpacity={0.8}
        >
          <UserPlus color="#001F27" size={18} />
        </TouchableOpacity>
      </View>

      {/* 5. Family Profile Selector */}
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
        {/* 4 & 18. Family Health Summary & Pulse Card */}
        <View style={styles.pulseCard}>
          <View style={styles.pulseCardHeader}>
            <View style={styles.pulseTitleRow}>
              <Activity color="#00BFA5" size={16} style={{ marginRight: 6 }} />
              <Text style={styles.pulseCardTitle}>Family Health Pulse</Text>
            </View>
            <View style={styles.pulseOnlineBadge}>
              <Text style={styles.pulseOnlineBadgeText}>
                {connectedCount} of {totalFamilyMembers} Bands Online
              </Text>
            </View>
          </View>

          {/* Dynamic Stat Dots */}
          <View style={styles.pulseDotsRow}>
            <View style={styles.pulseStatItem}>
              <View style={[styles.pulseDot, { backgroundColor: '#00E676' }]} />
              <Text style={styles.pulseStatText}>{connectedCount} Connected</Text>
            </View>
            <View style={styles.pulseStatItem}>
              <View style={[styles.pulseDot, { backgroundColor: '#00BFA5' }]} />
              <Text style={styles.pulseStatText}>{activeCount} Active</Text>
            </View>
            <View style={styles.pulseStatItem}>
              <View style={[styles.pulseDot, { backgroundColor: '#29B6F6' }]} />
              <Text style={styles.pulseStatText}>{restingCount} Resting</Text>
            </View>
          </View>

          <View style={styles.pulseDivider} />

          <View style={styles.pulseMessageRow}>
            <View style={styles.pulseStatusDot} />
            <Text style={styles.pulseMessageText}>
              All connected family members are in healthy target zones
            </Text>
          </View>
        </View>

        {/* 12. Needs Attention Section (Conditional - only if real issue exists) */}
        {attentionMembers.length > 0 && (
          <View style={styles.attentionCard}>
            <View style={styles.attentionHeader}>
              <TriangleAlert color="#FFB300" size={18} style={{ marginRight: 6 }} />
              <Text style={styles.attentionTitle}>Needs Attention</Text>
            </View>
            {attentionMembers.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={styles.attentionRow}
                onPress={() => handleSelectMember(member.id)}
                activeOpacity={0.7}
              >
                <View style={styles.attentionRowLeft}>
                  <Text style={styles.attentionMemberName}>{member.name}</Text>
                  <Text style={styles.attentionMemberIssue}>
                    {member.online === false
                      ? 'Band disconnected'
                      : `Low battery (${member.battery}%)`}
                  </Text>
                </View>
                <ChevronRight color="#FFB300" size={16} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 6, 7, 8, 9, 10. Family Member Cards */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Family Health Overview</Text>
          <Text style={styles.sectionSubtitle}>
            Tap a card to view detailed telemetry
          </Text>
        </View>

        {totalFamilyMembers > 0 ? (
          <View style={styles.membersList}>
            {familyMembers.map((member) => {
              const isActive = member.id === activeProfileId;
              const isOnline = member.online !== false;
              const statusText =
                member.metrics?.statusText ||
                (isOnline ? 'Active now' : 'Band disconnected');

              return (
                <TouchableOpacity
                  key={member.id}
                  style={[
                    styles.memberCard,
                    isActive && styles.activeMemberCard,
                  ]}
                  onPress={() => handleSelectMember(member.id)}
                  activeOpacity={0.8}
                >
                  {/* Card Top Row: Avatar + Info + Arrow */}
                  <View style={styles.memberCardTop}>
                    <View style={styles.avatarContainer}>
                      {member.avatar ? (
                        <Image
                          source={{ uri: member.avatar }}
                          style={styles.avatar}
                        />
                      ) : (
                        <View style={styles.initialsAvatar}>
                          <Text style={styles.initialsAvatarText}>
                            {member.initials || 'FM'}
                          </Text>
                        </View>
                      )}
                      <View
                        style={[
                          styles.avatarStatusBadge,
                          { backgroundColor: isOnline ? '#00E676' : '#8FAAB2' },
                        ]}
                      />
                    </View>

                    <View style={styles.memberInfoCol}>
                      <View style={styles.memberNameRow}>
                        <Text style={styles.memberName} numberOfLines={1}>
                          {member.name}
                        </Text>
                        {isActive && (
                          <View style={styles.activePill}>
                            <Text style={styles.activePillText}>Viewing</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.memberSubRow}>
                        <Text style={styles.memberRole}>
                          {member.role ? member.role : 'Family Circle'}
                        </Text>
                        <Text style={styles.roleSeparator}>•</Text>
                        <View style={styles.liveStatusRow}>
                          <View
                            style={[
                              styles.liveStatusDot,
                              { backgroundColor: isOnline ? '#00E676' : '#8FAAB2' },
                            ]}
                          />
                          <Text
                            style={[
                              styles.liveStatusText,
                              { color: isOnline ? '#00E676' : '#8FAAB2' },
                            ]}
                          >
                            {statusText}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <ChevronRight color="#8FAAB2" size={18} />
                  </View>

                  {/* Real Health Metrics Chips (2 Key Metrics) */}
                  <View style={styles.memberMetricsRow}>
                    <View style={styles.metricBadge}>
                      <Heart color="#FF5252" size={14} style={{ marginRight: 5 }} />
                      <Text style={styles.metricVal}>
                        {member.metrics?.heartRate || 72}
                      </Text>
                      <Text style={styles.metricUnit}>BPM</Text>
                    </View>

                    <View style={styles.metricBadge}>
                      <Droplets color="#29B6F6" size={14} style={{ marginRight: 5 }} />
                      <Text style={styles.metricVal}>
                        {member.metrics?.oxygen || 98}%
                      </Text>
                      <Text style={styles.metricUnit}>SpO2</Text>
                    </View>

                    {member.metrics?.steps && (
                      <View style={styles.metricBadge}>
                        <Activity color="#00BFA5" size={14} style={{ marginRight: 5 }} />
                        <Text style={styles.metricVal}>
                          {(member.metrics.steps).toLocaleString()}
                        </Text>
                        <Text style={styles.metricUnit}>steps</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          /* 15. Empty State */
          <View style={styles.emptyStateCard}>
            <View style={styles.emptyIconBox}>
              <Users color="#00BFA5" size={36} />
            </View>
            <Text style={styles.emptyTitle}>Build your family circle</Text>
            <Text style={styles.emptySubtitle}>
              Invite family members to stay connected and share real-time health updates.
            </Text>
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={handleAddFamily}
              activeOpacity={0.8}
            >
              <Plus color="#001F27" size={18} style={{ marginRight: 6 }} />
              <Text style={styles.emptyAddBtnText}>Invite Family Member</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 14. Compact Invite Family Member Card */}
        <TouchableOpacity
          style={styles.inviteCard}
          onPress={handleAddFamily}
          activeOpacity={0.8}
        >
          <View style={styles.inviteIconBox}>
            <UserPlus color="#00BFA5" size={20} />
          </View>
          <View style={styles.inviteTextCol}>
            <Text style={styles.inviteTitle}>Add family member</Text>
            <Text style={styles.inviteSubtitle}>
              Connect someone you care about to monitor their wellness
            </Text>
          </View>
          <Plus color="#00BFA5" size={18} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001F27',
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 46,
    paddingBottom: 14,
    backgroundColor: '#002833',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(122, 158, 168, 0.1)',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: '#8FAAB2',
    fontSize: 13,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#00BFA5',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Scroll Content
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100, // Space so fixed bottom tab bar never covers content
  },

  // 4 & 18. Family Health Pulse Card
  pulseCard: {
    backgroundColor: '#002B36',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 165, 0.22)',
  },
  pulseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pulseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  pulseOnlineBadge: {
    backgroundColor: 'rgba(0, 191, 165, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pulseOnlineBadgeText: {
    color: '#00BFA5',
    fontSize: 10.5,
    fontWeight: '700',
  },
  pulseDotsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
    marginBottom: 12,
  },
  pulseStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  pulseStatText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  pulseDivider: {
    height: 1,
    backgroundColor: 'rgba(122, 158, 168, 0.1)',
    marginBottom: 10,
  },
  pulseMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E676',
    marginRight: 6,
  },
  pulseMessageText: {
    color: '#8FAAB2',
    fontSize: 11.5,
    lineHeight: 16,
    flex: 1,
  },

  // 12. Needs Attention Card
  attentionCard: {
    backgroundColor: 'rgba(255, 179, 0, 0.08)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 0, 0.3)',
  },
  attentionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  attentionTitle: {
    color: '#FFB300',
    fontSize: 14,
    fontWeight: '700',
  },
  attentionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  attentionRowLeft: {
    flex: 1,
  },
  attentionMemberName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  attentionMemberIssue: {
    color: '#FFB300',
    fontSize: 11.5,
    marginTop: 1,
  },

  // Section Header
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#8FAAB2',
    marginTop: 2,
  },

  // Member Cards List
  membersList: {
    gap: 12,
    marginBottom: 16,
  },
  memberCard: {
    backgroundColor: '#002B36',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.16)',
  },
  activeMemberCard: {
    borderColor: '#00BFA5',
    backgroundColor: 'rgba(0, 191, 165, 0.06)',
    borderWidth: 1.5,
  },
  memberCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#001F27',
  },
  initialsAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#004D40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsAvatarText: {
    color: '#00BFA5',
    fontWeight: '700',
    fontSize: 16,
  },
  avatarStatusBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#002B36',
  },
  memberInfoCol: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  activePill: {
    backgroundColor: 'rgba(0, 191, 165, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 191, 165, 0.3)',
  },
  activePillText: {
    color: '#00BFA5',
    fontSize: 9.5,
    fontWeight: '700',
  },
  memberSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  memberRole: {
    color: '#8FAAB2',
    fontSize: 12,
    fontWeight: '500',
  },
  roleSeparator: {
    color: '#5C7882',
    fontSize: 10,
  },
  liveStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  liveStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Member Metrics Row
  memberMetricsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  metricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#002129',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.1)',
  },
  metricVal: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  metricUnit: {
    color: '#8FAAB2',
    fontSize: 10.5,
    fontWeight: '600',
    marginLeft: 3,
  },

  // 14. Invite Card
  inviteCard: {
    backgroundColor: '#002B36',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 165, 0.25)',
    borderStyle: 'dashed',
  },
  inviteIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 191, 165, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  inviteTextCol: {
    flex: 1,
  },
  inviteTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  inviteSubtitle: {
    color: '#8FAAB2',
    fontSize: 11.5,
    marginTop: 1,
  },

  // 15. Empty State
  emptyStateCard: {
    backgroundColor: '#002B36',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.16)',
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 191, 165, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: '#8FAAB2',
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  emptyAddBtn: {
    backgroundColor: '#00BFA5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyAddBtnText: {
    color: '#001F27',
    fontSize: 14,
    fontWeight: '700',
  },
});
