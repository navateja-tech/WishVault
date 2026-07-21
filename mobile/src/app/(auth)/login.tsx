import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';

import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, Mail } from 'lucide-react-native';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { loginSchema, LoginFormData } from '@/features/auth/schemas/authSchemas';
import { authApi } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/store/authStore';
import { ApiError } from '@/services/api';

export default function LoginScreen() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setServerError(null);
    try {
      // 1. Call login API
      const tokens = await authApi.login(data);

      // 2. Temporarily set token to fetch profile
      useAuthStore.setState({ accessToken: tokens.access_token });
      const userProfile = await authApi.getMe();

      // 3. Persist complete session
      await setSession(tokens.access_token, userProfile, tokens.refresh_token);

      // 4. Navigate to main tabs
      router.replace('/(main)/(tabs)');
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError('Unable to sign in. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          className="px-6 py-8"
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Logo & Header */}
          <View className="items-center mb-10">
            <View className="w-16 h-16 rounded-3xl bg-pink-100 items-center justify-center mb-4 shadow-sm shadow-pink-200">
              <Text className="text-3xl">🎁</Text>
            </View>
            <Text className="text-3xl font-bold text-gray-900 tracking-tight">UniVault</Text>
            <Text className="text-gray-500 text-sm text-center mt-2 px-4 leading-relaxed">
              Save products from anywhere. Organize everything in one place.
            </Text>
          </View>

          {/* Form Card */}
          <View className="mb-6">
            <Text className="text-xl font-semibold text-gray-900 mb-6">Welcome Back</Text>

            {serverError && (
              <View className="bg-red-50 border border-red-200 p-4 rounded-xl mb-4">
                <Text className="text-red-600 text-sm font-medium">{serverError}</Text>
              </View>
            )}

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email Address"
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.email?.message}
                  leftIcon={<Mail size={20} color="#9CA3AF" />}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  isPassword
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.password?.message}
                  leftIcon={<Lock size={20} color="#9CA3AF" />}
                />
              )}
            />

            <Button
              title="Sign In"
              variant="primary"
              size="lg"
              loading={loading}
              onPress={handleSubmit(onSubmit)}
              className="mt-2"
            />
          </View>

          {/* Registration Link */}
          <View className="flex-row justify-center items-center mt-4">
            <Text className="text-gray-500 text-sm">Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text className="text-primary font-semibold text-sm">Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
