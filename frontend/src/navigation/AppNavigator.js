import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Activity, Watch, Users, User as UserIcon } from 'lucide-react-native';

import HomeScreen from '../screens/HomeScreen';
import ExerciseScreen from '../screens/ExerciseScreen';
import DeviceScreen from '../screens/DeviceScreen';
import FamilyCircleScreen from '../screens/FamilyCircleScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import FamilySetupScreen from '../screens/FamilySetupScreen';
import { ProfileProvider } from '../context/ProfileContext';
import Toast from '../components/Toast';
import CustomModal from '../components/CustomModal';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#00BFA5',
        tabBarInactiveTintColor: '#7A9EA8',
        tabBarStyle: {
          backgroundColor: '#00252F',
          borderTopWidth: 1,
          borderTopColor: 'rgba(122, 158, 168, 0.14)',
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 76 : 64,
          elevation: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: '600',
          letterSpacing: 0.2,
          marginTop: 2,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <Home color={color} size={20} />
          ),
        }}
      />
      <Tab.Screen 
        name="Exercise" 
        component={ExerciseScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <Activity color={color} size={20} />
          ),
        }}
      />
      <Tab.Screen 
        name="Device" 
        component={DeviceScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <Watch color={color} size={20} />
          ),
        }}
      />
      <Tab.Screen 
        name="Family" 
        component={FamilyCircleScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Users color={color} size={20} />
          ),
        }}
      />
      <Tab.Screen 
        name="My" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <UserIcon color={color} size={20} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
 
export default function AppNavigator() {
  return (
    <ProfileProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#001F27' },
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="FamilySetup" component={FamilySetupScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
      <CustomModal />
    </ProfileProvider>
  );
}
