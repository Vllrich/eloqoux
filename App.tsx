import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import './global.css';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-gray-900">
        Welcome to Eloqoux!
      </Text>
      <Text className="text-gray-600 mt-2">
        Open up App.tsx to start working on your app!
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}
