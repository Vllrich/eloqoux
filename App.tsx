import { StatusBar } from "expo-status-bar";
import { View, useColorScheme } from "react-native";
import { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";
import { getColors } from "./src/shared/lib/colors";
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
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      <StatusBar style={isDark ? "light" : "dark"} />
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
