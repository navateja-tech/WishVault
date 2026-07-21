import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Linking,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Trash2, ExternalLink, Tag, Save } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import {
  useProductQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from '@/features/products/hooks/useProducts';
import { useCollectionsQuery } from '@/features/collections/hooks/useCollections';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { COLLECTION_ICONS } from '@/features/collections/components/CollectionModal';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: product, isLoading } = useProductQuery(id);
  const { data: collections = [] } = useCollectionsQuery();
  const updateMutation = useUpdateProductMutation();
  const deleteMutation = useDeleteProductMutation();

  const [notes, setNotes] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [showCollectionPicker, setShowCollectionPicker] = useState(false);

  useEffect(() => {
    if (product) {
      setNotes(product.notes || '');
      setSelectedCollectionId(product.collection_id);
    }
  }, [product]);

  const handleOpenStore = async () => {
    if (!product?.url) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const supported = await Linking.canOpenURL(product.url);
    if (supported) {
      await Linking.openURL(product.url);
    } else {
      Alert.alert('Error', "Cannot open this product's store link");
    }
  };

  const handleUpdateNotes = async () => {
    if (!product) return;
    try {
      await updateMutation.mutateAsync({
        id: product.id,
        data: { notes: notes.trim() || null },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Notes updated successfully');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update notes');
    }
  };

  const handleSelectCollection = async (colId: string | null) => {
    if (!product) return;
    setSelectedCollectionId(colId);
    setShowCollectionPicker(false);
    try {
      await updateMutation.mutateAsync({
        id: product.id,
        data: { collection_id: colId },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update collection');
    }
  };

  const handleDelete = () => {
    if (!product) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Delete Product',
      'Are you sure you want to permanently remove this product from your library?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteMutation.mutateAsync(product.id);
            router.back();
          },
        },
      ]
    );
  };

  const getEmojiForIcon = (iconId: string) => {
    const found = COLLECTION_ICONS.find((item) => item.id === iconId);
    return found ? found.emoji : '📁';
  };

  const currentCollection = collections.find((c) => c.id === selectedCollectionId);

  if (isLoading || !product) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#F472B6" />
      </View>
    );
  }

  const isNotesChanged = (product.notes || '') !== notes;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Navigation Header */}
        <View className="flex-row items-center justify-between px-6 py-3 border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()} className="p-1 -ml-1">
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
            Product Details
          </Text>
          <TouchableOpacity onPress={handleDelete} className="p-1 -mr-1">
            <Trash2 size={22} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* Hero Product Image */}
          {product.image_url ? (
            <Image
              source={{ uri: product.image_url }}
              className="w-full h-80 bg-gray-50"
              resizeMode="contain"
            />
          ) : (
            <View className="w-full h-64 bg-pink-50 items-center justify-center">
              <Text className="text-7xl">🛍️</Text>
            </View>
          )}

          {/* Info Section */}
          <View className="px-6 pt-6">
            <Text className="text-sm font-semibold text-primary uppercase tracking-widest">
              {product.website || product.domain || 'Online Store'}
            </Text>
            <Text className="text-2xl font-black text-gray-900 mt-1 mb-2 leading-tight">
              {product.title}
            </Text>

            {/* Price Badge */}
            {product.price !== null && (
              <View className="flex-row items-center mb-6">
                <Text className="text-3xl font-black text-gray-900">
                  {product.currency === 'INR' ? '₹' : '$'}
                  {product.price.toFixed(2)}
                </Text>
              </View>
            )}

            {/* Collection Organizer Badge */}
            <View className="mb-6">
              <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Collection Category
              </Text>
              <TouchableOpacity
                onPress={() => setShowCollectionPicker(!showCollectionPicker)}
                className="flex-row items-center self-start bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5"
              >
                <Tag size={16} color="#6B7280" className="mr-2" />
                <Text className="text-base font-bold text-gray-800">
                  {currentCollection
                    ? `${getEmojiForIcon(currentCollection.icon)} ${currentCollection.name}`
                    : '📁 Uncategorized'}
                </Text>
              </TouchableOpacity>

              {/* Collapsible Collection Selector Grid */}
              {showCollectionPicker && (
                <View className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mt-3 flex-row flex-wrap gap-2">
                  <TouchableOpacity
                    onPress={() => handleSelectCollection(null)}
                    className={`px-3 py-2 rounded-xl border ${
                      selectedCollectionId === null ? 'border-primary bg-pink-100/50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <Text className="font-semibold text-gray-700">Uncategorized</Text>
                  </TouchableOpacity>
                  {collections.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      onPress={() => handleSelectCollection(c.id)}
                      className={`px-3 py-2 rounded-xl border flex-row items-center ${
                        selectedCollectionId === c.id ? 'border-primary bg-pink-100/50' : 'border-gray-200 bg-white'
                      }`}
                    >
                      <Text className="mr-1">{getEmojiForIcon(c.icon)}</Text>
                      <Text className="font-semibold text-gray-700">{c.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-4 mb-8">
              <Button
                title="View in Store"
                variant="primary"
                size="lg"
                leftIcon={<ExternalLink size={20} color="#FFFFFF" />}
                onPress={handleOpenStore}
                className="flex-1 shadow-sm shadow-pink-200"
              />
            </View>

            {/* Product Description */}
            {product.description && (
              <View className="mb-6 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Description
                </Text>
                <Text className="text-sm text-gray-600 leading-relaxed">
                  {product.description}
                </Text>
              </View>
            )}

            {/* Editable Notes Box */}
            <View className="mb-6 relative">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Personal Purchase Notes
                </Text>
                {isNotesChanged && (
                  <TouchableOpacity
                    onPress={handleUpdateNotes}
                    className="flex-row items-center bg-primary px-3 py-1.5 rounded-lg"
                  >
                    <Save size={14} color="#FFFFFF" className="mr-1" />
                    <Text className="text-xs font-semibold text-white">Save</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Input
                placeholder="Add shopping sizes, colors, coupon codes, or priorities..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                className="h-28 text-top"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
