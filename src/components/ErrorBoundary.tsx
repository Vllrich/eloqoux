import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { getColors } from '../lib/colors';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  const isDark = useColorScheme() === 'dark';
  const colors = getColors(isDark);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
      <Text style={{ fontSize: 24, fontWeight: '300', color: colors.text, marginBottom: 12 }}>
        Something went wrong
      </Text>
      <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: 32, lineHeight: 20 }}>
        {error?.message || 'An unexpected error occurred.'}
      </Text>
      <TouchableOpacity
        onPress={onReset}
        style={{
          backgroundColor: colors.accent,
          paddingHorizontal: 32,
          paddingVertical: 14,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}
