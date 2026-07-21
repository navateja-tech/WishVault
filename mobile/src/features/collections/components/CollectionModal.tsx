import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Check } from 'lucide-react-native';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/theme';

export const COLLECTION_ICONS = [
  { id: 'gamepad', emoji: '🎮' },
  { id: 'shirt', emoji: '🧥' },
  { id: 'home', emoji: '🏠' },
  { id: 'book', emoji: '📚' },
  { id: 'plane', emoji: '✈️' },
  { id: 'sparkles', emoji: '✨' },
  { id: 'shopping-bag', emoji: '🛍️' },
  { id: 'gift', emoji: '🎁' },
  { id: 'laptop', emoji: '💻' },
  { id: 'headphones', emoji: '🎧' },
  { id: 'camera', emoji: '📷' },
  { id: 'coffee', emoji: '☕' },
];

export const PRESET_COLORS = [...colors.collection];

interface CollectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; icon: string; color: string }) => Promise<void>;
  initialValues?: { name: string; icon: string; color: string };
  title?: string;
  loading?: boolean;
}

export const CollectionModal: React.FC<CollectionModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialValues,
  title = 'New Collection',
  loading = false,
}) => {
  const [name, setName] = useState(initialValues?.name || '');
  const [selectedIcon, setSelectedIcon] = useState(initialValues?.icon || 'folder');
  const [selectedColor, setSelectedColor] = useState(initialValues?.color || colors.collection[0]);
  const [error, setError] = useState<string | null>(null);

  const [prevVisible, setPrevVisible] = useState(false);
  const [prevInitialValues, setPrevInitialValues] = useState(initialValues);

  if (visible !== prevVisible || initialValues !== prevInitialValues) {
    setPrevVisible(visible);
    setPrevInitialValues(initialValues);
    if (visible) {
      setName(initialValues?.name || '');
      setSelectedIcon(initialValues?.icon || 'gamepad');
      setSelectedColor(initialValues?.color || colors.collection[0]);
      setError(null);
    }
  }


  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Collection name is required');
      return;
    }
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save collection');
    }
  };

  if (!visible) return null;

  return (
    <View className="absolute inset-0 z-50 bg-black/40 justify-end">
      {/* Dimmed Backdrop Dismiss Touch Area */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="absolute inset-0"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="justify-end z-10"
      >
        <View className="bg-white rounded-t-3xl p-6 shadow-xl max-h-[85%]">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-900">{title}</Text>
            <TouchableOpacity onPress={onClose} className="p-1 rounded-full bg-gray-100">
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Collection Name Input */}
            <Input
              label="Collection Name"
              placeholder="e.g. Gaming Setup, Dream Home"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (error) setError(null);
              }}
              error={error || undefined}
            />

            {/* Icon Picker */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-3">Choose Icon</Text>
              <View className="flex-row flex-wrap gap-3">
                {COLLECTION_ICONS.map((item) => {
                  const isSelected = selectedIcon === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => setSelectedIcon(item.id)}
                      className={`w-12 h-12 rounded-xl items-center justify-center border ${
                        isSelected
                          ? 'border-primary bg-pink-50 scale-105'
                          : 'border-gray-100 bg-gray-50'
                      }`}
                    >
                      <Text className="text-2xl">{item.emoji}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Color Picker */}
            <View className="mb-8">
              <Text className="text-sm font-medium text-gray-700 mb-3">Choose Color</Text>
              <View className="flex-row flex-wrap gap-3">
                {PRESET_COLORS.map((hexColor) => {
                  const isSelected = selectedColor === hexColor;
                  return (
                    <TouchableOpacity
                      key={hexColor}
                      onPress={() => setSelectedColor(hexColor)}
                      style={{ backgroundColor: hexColor }}
                      className={`w-10 h-10 rounded-full items-center justify-center ${
                        isSelected ? 'border-2 border-gray-900 scale-110' : ''
                      }`}
                    >
                      {isSelected && <Check size={18} color="#FFFFFF" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View className="flex-row gap-3 pt-2 border-t border-gray-100">
            <Button
              title="Cancel"
              variant="outline"
              onPress={onClose}
              className="flex-1"
            />
            <Button
              title="Save Collection"
              variant="primary"
              loading={loading}
              onPress={handleSubmit}
              className="flex-1"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};
