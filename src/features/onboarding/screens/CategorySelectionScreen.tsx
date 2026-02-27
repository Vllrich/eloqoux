import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getColors } from '../../../shared/lib/colors';
import { Category } from '../../../shared/types';
import { saveUserPreferences } from '../../../services/storage';

interface CategorySelectionScreenProps {
  onComplete: () => void;
}

const CATEGORIES: Category[] = [
  'Technology',
  'Politics and society',
  'Psychology and behaviour',
  'Environment and sustainability',
  'Languages and linguistics',
  'Gastronomy',
  'Travel and cultures',
  'Medicine and health',
  'Business and entrepreneurship',
];

export default function CategorySelectionScreen({ onComplete }: CategorySelectionScreenProps) {
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === 'dark';
  const colors = getColors(isDark);
  const insets = useSafeAreaInsets();

  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  const toggleCategory = (category: Category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      if (selectedCategories.length >= 3) {
        Alert.alert('Maximum reached', 'You can select up to 3 categories');
        return;
      }
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleContinue = async () => {
    if (selectedCategories.length === 0) {
      Alert.alert('Select a category', 'Please select at least one category to continue');
      return;
    }

    try {
      await saveUserPreferences({
        selectedCategories,
        isOnboarded: true,
      });
      onComplete();
    } catch (error) {
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 32,
          paddingHorizontal: 24,
          paddingBottom: 140,
        }}
      >
        <Text
          style={{
            fontSize: 32,
            fontWeight: '300',
            color: colors.text,
            marginBottom: 12,
            letterSpacing: 1,
          }}
        >
          Choose Your Interests
        </Text>

        <Text
          style={{
            fontSize: 16,
            color: colors.textMuted,
            marginBottom: 40,
            lineHeight: 24,
          }}
        >
          Select 1-3 categories to personalize your word suggestions
        </Text>

        <View style={{ gap: 12 }}>
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategories.includes(category);
            return (
              <TouchableOpacity
                key={category}
                onPress={() => toggleCategory(category)}
                style={{
                  backgroundColor: isSelected ? colors.accent : colors.surface,
                  paddingVertical: 20,
                  paddingHorizontal: 24,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isSelected ? colors.accent : colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: isSelected ? '#ffffff' : colors.text,
                    fontWeight: isSelected ? '600' : '400',
                  }}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: insets.bottom + 16,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            color: colors.textMuted,
            marginBottom: 12,
            textAlign: 'center',
          }}
        >
          {selectedCategories.length} of 3 selected
        </Text>

        <TouchableOpacity
          onPress={handleContinue}
          disabled={selectedCategories.length === 0 ? true : false}
          style={{
            backgroundColor: selectedCategories.length > 0 ? colors.accent : colors.border,
            paddingVertical: 18,
            borderRadius: 12,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: '#ffffff',
              fontSize: 16,
              fontWeight: '600',
              letterSpacing: 1,
            }}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
