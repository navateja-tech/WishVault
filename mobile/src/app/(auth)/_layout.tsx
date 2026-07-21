import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '@/features/auth/store/authStore';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (!isLoading && isAuthenticated) {
    return <Redirect href="/(main)/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="register" options={{ title: 'Register' }} />
    </Stack>
  );
}
