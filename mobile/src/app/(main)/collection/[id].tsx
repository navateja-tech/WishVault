import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, FolderOpen } from 'lucide-react-native';

import { useCollectionsQuery } from '@/features/collections/hooks/useCollections';

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: collections = [] } = useCollectionsQuery();

  const collection = collections.find((c) => c.id === id);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Navigation Header */}
      <View className="flex-row items-center justify-between px-6 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-1 -ml-1">
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900" numberOfLines={1}>
          {collection?.name || 'Collection'}
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }} className="px-6">
        <View className="w-16 h-16 rounded-2xl bg-pink-50 items-center justify-center mb-3">
          <FolderOpen size={32} color="#F472B6" />
        </View>
        <Text className="text-xl font-bold text-gray-900 mb-1">{collection?.name || 'Collection'}</Text>
        <Text className="text-gray-400 text-center text-sm">
          No saved products in this collection yet.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
