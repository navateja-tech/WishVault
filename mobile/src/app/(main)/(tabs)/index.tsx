import { View, Text, ScrollView } from 'react-native';
import { useAuthStore } from '@/features/auth/store/authStore';

export default function DashboardScreen() {
  const user = useAuthStore((state) => state.user);

  return (
    <ScrollView className="flex-1 bg-white px-6 py-4">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900">Hello, {user?.full_name || 'User'}!</Text>
        <Text className="text-gray-500 mt-1">Organize your shopping items in one place.</Text>
      </View>

      <View className="bg-secondary p-6 rounded-2xl border border-pink-100 mb-6">
        <Text className="text-lg font-semibold text-primary mb-2">Welcome to UniVault</Text>
        <Text className="text-gray-600 leading-relaxed">
          This is your personal dashboard. Paste a link to any product, save it to a collection, and access it anytime.
        </Text>
      </View>
    </ScrollView>
  );
}
