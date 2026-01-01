import { StatusBar } from "expo-status-bar";
import { Text, View, TouchableOpacity, useColorScheme } from "react-native";
import { useState, useEffect } from "react";
import "./global.css";
import { getColors } from "./src/lib/colors";

export default function App() {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === "dark");
  const themeColors = getColors(isDark);

  useEffect(() => {
    setIsDark(systemColorScheme === "dark");
  }, [systemColorScheme]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <View
      className={`flex-1 items-center justify-center ${isDark ? "dark" : ""}`}
    >
      <View
        className="flex-1 w-full items-center justify-center"
        style={{ backgroundColor: themeColors.bg }}
      >
        <TouchableOpacity
          onPress={toggleTheme}
          className="absolute top-16 right-6 rounded-full p-4 border"
          style={{
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
          }}
        >
          <Text style={{ color: themeColors.text, fontSize: 24 }}>
            {isDark ? "☀️" : "🌙"}
          </Text>
        </TouchableOpacity>

        <Text className="text-xl font-bold" style={{ color: themeColors.text }}>
          Welcome to Eloqoux!
        </Text>
        <Text className="mt-2" style={{ color: themeColors.textMuted }}>
          Open up App.tsx to start working on your app!
        </Text>
        <TouchableOpacity
          className="mt-6 px-6 py-3 rounded-lg"
          style={{ backgroundColor: themeColors.accent }}
        >
          <Text className="text-white font-semibold">Get Started</Text>
        </TouchableOpacity>
        <StatusBar style={isDark ? "light" : "dark"} />
      </View>
    </View>
  );
}
