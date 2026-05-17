import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import HomeScreen from '../screens/HomeScreen';
import ScanResultScreen from '../screens/ScanResultScreen';
import TraceabilityScreen from '../screens/TraceabilityScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MyStockScreen from '../screens/MyStockScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import { Medicine } from '../types';
import type { VerifyQRResponse } from '../api/verifyService';

export type RootStackParamList = {
  MainTabs: undefined;
  ScanResult: { medicine?: Medicine; verifyResult?: VerifyQRResponse; qrCodeValue?: string };
  Traceability: { qrCodeValue: string; productName?: string };
  Register: undefined;
  Login: { expectedRole?: 'PHARMACY' | 'DISTRIBUTOR' } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('user_role').then(setRole);
  }, []);

  const showMyStock = role === 'PHARMACY' || role === 'DISTRIBUTOR';

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
      {showMyStock && (
        <Tab.Screen
          name="My Stock"
          component={MyStockScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cube-outline" size={size} color={color} />
            ),
          }}
        />
      )}
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
      initialRouteName="MainTabs"
    >
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
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
