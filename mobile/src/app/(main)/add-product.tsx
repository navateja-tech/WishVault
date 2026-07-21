import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Clipboard, Link2 } from 'lucide-react-native';

import * as ClipboardAPI from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

import { useCollectionsQuery } from '@/features/collections/hooks/useCollections';
import {
  useExtractProductMutation,
  useSaveProductMutation,
} from '@/features/products/hooks/useProducts';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { COLLECTION_ICONS } from '@/features/collections/components/CollectionModal';

export default function AddProductScreen() {
  const router = useRouter();
  const { data: collections = [] } = useCollectionsQuery();
  const extractMutation = useExtractProductMutation();
  const saveMutation = useSaveProductMutation();

  const [url, setUrl] = useState('');
  const [extractedData, setExtractedData] = useState<any>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [customTitle, setCustomTitle] = useState('');

  const handlePaste = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const content = await ClipboardAPI.getStringAsync();
    if (content) {
      setUrl(content);
    }
  };

  const handleExtract = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a product URL');
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const res = await extractMutation.mutateAsync({ url: url.trim() });
      setExtractedData(res);
      setCustomTitle(res.title);
    } catch {
      Alert.alert('Scraping Fallback', 'We could not fetch all web metadata, but you can save it with standard URL details.');
    }
  };

  const handleSave = async () => {
    if (!extractedData) return;

    try {
      await saveMutation.mutateAsync({
        collection_id: selectedCollectionId,
        title: customTitle.trim() || extractedData.title,
        url: extractedData.url,
        image_url: extractedData.image_url,
        website: extractedData.website,
        domain: extractedData.domain,
        price: extractedData.price,
        currency: extractedData.currency || 'USD',
        description: extractedData.description,
        notes: notes.trim() || null,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save product');
    }
  };

  const getEmojiForIcon = (iconId: string) => {
    const found = COLLECTION_ICONS.find((item) => item.id === iconId);
    return found ? found.emoji : '📁';
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-1 -ml-1">
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Save Product</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-6 py-4" keyboardShouldPersistTaps="handled">
        {/* Step 1: URL Input */}
        {!extractedData && (
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-800 mb-2">Paste Product Link</Text>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Input
                  placeholder="https://amazon.com/product/..."
                  value={url}
                  onChangeText={setUrl}
                  leftIcon={<Link2 size={20} color="#9CA3AF" />}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <TouchableOpacity
                onPress={handlePaste}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 items-center justify-center h-14"
              >
                <Clipboard size={22} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <Button
              title="Get Product Preview"
              variant="primary"
              size="lg"
              loading={extractMutation.isPending}
              onPress={handleExtract}
              className="mt-2"
            />
          </View>
        )}

        {/* Step 2: Metadata Preview & Fields */}
        {extractedData && (
          <View className="pb-10">
            {/* Scraped Product Card */}
            <Card variant="bordered" className="mb-6 p-4 flex-row gap-4">
              {extractedData.image_url ? (
                <Image
                  source={{ uri: extractedData.image_url }}
                  className="w-24 h-24 rounded-xl bg-gray-50"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-24 h-24 rounded-xl bg-pink-50 items-center justify-center">
                  <Text className="text-4xl">🛍️</Text>
                </View>
              )}
              <View className="flex-1 justify-center">
                <Text className="text-xs font-semibold text-primary uppercase tracking-wider">
                  {extractedData.website || extractedData.domain || 'Website'}
                </Text>
                <Text className="text-base font-bold text-gray-900 mt-1 mb-1.5" numberOfLines={2}>
                  {customTitle || extractedData.title}
                </Text>
                {extractedData.price !== null && (
                  <Text className="text-lg font-extrabold text-gray-900">
                    {extractedData.currency === 'INR' ? '₹' : '$'}
                    {extractedData.price.toFixed(2)}
                  </Text>
                )}
              </View>
            </Card>

            {/* Custom Title (Editable) */}
            <Input
              label="Product Title"
              placeholder="Product Name"
              value={customTitle}
              onChangeText={setCustomTitle}
            />

            {/* Collection Picker */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-800 mb-3">Select Collection</Text>
              {collections.length === 0 ? (
                <View className="bg-gray-50 border border-gray-100 rounded-xl p-4 items-center">
                  <Text className="text-gray-500 text-sm text-center mb-3">
                    You don&apos;t have any collections yet.
                  </Text>
                  <Button
                    title="Create Collection"
                    variant="outline"
                    size="sm"
                    onPress={() => router.push('/(main)/(tabs)/collections')}
                  />
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => setSelectedCollectionId(null)}
                    className={`px-4 py-3 rounded-xl border flex-row items-center mr-3 ${
                      selectedCollectionId === null
                        ? 'border-primary bg-pink-50'
                        : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <Text className="text-base mr-2">📁</Text>
                    <Text className="font-semibold text-gray-800">Uncategorized</Text>
                    {selectedCollectionId === null && <View className="ml-2 w-2 h-2 rounded-full bg-primary" />}
                  </TouchableOpacity>

                  {collections.map((item) => {
                    const isSelected = selectedCollectionId === item.id;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => setSelectedCollectionId(item.id)}
                        className={`px-4 py-3 rounded-xl border flex-row items-center mr-3 ${
                          isSelected
                            ? 'border-primary bg-pink-50'
                            : 'border-gray-100 bg-gray-50'
                        }`}
                      >
                        <Text className="text-base mr-2">{getEmojiForIcon(item.icon)}</Text>
                        <Text className="font-semibold text-gray-800">{item.name}</Text>
                        {isSelected && <View className="ml-2 w-2 h-2 rounded-full bg-primary" />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            {/* Custom Notes */}
            <Input
              label="My Notes"
              placeholder="Why are you saving this product? (e.g. Christmas gift, need size M)"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              className="h-24 text-top"
            />

            {/* Save Actions */}
            <View className="flex-row gap-4 mt-2">
              <Button
                title="Cancel"
                variant="outline"
                size="lg"
                onPress={() => setExtractedData(null)}
                className="flex-1"
              />
              <Button
                title="Save to UniVault"
                variant="primary"
                size="lg"
                loading={saveMutation.isPending}
                onPress={handleSave}
                className="flex-1"
              />
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
