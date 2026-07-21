import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Search, Grid, List, Sparkles, FolderHeart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useProductsQuery } from '@/features/products/hooks/useProducts';
import { useCollectionsQuery } from '@/features/collections/hooks/useCollections';
import { ProductItem } from '@/features/products/api/productsApi';
import { Card } from '@/components/ui/Card';

export default function DashboardScreen() {
  const router = useRouter();
  const { data: products = [], isLoading, isRefetching, refetch } = useProductsQuery();
  const { data: collections = [] } = useCollectionsQuery();

  const [isGridView, setIsGridView] = useState(true);

  const handleOpenAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(main)/add-product');
  };

  const handleProductPress = (id: string) => {
    router.push(`/(main)/product/${id}` as any);
  };

  // Get recently saved (first 5 items from list, since backend lists by created_at desc)
  const recentlySaved = products.slice(0, 5);

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

  const renderProductListItem = ({ item }: { item: ProductItem }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      className="mb-3"
      onPress={() => handleProductPress(item.id)}
    >
      <Card variant="bordered" className="p-3 flex-row items-center gap-4">
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} className="w-16 h-16 rounded-xl bg-gray-50" resizeMode="cover" />
        ) : (
          <View className="w-16 h-16 rounded-xl bg-pink-50 items-center justify-center">
            <Text className="text-2xl">🛍️</Text>
          </View>
        )}
        <View className="flex-1 justify-center">
          <Text className="text-xs font-semibold text-primary uppercase">
            {item.website || item.domain}
          </Text>
          <Text className="text-base font-bold text-gray-900 mt-0.5" numberOfLines={1}>
            {item.title}
          </Text>
          {item.price !== null && (
            <Text className="text-sm font-extrabold text-gray-900 mt-0.5">
              {item.currency === 'INR' ? '₹' : '$'}
              {item.price.toFixed(2)}
            </Text>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View className="pt-2">
      {/* Quick Search Trigger */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push('/(main)/(tabs)/search')}
        className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 mb-6"
      >
        <Search size={20} color="#9CA3AF" />
        <Text className="text-gray-400 ml-3 text-base">Search saved items...</Text>
      </TouchableOpacity>

      {/* Recently Saved Carousel */}
      {recentlySaved.length > 0 && (
        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Sparkles size={18} color="#EC4899" />
            <Text className="text-lg font-bold text-gray-900">Recently Saved</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-4">
            {recentlySaved.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => handleProductPress(item.id)}
                className="w-44 mr-3"
              >
                <Card variant="bordered" className="p-0 overflow-hidden rounded-2xl">
                  {item.image_url ? (
                    <Image source={{ uri: item.image_url }} className="w-full h-28 bg-gray-50" resizeMode="cover" />
                  ) : (
                    <View className="w-full h-28 bg-pink-50 items-center justify-center">
                      <Text className="text-2xl">🛍️</Text>
                    </View>
                  )}
                  <View className="p-3">
                    <Text className="text-xs text-primary font-semibold uppercase" numberOfLines={1}>
                      {item.website || item.domain}
                    </Text>
                    <Text className="text-sm font-bold text-gray-900 mt-0.5" numberOfLines={1}>
                      {item.title}
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Main Items Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-gray-900">My Items ({products.length})</Text>
        {products.length > 0 && (
          <View className="flex-row bg-gray-50 border border-gray-100 rounded-xl p-1 gap-1">
            <TouchableOpacity
              onPress={() => setIsGridView(true)}
              className={`p-1.5 rounded-lg ${isGridView ? 'bg-white shadow-sm' : ''}`}
            >
              <Grid size={18} color={isGridView ? '#EC4899' : '#6B7280'} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsGridView(false)}
              className={`p-1.5 rounded-lg ${!isGridView ? 'bg-white shadow-sm' : ''}`}
            >
              <List size={18} color={!isGridView ? '#EC4899' : '#6B7280'} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Top Banner */}
      <View className="flex-row justify-between items-center px-6 pt-4 pb-2">
        <View>
          <Text className="text-2xl font-bold text-gray-900 tracking-tight">UniVault</Text>
          <Text className="text-gray-400 text-xs mt-0.5">Your personal product library</Text>
        </View>

        <TouchableOpacity
          onPress={handleOpenAdd}
          className="w-10 h-10 rounded-full bg-primary items-center justify-center shadow-sm shadow-pink-200"
        >
          <Plus size={22} color="#FFFFFF" />
        </TouchableOpacity>
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
          <View className="w-20 h-20 rounded-full bg-pink-50 items-center justify-center mb-4">
            <FolderHeart size={36} color="#F472B6" />
          </View>
          <Text className="text-xl font-bold text-gray-900 mb-1">Your Vault is Empty</Text>
          <Text className="text-gray-400 text-center text-sm mb-6 max-w-[260px] leading-relaxed">
            Pasted URL links from Amazon, IKEA, Nike, or any brand website will appear here.
          </Text>
          <TouchableOpacity
            onPress={handleOpenAdd}
            className="bg-primary px-6 py-3.5 rounded-xl shadow-sm shadow-pink-200"
          >
            <Text className="text-white font-semibold text-base">+ Save First Product</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <FlatList
          key={isGridView ? 'grid' : 'list'}
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={isGridView ? renderProductGridItem : renderProductListItem}
          numColumns={isGridView ? 2 : 1}
          columnWrapperStyle={isGridView ? { justifyContent: 'space-between' } : undefined}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#F472B6" />}
        />
      )}
    </View>
  );
}
