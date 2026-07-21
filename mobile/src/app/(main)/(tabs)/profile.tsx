import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LogOut, User, Moon, Trash2, ArrowRight } from 'lucide-react-native';

import * as Haptics from 'expo-haptics';

import { useAuthStore } from '@/features/auth/store/authStore';
import { useProductsQuery } from '@/features/products/hooks/useProducts';
import { useCollectionsQuery } from '@/features/collections/hooks/useCollections';
import { Card } from '@/components/ui/Card';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, clearSession } = useAuthStore();

  const { data: products = [] } = useProductsQuery();
  const { data: collections = [] } = useCollectionsQuery();

  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Logout', 'Are you sure you want to logout of UniVault?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await clearSession();
          router.replace('/(auth)/login' as any);
        },
      },
    ]);
  };

  const handleResetData = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Reset Library',
      'This is a local action simulation. Are you sure you want to clear your local database cache?',
      [{ text: 'Cancel', style: 'cancel' }, { text: 'Clear Cache', style: 'destructive' }]
    );
  };

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      {/* Header Banner */}
      <View className="px-6 pt-4 pb-4">
        <Text className="text-2xl font-bold text-gray-900 tracking-tight">Profile</Text>
        <Text className="text-gray-400 text-xs mt-0.5">Manage your preferences & settings</Text>
      </View>

      {/* User Information Card */}
      <View className="px-6 mb-6">
        <Card variant="bordered" className="p-5 flex-row items-center gap-4">
          <View className="w-16 h-16 rounded-full bg-pink-100 items-center justify-center">
            <User size={32} color="#EC4899" />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">
              {user?.username || 'UniVault User'}
            </Text>
            <Text className="text-sm text-gray-400 mt-0.5">{user?.email || 'user@univault.app'}</Text>
          </View>
        </Card>
      </View>

      {/* Statistics Block */}
      <View className="flex-row px-6 gap-4 mb-6">
        <View className="flex-1">
          <Card variant="bordered" className="p-4 items-center justify-center">
            <Text className="text-2xl font-black text-primary">{products.length}</Text>
            <Text className="text-xs font-semibold text-gray-400 mt-1">Saved Items</Text>
          </Card>
        </View>
        <View className="flex-1">
          <Card variant="bordered" className="p-4 items-center justify-center">
            <Text className="text-2xl font-black text-primary">{collections.length}</Text>
            <Text className="text-xs font-semibold text-gray-400 mt-1">Collections</Text>
          </Card>
        </View>
      </View>

      {/* Preferences Section */}
      <View className="px-6 mb-6">
        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 ml-1">
          Preferences
        </Text>

        <Card variant="bordered" className="p-0 overflow-hidden">
          {/* Dark Mode toggle */}
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-lg bg-indigo-50 items-center justify-center">
                <Moon size={18} color="#6366F1" />
              </View>
              <Text className="text-base font-semibold text-gray-800">Dark Mode (Beta)</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={(val) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setDarkMode(val);
              }}
              trackColor={{ false: '#E5E7EB', true: '#F472B6' }}
              thumbColor={darkMode ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          {/* Reset Library option */}
          <TouchableOpacity
            onPress={handleResetData}
            activeOpacity={0.7}
            className="flex-row items-center justify-between px-4 py-4"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-lg bg-red-50 items-center justify-center">
                <Trash2 size={18} color="#EF4444" />
              </View>
              <Text className="text-base font-semibold text-gray-800">Clear Cache</Text>
            </View>
            <ArrowRight size={18} color="#D1D5DB" />
          </TouchableOpacity>
        </Card>
      </View>

      {/* Account actions */}
      <View className="px-6 mb-12">
        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 ml-1">
          Account
        </Text>

        <Card variant="bordered" className="p-0 overflow-hidden">
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.7}
            className="flex-row items-center justify-between px-4 py-4"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-lg bg-pink-50 items-center justify-center">
                <LogOut size={18} color="#EC4899" />
              </View>
              <Text className="text-base font-semibold text-gray-800">Log Out</Text>
            </View>
            <ArrowRight size={18} color="#D1D5DB" />
          </TouchableOpacity>
        </Card>
      </View>
    </ScrollView>
  );
}
