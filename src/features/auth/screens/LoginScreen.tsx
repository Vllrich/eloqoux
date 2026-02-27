import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  useColorScheme,
} from 'react-native';
import { getColors } from '../../../shared/lib/colors';
import { useAuth } from '../../../app/AuthContext';

export default function LoginScreen() {
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === 'dark';
  const colors = getColors(isDark);
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationSent, setConfirmationSent] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    const result = mode === 'login'
      ? await signIn(email.trim(), password)
      : await signUp(email.trim(), password);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (mode === 'signup') {
      setConfirmationSent(true);
    }
  };

  const toggleMode = () => {
    setMode((m) => (m === 'login' ? 'signup' : 'login'));
    setError('');
    setConfirmationSent(false);
  };

  const handleConfirmedSignIn = async () => {
    setLoading(true);
    setError('');
    const result = await signIn(email.trim(), password);
    setLoading(false);
    if (result.error) {
      setError(result.error.includes('Email not confirmed')
        ? 'Email not confirmed yet. Please check your inbox and click the link first.'
        : result.error);
    }
  };

  if (confirmationSent) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', paddingHorizontal: 32 }}>
        <Text style={{ fontSize: 56, textAlign: 'center', marginBottom: 24 }}>✉️</Text>
        <Text
          style={{
            fontSize: 28,
            fontWeight: '300',
            color: colors.text,
            textAlign: 'center',
            letterSpacing: 1,
            marginBottom: 12,
          }}
        >
          Check Your Email
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: colors.textMuted,
            textAlign: 'center',
            lineHeight: 24,
            marginBottom: 32,
          }}
        >
          We sent a confirmation link to{'\n'}
          <Text style={{ color: colors.text, fontWeight: '600' }}>{email}</Text>
          {'\n\n'}Click the link in your email, then come back here.
        </Text>

        {error ? (
          <Text
            style={{
              color: colors.error,
              fontSize: 14,
              textAlign: 'center',
              marginBottom: 16,
            }}
          >
            {error}
          </Text>
        ) : null}

        <TouchableOpacity
          onPress={handleConfirmedSignIn}
          disabled={loading}
          style={{
            backgroundColor: colors.accent,
            paddingVertical: 18,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 12,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', letterSpacing: 1 }}>
              I've Confirmed My Email
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setConfirmationSent(false);
            setMode('login');
            setPassword('');
            setError('');
          }}
          style={{ alignItems: 'center', paddingVertical: 12 }}
        >
          <Text style={{ color: colors.textMuted, fontSize: 14 }}>
            Use a different account
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View
        style={{
          flex: 1,
          justifyContent: 'center',
          paddingHorizontal: 32,
          opacity: fadeAnim,
        }}
      >
        <Text
          style={{
            fontSize: 48,
            fontWeight: '300',
            color: colors.text,
            letterSpacing: 2,
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          Eloquox
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.textMuted,
            textAlign: 'center',
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginBottom: 48,
          }}
        >
          {mode === 'login' ? 'Welcome back' : 'Start your 14-day free trial'}
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: 20,
            paddingVertical: 16,
            fontSize: 16,
            color: colors.text,
            marginBottom: 12,
          }}
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: 20,
            paddingVertical: 16,
            fontSize: 16,
            color: colors.text,
            marginBottom: 24,
          }}
        />

        {error ? (
          <Text
            style={{
              color: colors.error,
              fontSize: 14,
              textAlign: 'center',
              marginBottom: 16,
            }}
          >
            {error}
          </Text>
        ) : null}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={{
            backgroundColor: colors.accent,
            paddingVertical: 18,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 16,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={{
                color: '#ffffff',
                fontSize: 16,
                fontWeight: '600',
                letterSpacing: 1,
              }}
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleMode} style={{ alignItems: 'center' }}>
          <Text style={{ color: colors.textMuted, fontSize: 14 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <Text style={{ color: colors.accent, fontWeight: '600' }}>
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </Text>
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
