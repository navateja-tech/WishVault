import { View, Text, TextInput } from 'react-native';
import { Search as SearchIcon } from 'lucide-react-native';

export default function SearchScreen() {
  return (
    <View className="flex-1 bg-white px-6 py-4">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900">Search</Text>
        <Text className="text-gray-500 mt-1">Find products by title, website, or notes.</Text>
      </View>

      <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-6">
        <SearchIcon color="#9CA3AF" size={20} />
        <TextInput
          placeholder="Search products..."
          placeholderTextColor="#9CA3AF"
          className="flex-1 ml-3 text-gray-900 font-medium text-base"
        />
      </View>

      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-400 font-medium">Type something to search...</Text>
      </View>
    </View>
  );
}
