import React, { useState } from 'react';
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
import { Mail, Lock, Eye, EyeOff, Activity, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { loginUser } from '../services/api';

export default function LoginScreen({ navigation }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');
    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Please enter both Email/Mobile and Password.');
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser({
        identifier: identifier.trim(),
        password: password.trim(),
      });

      setLoading(false);
      // Navigate to Main App on success
      if (Platform.OS === 'web') {
        alert('Success: Login Successful!');
      } else {
        Alert.alert('Success', 'Login Successful!');
      }
      navigation.navigate('MainTabs');
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
          <Text style={styles.label}>Email or Mobile Number</Text>
          <View style={styles.inputContainer}>
            <Mail color="#7A9EA8" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. user@example.com"
              placeholderTextColor="#54717A"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              keyboardType="email-address"
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
              {showPassword ? <EyeOff color="#7A9EA8" size={20} /> : <Eye color="#7A9EA8" size={20} />}
            </TouchableOpacity>
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity 
            style={styles.forgotPasswordContainer} 
            onPress={() => {
              const msg = 'Password reset link will be sent to your registered Email/Mobile.';
              if (Platform.OS === 'web') alert(msg);
              else Alert.alert('Forgot Password', msg);
            }}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
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

        {/* Skip / Guest Link */}
        <TouchableOpacity style={styles.skipButton} onPress={() => navigation.navigate('MainTabs')}>
          <ShieldCheck color="#00BFA5" size={16} />
          <Text style={styles.skipText}>Continue to App</Text>
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
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    color: '#FFFFFF',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 6,
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
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    padding: 12,
  },
  skipText: {
    color: '#00BFA5',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
});
