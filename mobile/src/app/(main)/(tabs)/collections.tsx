import { View, Text, ScrollView } from 'react-native';

export default function CollectionsScreen() {
  return (
    <ScrollView className="flex-1 bg-white px-6 py-4">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900">Collections</Text>
        <Text className="text-gray-500 mt-1">Group your saved products by category.</Text>
      </View>

      <View className="flex-row flex-wrap justify-between">
        <View className="w-[48%] bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4">
          <View className="w-10 h-10 rounded-lg bg-pink-100 items-center justify-center mb-3">
            <Text className="text-lg">🎮</Text>
          </View>
          <Text className="font-semibold text-gray-900">Gaming Setup</Text>
          <Text className="text-gray-400 text-xs mt-1">0 items</Text>
        </View>

        <View className="w-[48%] bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4">
          <View className="w-10 h-10 rounded-lg bg-pink-100 items-center justify-center mb-3">
            <Text className="text-lg">🧥</Text>
          </View>
          <Text className="font-semibold text-gray-900">Fashion</Text>
          <Text className="text-gray-400 text-xs mt-1">0 items</Text>
        </View>
      </View>
    </ScrollView>
  );
}
