import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import {
  User,
  ChevronRight,
  Settings,
  HelpCircle,
  MessageCircle,
  Ruler,
  ShieldCheck,
  LogOut,
  Award,
  TrendingUp,
  Watch,
  Battery,
  Flame,
  CheckCircle2,
  Users,
} from 'lucide-react-native';
import ProfileSwitcher from '../components/ProfileSwitcher';
import { useProfile } from '../context/ProfileContext';
import { setAuthToken, setStoredUser } from '../services/api';

export default function ProfileScreen({ navigation }) {
  const { activeProfile, showToast } = useProfile();

  const handleLogout = () => {
    setAuthToken(null);
    setStoredUser(null);
    showToast('Logged out successfully 👋', 'info');
    if (navigation) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  const awards = [
    { label: '5K', title: 'Bronze Mover', color: '#CD7F32', achieved: true },
    { label: '10K', title: 'Silver Pacer', color: '#00BFA5', achieved: true },
    { label: '15K', title: 'Gold Champion', color: '#FFB300', achieved: (activeProfile.metrics?.steps || 0) >= 10000 },
    { label: '20K', title: 'Diamond Legend', color: '#00E5FF', achieved: false },
  ];

  return (
    <View style={styles.container}>
      {/* Top Header Profile Card */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Avatar with Active Glow Ring */}
          <View style={styles.avatarRing}>
            {activeProfile.avatar ? (
              <Image source={{ uri: activeProfile.avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>
                  {activeProfile.initials || 'ME'}
                </Text>
              </View>
            )}
            <View style={styles.onlineDot} />
          </View>

          {/* User Details */}
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName} numberOfLines={1}>
                {activeProfile.name}
              </Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>
                  {activeProfile.role || 'Member'}
                </Text>
              </View>
            </View>
            <View style={styles.deviceStatusRow}>
              <Watch color="#00BFA5" size={14} style={{ marginRight: 5 }} />
              <Text style={styles.deviceStatusText}>
                HandBand Pro • {activeProfile.battery || 92}% Battery
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Instagram-style Profile Switcher */}
      <ProfileSwitcher navigation={navigation} />

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats Summary Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {((activeProfile.metrics?.steps || 0) / 1000).toFixed(1)}k
            </Text>
            <Text style={styles.statLabel}>Today Steps</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {activeProfile.metrics?.calories || 0}
            </Text>
            <Text style={styles.statLabel}>Kcal Burned</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {activeProfile.metrics?.heartRate || 72}
            </Text>
            <Text style={styles.statLabel}>Avg BPM</Text>
          </View>
        </View>

        {/* Milestone Awards */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Award color="#FFB300" size={18} style={{ marginRight: 8 }} />
              <Text style={styles.cardTitle}>Fitness Milestones</Text>
            </View>
            <View style={styles.cardHeaderRight}>
              <Text style={styles.cardSubtitle}>2 Achieved</Text>
              <ChevronRight color="#7A9EA8" size={16} />
            </View>
          </View>

          <View style={styles.awardsGrid}>
            {awards.map((award, index) => (
              <View key={index} style={styles.awardItem}>
                <View
                  style={[
                    styles.awardCircle,
                    { borderColor: award.color },
                    award.achieved && styles.awardAchieved,
                  ]}
                >
                  <Award
                    color={award.achieved ? award.color : '#54717A'}
                    size={22}
                  />
                  {award.achieved && (
                    <View style={styles.checkBadge}>
                      <CheckCircle2 color="#00E676" size={12} />
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.awardText,
                    award.achieved && { color: '#FFFFFF', fontWeight: '700' },
                  ]}
                >
                  {award.label}
                </Text>
                <Text style={styles.awardSub}>{award.title}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Weekly Health Summary Report Card */}
        <TouchableOpacity
          style={styles.reportCard}
          onPress={() => showToast('Weekly Report is up to date! 📈', 'info')}
          activeOpacity={0.7}
        >
          <View style={styles.reportLeft}>
            <View style={styles.reportIconBox}>
              <TrendingUp color="#00BFA5" size={22} />
            </View>
            <View>
              <Text style={styles.reportTitle}>Weekly Health Analytics</Text>
              <Text style={styles.reportDate}>Mon - Sun • 94% Consistency</Text>
            </View>
          </View>
          <View style={styles.reportRight}>
            <Text style={styles.reportBadgeText}>View Report</Text>
            <ChevronRight color="#00BFA5" size={16} />
          </View>
        </TouchableOpacity>

        {/* Settings & Management Menu */}
        <View style={styles.menuCard}>
          <Text style={styles.menuSectionHeader}>Account & Circle</Text>

          <MenuItem
            icon={<Users color="#00BFA5" size={20} />}
            title="Manage Family Circle"
            subtitle="Invite members, switch roles, and pairing codes"
            onPress={() => navigation?.navigate('FamilySetup')}
          />

          <MenuItem
            icon={<Watch color="#00E5FF" size={20} />}
            title="Band Device Settings"
            subtitle="Vibration, sleep monitoring, continuous SpO2"
            onPress={() => navigation?.navigate('Device')}
          />

          <MenuItem
            icon={<Ruler color="#7A9EA8" size={20} />}
            title="Health Goals & Units"
            value="Metric (km/kg)"
            onPress={() => showToast('Target steps: 10,000 / day', 'info')}
          />

          <MenuItem
            icon={<ShieldCheck color="#00E676" size={20} />}
            title="Data Privacy & Sync"
            value="Encrypted"
            onPress={() => showToast('End-to-End Encryption is active', 'success')}
          />

          <MenuItem
            icon={<HelpCircle color="#7A9EA8" size={20} />}
            title="Help & Support"
            onPress={() => showToast('Support is available 24/7', 'info')}
          />

          <MenuItem
            icon={<LogOut color="#FF4B4B" size={20} />}
            title="Sign Out"
            subtitle="Switch account or sign in as another user"
            onPress={handleLogout}
            isDestructive
          />
        </View>
      </ScrollView>
    </View>
  );
}

const MenuItem = ({ icon, title, subtitle, value, onPress, isDestructive }) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.menuItemLeft}>
      <View
        style={[
          styles.menuIconContainer,
          isDestructive && styles.menuIconDestructive,
        ]}
      >
        {icon}
      </View>
      <View style={styles.menuTextContainer}>
        <Text
          style={[
            styles.menuTitle,
            isDestructive && { color: '#FF4B4B' },
          ]}
        >
          {title}
        </Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    <View style={styles.menuItemRight}>
      {value && <Text style={styles.menuValue}>{value}</Text>}
      <ChevronRight
        color={isDestructive ? '#FF4B4B' : '#7A9EA8'}
        size={16}
      />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001F27',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#002B36',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarRing: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2.5,
    borderColor: '#00BFA5',
    padding: 3,
    position: 'relative',
    marginRight: 16,
    backgroundColor: 'rgba(0, 191, 165, 0.1)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: '#004D40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#00BFA5',
    fontSize: 22,
    fontWeight: 'bold',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00E676',
    borderWidth: 2,
    borderColor: '#002B36',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    maxWidth: 160,
  },
  roleBadge: {
    backgroundColor: 'rgba(0, 191, 165, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#00BFA5',
  },
  roleBadgeText: {
    color: '#00BFA5',
    fontSize: 11,
    fontWeight: '700',
  },
  deviceStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  deviceStatusText: {
    color: '#7A9EA8',
    fontSize: 12,
    fontWeight: '500',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#002B36',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.2)',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#7A9EA8',
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(122, 158, 168, 0.25)',
  },
  card: {
    backgroundColor: '#002B36',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardSubtitle: {
    color: '#7A9EA8',
    fontSize: 12,
  },
  awardsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  awardItem: {
    alignItems: 'center',
    width: '23%',
  },
  awardCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#001F27',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  awardAchieved: {
    backgroundColor: 'rgba(0, 191, 165, 0.12)',
    shadowColor: '#00BFA5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  checkBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#001F27',
    borderRadius: 6,
  },
  awardText: {
    color: '#7A9EA8',
    fontSize: 13,
    fontWeight: '600',
  },
  awardSub: {
    color: '#54717A',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2,
  },
  reportCard: {
    backgroundColor: '#002B36',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 165, 0.3)',
  },
  reportLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reportIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 191, 165, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  reportDate: {
    color: '#7A9EA8',
    fontSize: 12,
    marginTop: 2,
  },
  reportRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reportBadgeText: {
    color: '#00BFA5',
    fontSize: 12,
    fontWeight: '700',
  },
  menuCard: {
    backgroundColor: '#002B36',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.2)',
  },
  menuSectionHeader: {
    color: '#7A9EA8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(122, 158, 168, 0.12)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#001F27',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIconDestructive: {
    backgroundColor: 'rgba(255, 75, 75, 0.12)',
  },
  menuTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  menuTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  menuSubtitle: {
    color: '#7A9EA8',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 14,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  menuValue: {
    color: '#7A9EA8',
    fontSize: 12,
  },
});
