import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Mail, Lock, Eye, EyeOff, Activity, ArrowRight, ShieldCheck, User } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { loginUser, googleLoginApi } from '../services/api';
import { useProfile } from '../context/ProfileContext';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
  const { showModal } = useProfile();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'handband',
  });

  useEffect(() => {
    console.log('Google Redirect URI:', redirectUri);
  }, [redirectUri]);

  const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
  const googleAndroidClientId =
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
    googleWebClientId ||
    'dummy-android-client-id';
  const googleIosClientId =
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
    googleWebClientId ||
    'dummy-ios-client-id';

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: googleWebClientId || 'dummy-client-id',
    webClientId: googleWebClientId || undefined,
    iosClientId: googleIosClientId,
    androidClientId: googleAndroidClientId,
    redirectUri,
  });

  const handleGoogleIdToken = async (idToken) => {
    setGoogleLoading(true);
    setErrorMessage('');
    try {
      const result = await googleLoginApi(idToken);
      setGoogleLoading(false);
      showModal({
        title: 'Login Successful! 🎉',
        message: `Welcome to Hand Band, ${result.data?.user?.fullName || 'User'}!`,
        type: 'success',
        confirmText: 'Continue to Dashboard',
        onConfirm: () => {
          navigation.navigate('MainTabs');
        },
      });
    } catch (error) {
      setGoogleLoading(false);
      setErrorMessage(error.message);
      showModal({
        title: 'Google Login Error',
        message: error.message,
        type: 'error',
      });
    }
  };

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        handleGoogleIdToken(id_token);
      }
    } else if (response?.type === 'error') {
      setErrorMessage(response.error?.message || 'Google authentication failed.');
    }
  }, [response]);

  const handleGooglePress = async () => {
    setErrorMessage('');
    try {
      if (Platform.OS === 'web') {
        const res = await promptAsync();
        if (res?.type === 'success' && res.params?.id_token) {
          await handleGoogleIdToken(res.params.id_token);
        }
      } else {
        await promptAsync();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to start Google authentication.');
    }
  };

  const handleLogin = async () => {
    setErrorMessage('');
    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Please enter both Name and Password.');
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser({
        identifier: identifier.trim(),
        password: password.trim(),
      });

      setLoading(false);
      showModal({
        title: 'Login Successful! 🎉',
        message: `Welcome back to Hand Band, ${identifier.trim()}!`,
        type: 'success',
        confirmText: 'Continue to Dashboard',
        onConfirm: () => {
          navigation.navigate('MainTabs');
        },
      });
    } catch (error) {
      setLoading(false);
      setErrorMessage(error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Activity color="#00BFA5" size={32} />
          </View>
          <Text style={styles.title}>HAND BAND</Text>
          <Text style={styles.subtitle}>Health & Family Circle Platform</Text>
        </View>

        {/* Form Container */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Identifier Input */}
          <Text style={styles.label}>Name</Text>
          <View style={styles.inputContainer}>
            <User color="#7A9EA8" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. John Doe"
              placeholderTextColor="#54717A"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="words"
            />
          </View>

          {/* Password Input */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <Lock color="#7A9EA8" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#54717A"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              {showPassword ? <EyeOff color="#00BFA5" size={16} /> : <Eye color="#7A9EA8" size={16} />}
            </TouchableOpacity>
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity 
            style={styles.forgotPasswordContainer} 
            onPress={() => {
              showModal({
                title: 'Reset Password',
                message: 'Password reset link will be sent to your registered Email or Mobile number.',
                type: 'info',
                confirmText: 'Got It',
              });
            }}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading || googleLoading}
          >
            {loading ? (
              <ActivityIndicator color="#001F27" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Sign In</Text>
                <ArrowRight color="#001F27" size={20} />
              </View>
            )}
          </TouchableOpacity>

          {/* Footer Register Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.linkText}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Google Login Button */}
        <TouchableOpacity
          style={[styles.googleButton, (googleLoading || !request) && styles.buttonDisabled]}
          onPress={handleGooglePress}
          disabled={googleLoading || !request}
          activeOpacity={0.8}
        >
          {googleLoading ? (
            <ActivityIndicator color="#EA4335" />
          ) : (
            <>
              <View style={styles.googleIconPlaceholder}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001F27',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 191, 165, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#00BFA5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#7A9EA8',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#002B36',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.2)',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 75, 75, 0.15)',
    borderWidth: 1,
    borderColor: '#FF4B4B',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF4B4B',
    fontSize: 14,
  },
  label: {
    fontSize: 14,
    color: '#7A9EA8',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#001F27',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#004D40',
    marginBottom: 20,
    paddingLeft: 12,
    paddingRight: 40,
    position: 'relative',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    color: '#FFFFFF',
    fontSize: 16,
    outlineStyle: 'none',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    marginTop: -8,
  },
  forgotPasswordText: {
    color: '#00BFA5',
    fontSize: 13,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#00BFA5',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#001F27',
    fontSize: 17,
    fontWeight: '700',
    marginRight: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#7A9EA8',
    fontSize: 14,
  },
  linkText: {
    color: '#00BFA5',
    fontSize: 14,
    fontWeight: 'bold',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    height: 50,
    marginTop: 24,
    marginHorizontal: 24,
  },
  googleIconPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EA4335',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  googleIconText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  googleButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
});
