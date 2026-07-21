import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth/store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  const handleMockLogin = async () => {
    // Mock user login session for Milestone 0 verification
    await setSession('mock-jwt-token', {
      id: 'mock-user-id',
      email: 'user@univault.app',
      username: 'univault_user',
      full_name: 'UniVault User',
    });
    router.replace('/(main)/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-white justify-center items-center px-6">
      <View className="items-center mb-8">
        <Text className="text-4xl font-bold text-primary mb-2">UniVault</Text>
        <Text className="text-gray-500 text-center">
          Save products from anywhere. Organize everything in one place.
        </Text>
      </View>

      <TouchableOpacity
        className="w-full bg-primary py-4 rounded-xl items-center shadow-md shadow-pink-200"
        onPress={handleMockLogin}
      >
        <Text className="text-white font-semibold text-lg">Mock Login (Milestone 0)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-4"
        onPress={() => router.push('/(auth)/register')}
      >
        <Text className="text-primary font-medium">Create an Account</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
