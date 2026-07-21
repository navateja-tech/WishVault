import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '@/features/auth/store/authStore';

export default function MainLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (!isLoading && !isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="add-product"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack>
  );
}
