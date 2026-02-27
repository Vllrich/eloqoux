import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { getColors } from '../lib/colors';
import { getUserPreferences, saveUserPreferences, clearAllData } from '../lib/storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const REMINDER_MESSAGES = [
  "Time to learn a new word!",
  "Your vocabulary awaits — open Eloquox!",
  "Keep your streak going!",
  "A new word a day keeps ignorance away.",
  "Expand your lexicon today.",
];

export default function SettingsScreen() {
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === 'dark';
  const colors = getColors(isDark);

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notifHour, setNotifHour] = useState(9);

  useEffect(() => {
    loadPrefs();
  }, []);

  const loadPrefs = async () => {
    const prefs = await getUserPreferences();
    if (prefs) {
      setNotificationsEnabled(prefs.notificationsEnabled ?? false);
      setNotifHour(prefs.notificationHour ?? 9);
    }
  };

  const scheduleNotification = async (hour: number) => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const msg = REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)];
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Eloquox',
        body: msg,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute: 0,
      },
    });
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please enable notifications in your device settings.');
        return;
      }
      await scheduleNotification(notifHour);
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
    setNotificationsEnabled(value);
    const prefs = await getUserPreferences();
    if (prefs) {
      await saveUserPreferences({ ...prefs, notificationsEnabled: value });
    }
  };

  const cycleHour = async (direction: 1 | -1) => {
    const newHour = (notifHour + direction + 24) % 24;
    setNotifHour(newHour);
    const prefs = await getUserPreferences();
    if (prefs) {
      await saveUserPreferences({ ...prefs, notificationHour: newHour });
    }
    if (notificationsEnabled) {
      await scheduleNotification(newHour);
    }
  };

  const formatHour = (h: number) => {
    const suffix = h >= 12 ? 'PM' : 'AM';
    const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${display}:00 ${suffix}`;
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your history, preferences, and progress. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Done', 'All data has been cleared. Restart the app to begin fresh.');
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: 60,
          paddingHorizontal: 24,
          paddingBottom: 100,
        }}
      >
        <Text
          style={{
            fontSize: 32,
            fontWeight: '300',
            color: colors.text,
            marginBottom: 8,
            letterSpacing: 1,
          }}
        >
          Settings
        </Text>
        <Text style={{ fontSize: 16, color: colors.textMuted, marginBottom: 40 }}>
          Customize your experience
        </Text>

        {/* Notifications */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 14, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
            Daily Reminder
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 16, color: colors.text }}>Enable notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#ffffff"
            />
          </View>

          {notificationsEnabled && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, color: colors.text }}>Reminder time</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <TouchableOpacity onPress={() => cycleHour(-1)}>
                  <Text style={{ fontSize: 20, color: colors.accent }}>−</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 16, color: colors.text, fontWeight: '600', minWidth: 80, textAlign: 'center' }}>
                  {formatHour(notifHour)}
                </Text>
                <TouchableOpacity onPress={() => cycleHour(1)}>
                  <Text style={{ fontSize: 20, color: colors.accent }}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Danger Zone */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 20,
            marginTop: 24,
          }}
        >
          <Text style={{ fontSize: 14, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
            Data
          </Text>
          <TouchableOpacity
            onPress={handleClearData}
            style={{
              backgroundColor: colors.bg,
              paddingVertical: 14,
              borderRadius: 8,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#e74c3c',
            }}
          >
            <Text style={{ color: '#e74c3c', fontSize: 14, fontWeight: '600' }}>
              Clear All Data
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

