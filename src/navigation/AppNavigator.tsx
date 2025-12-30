import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Disable screens for web to avoid compatibility issues
if (Platform.OS === 'web') {
  try {
    const { enableScreens } = require('react-native-screens');
    enableScreens(false);
  } catch (e) {
    // Ignore if not available
  }
}
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ScanResultScreen from '../screens/ScanResultScreen';
import TraceabilityScreen from '../screens/TraceabilityScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Medicine } from '../types';

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  ScanResult: { medicine: Medicine };
  Traceability: { medicine: Medicine };
};

// Use native stack, but it will fall back to JS implementation on web
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#000',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Chatbot"
        component={ChatbotScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName="Login"
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="ScanResult"
        component={ScanResultScreen}
        options={{
          headerShown: true,
          title: 'Verification Result',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="Traceability"
        component={TraceabilityScreen}
        options={{
          headerShown: true,
          title: 'Product Traceability',
          headerBackTitle: 'Back',
        }}
      />
    </Stack.Navigator>
  );
}

