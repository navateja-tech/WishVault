import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  onPress,
  className = '',
  ...props
}) => {
  const handlePress = (e: any) => {
    if (loading || disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress(e);
    }
  };

  // Base styling
  let containerStyles = 'flex-row items-center justify-center rounded-xl shadow-sm ';
  let textStyles = 'font-semibold text-center ';

  // Variant styles
  switch (variant) {
    case 'primary':
      containerStyles += 'bg-primary border border-pink-300 shadow-pink-200 ';
      textStyles += 'text-white ';
      break;
    case 'secondary':
      containerStyles += 'bg-pink-100 border border-pink-200 ';
      textStyles += 'text-primary-dark ';
      break;
    case 'outline':
      containerStyles += 'bg-transparent border border-gray-200 ';
      textStyles += 'text-gray-800 ';
      break;
    case 'ghost':
      containerStyles += 'bg-transparent shadow-none ';
      textStyles += 'text-gray-700 ';
      break;
    case 'danger':
      containerStyles += 'bg-red-500 border border-red-600 ';
      textStyles += 'text-white ';
      break;
  }

  // Size styles
  switch (size) {
    case 'sm':
      containerStyles += 'px-3 py-2 ';
      textStyles += 'text-sm ';
      break;
    case 'md':
      containerStyles += 'px-5 py-3.5 ';
      textStyles += 'text-base ';
      break;
    case 'lg':
      containerStyles += 'px-6 py-4 ';
      textStyles += 'text-lg ';
      break;
  }

  // Disabled or loading state
  if (disabled || loading) {
    containerStyles += 'opacity-50 ';
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || loading}
      className={`${containerStyles} ${className}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : '#EC4899'} />
      ) : (
        <View className="flex-row items-center justify-center">
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <Text className={textStyles}>{title}</Text>
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};
