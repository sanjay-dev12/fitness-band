import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { HelpCircle, Plus, Watch, Link } from 'lucide-react-native';

export default function DeviceScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Device</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <HelpCircle color="#FFFFFF" size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Plus color="#FFFFFF" size={28} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.backgroundGradient}>
        <View style={styles.content}>
          
          <View style={styles.deviceGraphicContainer}>
            <View style={styles.shadowOval} />
            <View style={styles.watchBody}>
              <View style={styles.watchScreen}>
                <Link color="#D3D3D3" size={40} />
              </View>
            </View>
          </View>

          <Text style={styles.noDeviceText}>No device bound</Text>

          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>Add Device</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.helpLink}>
            <HelpCircle color="#5C6BC0" size={16} />
            <Text style={styles.helpLinkText}>How to use</Text>
          </TouchableOpacity>

        </View>
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
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
  },
  backgroundGradient: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 20,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
  },
  deviceGraphicContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  shadowOval: {
    position: 'absolute',
    bottom: -10,
    width: 160,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 80,
    transform: [{ scaleY: 0.5 }],
  },
  watchBody: {
    width: 100,
    height: 180,
    backgroundColor: '#E8EAF6',
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D0D4E4',
  },
  watchScreen: {
    width: 80,
    height: 140,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDeviceText: {
    color: '#A0A0A0',
    fontSize: 18,
    marginBottom: 40,
  },
  addButton: {
    backgroundColor: '#00BFA5',
    width: '80%',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#00BFA5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  helpLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpLinkText: {
    color: '#5C6BC0',
    fontSize: 16,
    marginLeft: 6,
  },
});
