import { StatusBar } from "expo-status-bar";
import { View, Text, useColorScheme, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts,
  LibreBaskerville_400Regular,
  LibreBaskerville_700Bold,
  LibreBaskerville_400Regular_Italic,
} from "@expo-google-fonts/libre-baskerville";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import "./global.css";
import { getColors } from "./src/shared/lib/colors";
import { fonts } from "./src/shared/lib/typography";
import { isOnboarded } from "./src/services/storage";
import { AuthProvider, useAuth } from "./src/app/AuthContext";
import ErrorBoundary from "./src/shared/components/ErrorBoundary";
import LoginScreen from "./src/features/auth/screens/LoginScreen";
import WelcomeScreen from "./src/features/onboarding/screens/WelcomeScreen";
import CategorySelectionScreen from "./src/features/onboarding/screens/CategorySelectionScreen";
import AppNavigator from "./src/app/AppNavigator";

function AppContent() {
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === "dark";
  const colors = getColors(isDark);
  const { session, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [onboarding, setOnboarding] = useState<"welcome" | "categories" | "complete">("welcome");

  useEffect(() => {
    if (!authLoading && session) {
      checkOnboarding();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, session]);

  const checkOnboarding = async () => {
    const isComplete = await isOnboarded();
    setOnboarding(isComplete === true ? "complete" : "welcome");
    setLoading(false);
  };

  if (authLoading || loading) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  if (!session) {
    return (
      <>
        <LoginScreen />
        <StatusBar style={isDark ? "light" : "dark"} />
      </>
    );
  }

  if (onboarding === "welcome") {
    return (
      <>
        <WelcomeScreen onContinue={() => setOnboarding("categories")} />
        <StatusBar style={isDark ? "light" : "dark"} />
      </>
    );
  }

  if (onboarding === "categories") {
    return (
      <>
        <CategorySelectionScreen onComplete={() => setOnboarding("complete")} />
        <StatusBar style={isDark ? "light" : "dark"} />
      </>
    );
  }

  return (
    <NavigationContainer>
      <AppNavigator />
      <StatusBar style={isDark ? "light" : "dark"} />
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    LibreBaskerville_400Regular,
    LibreBaskerville_700Bold,
    LibreBaskerville_400Regular_Italic,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const isDark = useColorScheme() === "dark";
  const colors = getColors(isDark);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontFamily: "Georgia", fontSize: 32, color: colors.text, letterSpacing: 2, marginBottom: 8 }}>
          Eloquox
        </Text>
        <ActivityIndicator color={colors.accent} size="small" style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
