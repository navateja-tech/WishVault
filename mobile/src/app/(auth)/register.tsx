import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white justify-center items-center px-6">
      <View className="items-center mb-8">
        <Text className="text-4xl font-bold text-primary mb-2">Sign Up</Text>
        <Text className="text-gray-500 text-center">
          Create an account to start saving products.
        </Text>
      </View>

      <TouchableOpacity
        className="w-full bg-primary py-4 rounded-xl items-center shadow-md shadow-pink-200"
        onPress={() => router.replace('/(auth)/login')}
      >
        <Text className="text-white font-semibold text-lg">Mock Register (Go to Login)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-4"
        onPress={() => router.replace('/(auth)/login')}
      >
        <Text className="text-primary font-medium">Already have an account? Login</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
