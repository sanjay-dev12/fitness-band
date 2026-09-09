import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { User, ChevronRight, Settings, HelpCircle, MessageCircle, Ruler, ShieldAlert } from 'lucide-react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <User color="#A0A0A0" size={40} />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Please set a Nickname</Text>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.backgroundPanel}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.awardsCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>My Awards</Text>
              <View style={styles.cardHeaderRight}>
                <Text style={styles.cardSubtitle}>0Piece</Text>
                <ChevronRight color="#A0A0A0" size={16} />
              </View>
            </View>
            <View style={styles.awardsGrid}>
              {[5, 10, 15, 20].map((k) => (
                <View key={k} style={styles.awardItem}>
                  <View style={styles.awardCircle}>
                    <User color="#A0A0A0" size={24} />
                  </View>
                  <Text style={styles.awardText}>{k}K</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.reportCard}>
            <Text style={styles.cardTitle}>Weekly Report</Text>
            <View style={styles.cardHeaderRight}>
              <Text style={styles.cardSubtitle}>08/30-09/05</Text>
              <ChevronRight color="#A0A0A0" size={16} />
            </View>
          </TouchableOpacity>

          <View style={styles.menuList}>
            <MenuListItem icon={<Ruler />} title="Unit Settings" value="Unit/Time Format" />
            <MenuListItem icon={<Settings />} title="Settings" />
            <MenuListItem icon={<HelpCircle />} title="FAQs" />
            <MenuListItem icon={<MessageCircle />} title="Questions and Suggestions" />
            <MenuListItem 
              icon={<ShieldAlert />} 
              title="Device anti-disconnection settings" 
              subtitle="To avoid abnormal exercise records, messages or calls not notified, etc." 
            />
            <MenuListItem icon={<MessageCircle />} title="Message Center" />
          </View>

        </ScrollView>
      </View>
    </View>
  );
}

const MenuListItem = ({ icon, title, subtitle, value }) => (
  <TouchableOpacity style={styles.menuItem}>
    <View style={styles.menuItemLeft}>
      {React.cloneElement(icon, { color: '#A0A0A0', size: 20 })}
      <View style={styles.menuItemTextContainer}>
        <Text style={styles.menuItemTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    <View style={styles.menuItemRight}>
      {value && <Text style={styles.menuItemValue}>{value}</Text>}
      <ChevronRight color="#A0A0A0" size={16} />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002B36',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8EAF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userInfo: {
    justifyContent: 'center',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  editButton: {
    marginTop: 4,
  },
  editText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  backgroundPanel: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  awardsCard: {
    backgroundColor: '#F4F6F8',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    color: '#333333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardSubtitle: {
    color: '#A0A0A0',
    fontSize: 14,
    marginRight: 4,
  },
  awardsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  awardItem: {
    alignItems: 'center',
  },
  awardCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  awardText: {
    color: '#D3D3D3',
    fontSize: 14,
    fontWeight: 'bold',
  },
  reportCard: {
    backgroundColor: '#F4F6F8',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  menuList: {
    backgroundColor: '#F4F6F8',
    borderRadius: 20,
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAF6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  menuItemTitle: {
    color: '#333333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuItemSubtitle: {
    color: '#A0A0A0',
    fontSize: 12,
    marginTop: 4,
    paddingRight: 10,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemValue: {
    color: '#A0A0A0',
    fontSize: 14,
    marginRight: 4,
  },
});
