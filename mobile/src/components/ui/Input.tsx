import React, { useState, forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  isPassword?: boolean;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      isPassword = false,
      leftIcon,
      className = '',
      secureTextEntry,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => {
      setShowPassword((prev) => !prev);
    };

    let borderStyle = 'border-gray-200 bg-gray-50';
    if (error) {
      borderStyle = 'border-red-400 bg-red-50/20';
    } else if (isFocused) {
      borderStyle = 'border-primary bg-white';
    }

    return (
      <View className="w-full mb-4">
        {label && (
          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </Text>
        )}

        <View
          className={`flex-row items-center border rounded-xl px-4 py-3 ${borderStyle} ${className}`}
        >
          {leftIcon && <View className="mr-3">{leftIcon}</View>}

          <TextInput
            ref={ref}
            className="flex-1 text-base text-gray-900 font-normal py-0"
            placeholderTextColor="#9CA3AF"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            secureTextEntry={isPassword ? !showPassword : secureTextEntry}
            {...props}
          />

          {isPassword && (
            <TouchableOpacity onPress={toggleShowPassword} className="p-1">
              {showPassword ? (
                <EyeOff size={20} color="#9CA3AF" />
              ) : (
                <Eye size={20} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          )}
        </View>

        {error ? (
          <Text className="text-xs text-red-500 mt-1 font-medium">{error}</Text>
        ) : helperText ? (
          <Text className="text-xs text-gray-400 mt-1">{helperText}</Text>
        ) : null}
      </View>
    );
  }
);

Input.displayName = 'Input';
