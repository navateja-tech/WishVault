import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Plus, MoreVertical, FolderOpen } from 'lucide-react-native';

import { useRouter } from 'expo-router';

import {
  useCollectionsQuery,
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
} from '@/features/collections/hooks/useCollections';
import { CollectionModal, COLLECTION_ICONS } from '@/features/collections/components/CollectionModal';
import { CollectionItem } from '@/features/collections/api/collectionsApi';
import { Card } from '@/components/ui/Card';

export default function CollectionsScreen() {
  const router = useRouter();
  const { data: collections = [], isLoading, isRefetching, refetch } = useCollectionsQuery();
  const createMutation = useCreateCollectionMutation();
  const updateMutation = useUpdateCollectionMutation();
  const deleteMutation = useDeleteCollectionMutation();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCollection, setEditingCollection] = useState<CollectionItem | null>(null);

  const handleOpenCreate = () => {
    setEditingCollection(null);
    setModalVisible(true);
  };

  const handleOpenEdit = (col: CollectionItem) => {
    setEditingCollection(col);
    setModalVisible(true);
  };

  const handleDelete = (col: CollectionItem) => {
    Alert.alert(
      'Delete Collection',
      `Are you sure you want to delete "${col.name}"? Products inside will become uncategorized.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(col.id),
        },
      ]
    );
  };

  const handleSaveModal = async (data: { name: string; icon: string; color: string }) => {
    if (editingCollection) {
      await updateMutation.mutateAsync({ id: editingCollection.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const getEmojiForIcon = (iconId: string) => {
    const found = COLLECTION_ICONS.find((item) => item.id === iconId);
    return found ? found.emoji : '📁';
  };

  const renderCollectionCard = ({ item }: { item: CollectionItem }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      className="w-[48%] mb-4"
      onPress={() => router.push(`/(main)/collection/${item.id}` as any)}
    >
      <Card variant="bordered" className="p-4 relative">
        <View className="flex-row justify-between items-start mb-3">
          <View
            style={{ backgroundColor: `${item.color}20` }}
            className="w-12 h-12 rounded-2xl items-center justify-center"
          >
            <Text className="text-2xl">{getEmojiForIcon(item.icon)}</Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              Alert.alert(item.name, 'Choose an option', [
                { text: 'Edit', onPress: () => handleOpenEdit(item) },
                { text: 'Delete', style: 'destructive', onPress: () => handleDelete(item) },
                { text: 'Cancel', style: 'cancel' },
              ]);
            }}
            className="p-1 -mr-2 -mt-1"
          >
            <MoreVertical size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <Text className="text-base font-semibold text-gray-900 mb-1" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-xs text-gray-400 font-medium">
          {item.product_count} {item.product_count === 1 ? 'product' : 'products'}
        </Text>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header Bar */}
      <View className="flex-row justify-between items-center px-6 pt-4 pb-2">
        <View>
          <Text className="text-2xl font-bold text-gray-900 tracking-tight">Collections</Text>
          <Text className="text-gray-400 text-xs mt-0.5">Organize items into personal categories</Text>
        </View>

        <TouchableOpacity
          onPress={handleOpenCreate}
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
      ) : collections.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#F472B6" />}
          className="px-6"
        >
          <View className="w-20 h-20 rounded-full bg-pink-50 items-center justify-center mb-4">
            <FolderOpen size={36} color="#F472B6" />
          </View>
          <Text className="text-xl font-bold text-gray-900 mb-1">No Collections Yet</Text>
          <Text className="text-gray-400 text-center text-sm mb-6 max-w-[260px] leading-relaxed">
            Create your first collection like &quot;Fashion&quot;, &quot;Gaming Setup&quot;, or &quot;Dream Purchases&quot;.
          </Text>
          <TouchableOpacity
            onPress={handleOpenCreate}
            className="bg-primary px-6 py-3.5 rounded-xl shadow-sm shadow-pink-200"
          >
            <Text className="text-white font-semibold text-base">+ Create Collection</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <FlatList
          data={collections}
          keyExtractor={(item) => item.id}
          renderItem={renderCollectionCard}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#F472B6" />}
        />
      )}

      {/* Create / Edit Modal */}
      <CollectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSaveModal}
        initialValues={
          editingCollection
            ? {
                name: editingCollection.name,
                icon: editingCollection.icon,
                color: editingCollection.color,
              }
            : undefined
        }
        title={editingCollection ? 'Edit Collection' : 'New Collection'}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </View>
  );
}
