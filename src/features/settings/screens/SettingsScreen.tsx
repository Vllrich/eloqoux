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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getColors } from '../../../shared/lib/colors';
import { fonts } from '../../../shared/lib/typography';
import { getUserPreferences, saveUserPreferences, clearAllData } from '../../../services/storage';
import { useAuth } from '../../../app/AuthContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
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
  const insets = useSafeAreaInsets();
  const { user, profile, trialActive, trialDaysLeft, signOut } = useAuth();

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
          paddingTop: insets.top + 16,
          paddingHorizontal: 24,
          paddingBottom: 100,
        }}
      >
        <Text
          style={{
            fontFamily: fonts.serif,
            fontSize: 32,
            color: colors.text,
            marginBottom: 8,
            letterSpacing: -0.5,
          }}
        >
          Settings
        </Text>
        <Text style={{ fontFamily: fonts.serifItalic, fontSize: 15, color: colors.textMuted, marginBottom: 40 }}>
          Customize your experience
        </Text>

        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: colors.border + '80',
            padding: 20,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontFamily: fonts.sansMedium, fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>
            Daily Reminder
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontFamily: fonts.serif, fontSize: 16, color: colors.text }}>Enable notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#ffffff"
            />
          </View>

          {notificationsEnabled && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: fonts.serif, fontSize: 16, color: colors.text }}>Reminder time</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <TouchableOpacity onPress={() => cycleHour(-1)}>
                  <Text style={{ fontSize: 20, color: colors.accent }}>−</Text>
                </TouchableOpacity>
                <Text style={{ fontFamily: fonts.sansMedium, fontSize: 16, color: colors.text, minWidth: 80, textAlign: 'center' }}>
                  {formatHour(notifHour)}
                </Text>
                <TouchableOpacity onPress={() => cycleHour(1)}>
                  <Text style={{ fontSize: 20, color: colors.accent }}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: colors.border + '80',
            padding: 20,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontFamily: fonts.sansMedium, fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>
            Account
          </Text>
          <Text style={{ fontFamily: fonts.serif, fontSize: 16, color: colors.text, marginBottom: 10 }}>
            {user?.email}
          </Text>
          <View
            style={{
              backgroundColor: trialActive ? (profile?.is_subscribed ? colors.successBg : colors.accent + '18') : colors.errorBg,
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 4,
              alignSelf: 'flex-start',
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                fontFamily: fonts.sansMedium,
                fontSize: 13,
                color: trialActive ? (profile?.is_subscribed ? colors.success : colors.accent) : colors.error,
              }}
            >
              {profile?.is_subscribed
                ? 'Subscribed'
                : trialActive
                  ? `Trial — ${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} left`
                  : 'Trial expired'}
            </Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: colors.border + '80',
            padding: 20,
            marginTop: 8,
          }}
        >
          <Text style={{ fontFamily: fonts.sansMedium, fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>
            Data
          </Text>
          <TouchableOpacity
            onPress={handleClearData}
            style={{
              backgroundColor: 'transparent',
              paddingVertical: 14,
              borderRadius: 4,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.error + '50',
              marginBottom: 12,
            }}
          >
            <Text style={{ color: colors.error, fontFamily: fonts.sansMedium, fontSize: 14 }}>
              Clear All Data
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              Alert.alert('Sign Out', 'Are you sure?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', onPress: signOut },
              ])
            }
            style={{
              backgroundColor: 'transparent',
              paddingVertical: 14,
              borderRadius: 4,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.text, fontFamily: fonts.sansMedium, fontSize: 14 }}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
