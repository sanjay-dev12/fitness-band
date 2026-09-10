import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Share,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import {
  Users,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  Share2,
  CheckCircle,
  Copy,
} from 'lucide-react-native';
import { createFamilyApi, joinFamilyByCodeApi, getStoredUser } from '../services/api';
import { useProfile } from '../context/ProfileContext';

export default function FamilySetupScreen({ navigation, route }) {
  const { showToast, addFamilyMemberProfile } = useProfile();
  const storedUser = getStoredUser();
  const userName = route?.params?.userName || storedUser?.fullName || 'Our';

  // Modes: 'select' | 'create' | 'join' | 'created_success' | 'joined_success'
  const [mode, setMode] = useState('select');
  const [familyName, setFamilyName] = useState(`${userName}'s Family`);
  const [inviteCode, setInviteCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [parentName, setParentName] = useState('');

  // -------------------------------------------------------------
  // 1. CREATE FAMILY HANDLER
  // -------------------------------------------------------------
  const handleCreateFamilySubmit = async () => {
    setErrorMessage('');
    if (!familyName.trim()) {
      setErrorMessage('Please enter a family name.');
      return;
    }

    setLoading(true);
    try {
      const response = await createFamilyApi(familyName.trim());
      setLoading(false);
      const code = response.data.inviteCode;
      setInviteCode(code);
      setMode('created_success');

      // Add newly created family profile to profile switcher
      addFamilyMemberProfile(familyName.trim(), 'Family Circle');

      // Trigger custom in-app success toast
      showToast(`🎉 Family invitation ${code} generated!`, 'success');
    } catch (error) {
      setLoading(false);
      setErrorMessage(error.message || 'Failed to create family.');
      showToast(error.message || 'Failed to create family', 'error');
    }
  };

  // -------------------------------------------------------------
  // 2. NATIVE SHARE INVITATION CODE (WhatsApp, SMS, etc.)
  // -------------------------------------------------------------
  const handleShareInvitation = async () => {
    const shareMessage = `Join my Hand Band family.\n\nFamily: ${familyName}\nInvitation Code: ${inviteCode}\n\nOpen Hand Band app and enter this code to connect!`;
    try {
      if (Platform.OS === 'web') {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareMessage);
          showToast('📋 Invitation message copied to clipboard!', 'success');
        } else {
          showToast(`📋 Code: ${inviteCode}`, 'info');
        }
      } else {
        await Share.share({
          message: shareMessage,
          title: 'Hand Band Family Invitation',
        });
      }
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  // -------------------------------------------------------------
  // 3. JOIN FAMILY HANDLER
  // -------------------------------------------------------------
  const handleJoinFamilySubmit = async () => {
    setErrorMessage('');
    if (!joinCode.trim()) {
      setErrorMessage('Please enter an invitation code (e.g. HB-8K29X).');
      return;
    }

    setLoading(true);
    try {
      const response = await joinFamilyByCodeApi(joinCode.trim());
      setLoading(false);
      const parent = response.data.parent?.fullName || 'Family Circle';
      setParentName(parent);
      setMode('joined_success');

      // Add joined family to profile switcher
      addFamilyMemberProfile(parent, 'Parent Circle');
      showToast(`🎉 Connected to ${parent}'s family!`, 'success');
    } catch (error) {
      setLoading(false);
      setErrorMessage(error.message || 'Invalid invitation code.');
      showToast(error.message || 'Invalid invitation code', 'error');
    }
  };

  // -------------------------------------------------------------
  // 4. SKIP FOR NOW
  // -------------------------------------------------------------
  const handleSkip = () => {
    navigation.navigate('MainTabs');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* MODE: SELECT (WELCOME OPTIONS) */}
        {mode === 'select' && (
          <View style={styles.contentBox}>
            <View style={styles.badgeContainer}>
              <HeartHandshake color="#00BFA5" size={40} />
            </View>

            <Text style={styles.welcomeTitle}>Welcome to Hand Band</Text>
            <Text style={styles.userNameText}>Connect with your family</Text>
            <Text style={styles.descriptionText}>
              Keep your family members connected, safe, and active together. Choose how you'd like to get started:
            </Text>

            <View style={styles.optionsContainer}>
              {/* Option A: Create Family */}
              <TouchableOpacity style={styles.optionCardPrimary} onPress={() => setMode('create')}>
                <View style={styles.iconCirclePrimary}>
                  <Users color="#001F27" size={24} />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitlePrimary}>Create Family</Text>
                  <Text style={styles.optionSubtitlePrimary}>
                    Set up a family group and invite members with a unique code.
                  </Text>
                </View>
                <ArrowRight color="#001F27" size={20} />
              </TouchableOpacity>

              {/* Option B: Join Family */}
              <TouchableOpacity style={styles.optionCardSecondary} onPress={() => setMode('join')}>
                <View style={styles.iconCircleSecondary}>
                  <UserPlus color="#00BFA5" size={24} />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitleSecondary}>Join Family</Text>
                  <Text style={styles.optionSubtitleSecondary}>
                    Enter an invitation code received from a family member.
                  </Text>
                </View>
                <ArrowRight color="#7A9EA8" size={20} />
              </TouchableOpacity>

              {/* Option C: Skip for Now */}
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <ShieldCheck color="#00BFA5" size={18} />
                <Text style={styles.skipText}>Skip for Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* MODE: CREATE FAMILY INPUT */}
        {mode === 'create' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create a Family</Text>
            <Text style={styles.cardSubtitle}>
              Give your family circle a name to generate an invitation code.
            </Text>

            {errorMessage ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Family Name</Text>
            <View style={styles.inputContainer}>
              <Users color="#7A9EA8" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Kumar Family"
                placeholderTextColor="#54717A"
                value={familyName}
                onChangeText={setFamilyName}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleCreateFamilySubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#001F27" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>Generate Invitation</Text>
                  <ArrowRight color="#001F27" size={20} />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={() => setMode('select')}>
              <Text style={styles.backText}>Back to options</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* MODE: CREATED SUCCESS (SHOW CODE & NATIVE SHARE) */}
        {mode === 'created_success' && (
          <View style={styles.card}>
            <View style={styles.successIconCircle}>
              <CheckCircle color="#00BFA5" size={36} />
            </View>

            <Text style={styles.successTitle}>Family Created!</Text>
            <Text style={styles.cardSubtitle}>{familyName}</Text>

            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>INVITATION CODE</Text>
              <Text style={styles.codeValue}>{inviteCode}</Text>
            </View>

            {/* Native Share Button */}
            <TouchableOpacity style={styles.button} onPress={handleShareInvitation}>
              <View style={styles.buttonContent}>
                <Share2 color="#001F27" size={20} style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>Share Invitation</Text>
              </View>
            </TouchableOpacity>

            {/* Proceed to App */}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('MainTabs', { screen: 'Family' })}
            >
              <Text style={styles.secondaryButtonText}>Proceed to App</Text>
              <ArrowRight color="#00BFA5" size={18} />
            </TouchableOpacity>
          </View>
        )}

        {/* MODE: JOIN FAMILY INPUT */}
        {mode === 'join' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Join Family</Text>
            <Text style={styles.cardSubtitle}>
              Enter the invitation code provided by your family member.
            </Text>

            {errorMessage ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Invitation Code</Text>
            <View style={styles.inputContainer}>
              <UserPlus color="#7A9EA8" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. HB-8K29X"
                placeholderTextColor="#54717A"
                value={joinCode}
                onChangeText={(val) => setJoinCode(val.toUpperCase())}
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleJoinFamilySubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#001F27" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>Join Family</Text>
                  <ArrowRight color="#001F27" size={20} />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={() => setMode('select')}>
              <Text style={styles.backText}>Back to options</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* MODE: JOINED SUCCESS */}
        {mode === 'joined_success' && (
          <View style={styles.card}>
            <View style={styles.successIconCircle}>
              <CheckCircle color="#00BFA5" size={36} />
            </View>

            <Text style={styles.successTitle}>Successfully Joined Family!</Text>
            <Text style={styles.cardSubtitle}>
              You are now connected with {parentName}.
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('MainTabs', { screen: 'Family' })}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Go to Family Dashboard</Text>
                <ArrowRight color="#001F27" size={20} />
              </View>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </View>
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
    alignItems: 'center',
    padding: 24,
  },
  contentBox: {
    width: '100%',
    alignItems: 'center',
  },
  badgeContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 191, 165, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#00BFA5',
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  userNameText: {
    fontSize: 16,
    color: '#00BFA5',
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#7A9EA8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    maxWidth: 320,
  },
  optionsContainer: {
    width: '100%',
    gap: 16,
  },
  optionCardPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00BFA5',
    borderRadius: 16,
    padding: 20,
  },
  iconCirclePrimary: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 31, 39, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  optionTitlePrimary: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#001F27',
  },
  optionSubtitlePrimary: {
    fontSize: 12,
    color: 'rgba(0, 31, 39, 0.8)',
    marginTop: 4,
  },
  optionCardSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#002B36',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.3)',
  },
  iconCircleSecondary: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 191, 165, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionTitleSecondary: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  optionSubtitleSecondary: {
    fontSize: 12,
    color: '#7A9EA8',
    marginTop: 4,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 8,
    gap: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#00BFA5',
    fontWeight: '600',
  },

  /* CARD FOR CREATION / JOINING */
  card: {
    width: '100%',
    backgroundColor: '#002B36',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.2)',
    alignItems: 'stretch',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#7A9EA8',
    marginBottom: 20,
    lineHeight: 18,
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
    outlineStyle: 'none',
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
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#00BFA5',
    fontSize: 15,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 16,
    padding: 8,
  },
  backText: {
    color: '#7A9EA8',
    fontSize: 14,
  },

  /* CODE SUCCESS DISPLAY */
  successIconCircle: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 191, 165, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  codeBox: {
    backgroundColor: '#001F27',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00BFA5',
    padding: 20,
    alignItems: 'center',
    marginVertical: 16,
  },
  codeLabel: {
    color: '#7A9EA8',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  codeValue: {
    color: '#00BFA5',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
});
