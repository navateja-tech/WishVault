import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const router = useRouter();

  const handleLogout = async () => {
    await clearSession();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView className="flex-1 bg-white px-6 py-4">
      <View className="items-center my-6">
        <View className="w-20 h-20 rounded-full bg-pink-100 items-center justify-center mb-4">
          <Text className="text-3xl">👤</Text>
        </View>
        <Text className="text-2xl font-bold text-gray-900">{user?.full_name || 'UniVault User'}</Text>
        <Text className="text-gray-500 mt-1">@{user?.username || 'user'}</Text>
        <Text className="text-gray-400 text-sm">{user?.email || 'user@univault.app'}</Text>
      </View>

      <View className="bg-gray-50 rounded-2xl p-4 mb-6">
        <Text className="text-gray-900 font-semibold mb-4">Account Stats</Text>
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-500">Saved Products</Text>
          <Text className="text-gray-900 font-semibold">0</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-500">Collections</Text>
          <Text className="text-gray-900 font-semibold">2</Text>
        </View>
      </View>

      <TouchableOpacity
        className="w-full bg-red-50 border border-red-100 py-4 rounded-xl items-center"
        onPress={handleLogout}
      >
        <Text className="text-red-500 font-semibold text-base">Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
