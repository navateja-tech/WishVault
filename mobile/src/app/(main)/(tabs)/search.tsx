import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Search as SearchIcon, SlidersHorizontal, ShoppingBag, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useProductsQuery } from '@/features/products/hooks/useProducts';
import { useCollectionsQuery } from '@/features/collections/hooks/useCollections';
import { ProductItem } from '@/features/products/api/productsApi';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { COLLECTION_ICONS } from '@/features/collections/components/CollectionModal';

const PRICE_PRESETS = [
  { label: 'All Prices', value: 'all' },
  { label: 'Under $50', value: 'under50' },
  { label: '$50 - $200', value: '50to200' },
  { label: 'Over $200', value: 'over200' },
];

export default function SearchScreen() {
  const router = useRouter();
  const { data: products = [], isLoading } = useProductsQuery();
  const { data: collections = [] } = useCollectionsQuery();

  const [query, setQuery] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | 'all'>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const getEmojiForIcon = (iconId: string) => {
    const found = COLLECTION_ICONS.find((item) => item.id === iconId);
    return found ? found.emoji : '📁';
  };

  const handleProductPress = (id: string) => {
    router.push(`/(main)/product/${id}` as any);
  };

  const handleClearFilters = () => {
    setQuery('');
    setSelectedCollectionId('all');
    setSelectedPriceRange('all');
  };

  // Perform multi-dimensional client-side filtering
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // 1. Text Search matching title, notes, website, or domain
      const searchStr = `${item.title} ${item.notes || ''} ${item.website || ''} ${item.domain || ''}`.toLowerCase();
      const matchesSearch = query.trim() === '' || searchStr.includes(query.toLowerCase());

      // 2. Collection filter
      const matchesCollection =
        selectedCollectionId === 'all' || item.collection_id === selectedCollectionId;

      // 3. Price filter
      let matchesPrice = true;
      if (selectedPriceRange !== 'all') {
        const price = item.price;
        if (price === null) {
          matchesPrice = false;
        } else {
          if (selectedPriceRange === 'under50') {
            matchesPrice = price < 50;
          } else if (selectedPriceRange === '50to200') {
            matchesPrice = price >= 50 && price <= 200;
          } else if (selectedPriceRange === 'over200') {
            matchesPrice = price > 200;
          }
        }
      }

      return matchesSearch && matchesCollection && matchesPrice;
    });
  }, [products, query, selectedCollectionId, selectedPriceRange]);

  const renderProductItem = ({ item }: { item: ProductItem }) => (
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
            {item.website || item.domain || 'Store'}
          </Text>
          <Text className="text-base font-bold text-gray-900 mt-0.5" numberOfLines={1}>
            {item.title}
          </Text>
          {item.price !== null ? (
            <Text className="text-sm font-extrabold text-gray-900 mt-0.5">
              {item.currency === 'INR' ? '₹' : '$'}
              {item.price.toFixed(2)}
            </Text>
          ) : (
            <Text className="text-xs text-gray-400 mt-0.5">View price</Text>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header bar */}
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900 tracking-tight">Search</Text>
        <Text className="text-gray-400 text-xs mt-0.5">Filter your saved library instantly</Text>
      </View>

      {/* Search Input Bar */}
      <View className="px-6 pb-3 flex-row items-center gap-3">
        <View className="flex-1">
          <Input
            placeholder="Type item names, stores, or brands..."
            value={query}
            onChangeText={setQuery}
            leftIcon={<SearchIcon size={20} color="#9CA3AF" />}
            autoCorrect={false}
          />
        </View>
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          className={`h-14 w-14 rounded-xl border items-center justify-center ${
            showFilters || selectedCollectionId !== 'all' || selectedPriceRange !== 'all'
              ? 'bg-pink-50 border-primary'
              : 'bg-gray-50 border-gray-150'
          }`}
        >
          <SlidersHorizontal
            size={22}
            color={
              showFilters || selectedCollectionId !== 'all' || selectedPriceRange !== 'all'
                ? '#EC4899'
                : '#4B5563'
            }
          />
        </TouchableOpacity>
      </View>

      {/* Advanced Filters Expandable Box */}
      {showFilters && (
        <View className="px-6 py-3 border-b border-gray-100 bg-gray-50/50">
          {/* Collection Filter */}
          <View className="mb-4">
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Filter by Collection
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              <TouchableOpacity
                onPress={() => setSelectedCollectionId('all')}
                className={`px-4 py-2 rounded-xl mr-2 border ${
                  selectedCollectionId === 'all'
                    ? 'bg-primary border-primary'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text
                  className={`font-semibold ${
                    selectedCollectionId === 'all' ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  All
                </Text>
              </TouchableOpacity>
              {collections.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setSelectedCollectionId(item.id)}
                  className={`px-4 py-2 rounded-xl mr-2 border flex-row items-center ${
                    selectedCollectionId === item.id
                      ? 'bg-primary border-primary'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <Text className="mr-1">{getEmojiForIcon(item.icon)}</Text>
                  <Text
                    className={`font-semibold ${
                      selectedCollectionId === item.id ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Price Range Filter */}
          <View className="mb-2">
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Filter by Price Range
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {PRICE_PRESETS.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => setSelectedPriceRange(item.value)}
                  className={`px-4 py-2 rounded-xl border ${
                    selectedPriceRange === item.value
                      ? 'bg-primary border-primary'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      selectedPriceRange === item.value ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Main Results Listing */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F472B6" />
        </View>
      ) : filteredProducts.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
          className="px-6"
        >
          <View className="w-16 h-16 rounded-full bg-gray-50 items-center justify-center mb-4">
            <ShoppingBag size={28} color="#9CA3AF" />
          </View>
          <Text className="text-xl font-bold text-gray-900 mb-1">No Matches Found</Text>
          <Text className="text-gray-400 text-center text-sm mb-6 max-w-[260px]">
            We couldn&apos;t find items matching your filters or search keywords.
          </Text>
          {(query !== '' || selectedCollectionId !== 'all' || selectedPriceRange !== 'all') && (
            <TouchableOpacity
              onPress={handleClearFilters}
              className="bg-gray-100 px-5 py-3 rounded-xl flex-row items-center gap-2"
            >
              <X size={16} color="#4B5563" />
              <Text className="text-gray-700 font-semibold">Clear Filters</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40 }}
        />
      )}
    </View>
  );
}
