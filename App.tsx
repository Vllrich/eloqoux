import { StatusBar } from "expo-status-bar";
import { View, useColorScheme } from "react-native";
import { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";
import { getColors } from "./src/lib/colors";
import { isOnboarded } from "./src/lib/storage";
import ErrorBoundary from "./src/components/ErrorBoundary";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import CategorySelectionScreen from "./src/screens/CategorySelectionScreen";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === "dark";
  const colors = getColors(isDark);

  const [loading, setLoading] = useState(true);
  const [onboarding, setOnboarding] = useState<"welcome" | "categories" | "complete">("welcome");

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    const isComplete = await isOnboarded();
    setOnboarding(isComplete === true ? "complete" : "welcome");
    setLoading(false);
  };

  const handleWelcomeContinue = () => {
    setOnboarding("categories");
  };

  const handleCategoriesComplete = () => {
    setOnboarding("complete");
  };

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  if (onboarding === "welcome") {
    return (
      <ErrorBoundary>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <WelcomeScreen onContinue={handleWelcomeContinue} />
          <StatusBar style={isDark ? "light" : "dark"} />
        </GestureHandlerRootView>
      </ErrorBoundary>
    );
  }

  if (onboarding === "categories") {
    return (
      <ErrorBoundary>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <CategorySelectionScreen onComplete={handleCategoriesComplete} />
          <StatusBar style={isDark ? "light" : "dark"} />
        </GestureHandlerRootView>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
          <StatusBar style={isDark ? "light" : "dark"} />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
