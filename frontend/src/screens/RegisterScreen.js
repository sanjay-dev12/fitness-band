import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { User, Lock, Eye, EyeOff, Activity, ArrowRight, Phone } from 'lucide-react-native';
import { registerUser } from '../services/api';

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    setErrorMessage('');
    if (!fullName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!identifier.trim()) {
      setErrorMessage('Phone Number is required.');
      return;
    }
    if (!password) {
      setErrorMessage('Password is required.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Confirm password does not match password.');
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        fullName: fullName.trim(),
        identifier: identifier.trim(),
        password: password.trim(),
      });

      setLoading(false);
      // Post-Registration Flow -> Navigate to Family Setup Screen
      navigation.navigate('FamilySetup', { userName: fullName.trim() });
    } catch (error) {
      setLoading(false);
      setErrorMessage(error.message || 'Registration failed. Please try again.');
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Hand Band Health Network</Text>
        </View>

        {/* Form Container */}
        <View style={styles.card}>
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Full Name Input */}
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputContainer}>
            <User color="#7A9EA8" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. John Doe"
              placeholderTextColor="#54717A"
              value={fullName}
              onChangeText={(text) => setFullName(text.replace(/[^a-zA-Z\s]/g, ''))}
            />
          </View>



          {/* Identifier Input */}
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputContainer}>
            <Phone color="#7A9EA8" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. +1 555-0199"
              placeholderTextColor="#54717A"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              keyboardType="phone-pad"
            />
          </View>

          {/* Password Input */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <Lock color="#7A9EA8" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Min 6 characters"
              placeholderTextColor="#54717A"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              {showPassword ? <EyeOff color="#00BFA5" size={16} /> : <Eye color="#7A9EA8" size={16} />}
            </TouchableOpacity>
          </View>

          {/* Confirm Password Input */}
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputContainer}>
            <Lock color="#7A9EA8" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Re-enter password"
              placeholderTextColor="#54717A"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
              {showConfirmPassword ? <EyeOff color="#00BFA5" size={16} /> : <Eye color="#7A9EA8" size={16} />}
            </TouchableOpacity>
          </View>

          {/* Create Account Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#001F27" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Create Account</Text>
                <ArrowRight color="#001F27" size={20} />
              </View>
            )}
          </TouchableOpacity>

          {/* Footer Login Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 191, 165, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#00BFA5',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    marginBottom: 16,
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
    marginTop: 20,
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
});
