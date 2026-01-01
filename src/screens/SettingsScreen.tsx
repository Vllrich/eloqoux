import React from 'react';
import { View, Text, ScrollView, useColorScheme } from 'react-native';
import { getColors } from '../lib/colors';

export default function SettingsScreen() {
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === 'dark';
  const colors = getColors(isDark);

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <View className="p-6">
        <Text
          className="text-3xl font-bold mb-6"
          style={{ color: colors.text }}
        >
          Settings
        </Text>
        
        {/* Settings content will be added here */}
        <Text style={{ color: colors.textMuted }}>
          User settings coming soon...
        </Text>
      </View>
    </ScrollView>
  );
}

