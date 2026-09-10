import React from 'react';
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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#00BFA5',
        tabBarInactiveTintColor: '#7A9EA8',
        tabBarStyle: {
          backgroundColor: '#002B36',
          borderTopWidth: 0,
          paddingBottom: 10,
          paddingTop: 10,
          height: 70,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Exercise" 
        component={ExerciseScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Activity color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Device" 
        component={DeviceScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Watch color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Family" 
        component={FamilyCircleScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Users color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="My" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <UserIcon color={color} size={size} />
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
    </ProfileProvider>
  );
}
