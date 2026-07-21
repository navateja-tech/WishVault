import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, FolderOpen, Grid } from 'lucide-react-native';

import { useCollectionsQuery } from '@/features/collections/hooks/useCollections';
import { useProductsQuery } from '@/features/products/hooks/useProducts';
import { ProductItem } from '@/features/products/api/productsApi';
import { Card } from '@/components/ui/Card';
import { COLLECTION_ICONS } from '@/features/collections/components/CollectionModal';

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: collections = [] } = useCollectionsQuery();
  const { data: products = [], isLoading, isRefetching, refetch } = useProductsQuery(id);

  const collection = collections.find((c) => c.id === id);

  const getEmojiForIcon = (iconId: string) => {
    const found = COLLECTION_ICONS.find((item) => item.id === iconId);
    return found ? found.emoji : '📁';
  };

  const handleProductPress = (productId: string) => {
    router.push(`/(main)/product/${productId}` as any);
  };

  const renderProductGridItem = ({ item }: { item: ProductItem }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      className="w-[48%] mb-4"
      onPress={() => handleProductPress(item.id)}
    >
      <Card variant="bordered" className="p-0 overflow-hidden rounded-2xl">
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} className="w-full h-36 bg-gray-50" resizeMode="cover" />
        ) : (
          <View className="w-full h-36 bg-pink-50 items-center justify-center">
            <Text className="text-3xl">🛍️</Text>
          </View>
        )}
        <View className="p-3">
          <Text className="text-xs font-semibold text-primary uppercase" numberOfLines={1}>
            {item.website || item.domain || 'Store'}
          </Text>
          <Text className="text-sm font-bold text-gray-900 mt-0.5 mb-1" numberOfLines={1}>
            {item.title}
          </Text>
          {item.price !== null ? (
            <Text className="text-sm font-extrabold text-gray-900">
              {item.currency === 'INR' ? '₹' : '$'}
              {item.price.toFixed(2)}
            </Text>
          ) : (
            <Text className="text-xs text-gray-400">View Price</Text>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      {/* Navigation Header */}
      <View className="flex-row items-center justify-between px-6 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-1 -ml-1">
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <View className="flex-row items-center gap-2 max-w-[70%]">
          {collection && <Text className="text-xl">{getEmojiForIcon(collection.icon)}</Text>}
          <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
            {collection?.name || 'Collection'}
          </Text>
        </View>
        <View className="w-6" />
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F472B6" />
        </View>
      ) : products.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#F472B6" />}
          className="px-6"
        >
          <View className="w-16 h-16 rounded-2xl bg-pink-50 items-center justify-center mb-4">
            <FolderOpen size={32} color="#F472B6" />
          </View>
          <Text className="text-xl font-bold text-gray-900 mb-1">Empty Collection</Text>
          <Text className="text-gray-400 text-center text-sm max-w-[260px]">
            No products saved under this category yet.
          </Text>
        </ScrollView>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProductGridItem}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#F472B6" />}
        />
      )}
    </SafeAreaView>
  );
}
