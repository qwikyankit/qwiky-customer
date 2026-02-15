import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Toast from '../components/Toast';
import { getToken, setToken, resetToken } from '../services/api';

export default function Settings() {
  const router = useRouter();
  const [tokenInput, setTokenInput] = useState('');
  const [currentToken, setCurrentToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as const });

  useEffect(() => {
    loadCurrentToken();
  }, []);

  const loadCurrentToken = async () => {
    const token = await getToken();
    setCurrentToken(token);
    setTokenInput(token);
  };

  const handleSaveToken = async () => {
    if (!tokenInput.trim()) {
      showToast('Please enter a valid token', 'error');
      return;
    }

    try {
      setLoading(true);
      await setToken(tokenInput.trim());
      setCurrentToken(tokenInput.trim());
      showToast('Token saved successfully!', 'success');
    } catch (err) {
      showToast('Failed to save token', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetToken = () => {
    Alert.alert(
      'Reset Token',
      'Are you sure you want to reset to the default token?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetToken();
              await loadCurrentToken();
              showToast('Token reset to default', 'success');
            } catch (err) {
              showToast('Failed to reset token', 'error');
            }
          },
        },
      ]
    );
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ visible: true, message, type });
  };

  const maskToken = (token: string) => {
    if (!token) return '';
    if (token.length <= 20) return token;
    return `${token.substring(0, 20)}...${token.substring(token.length - 10)}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Token Management Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="key-outline" size={22} color="#1E88E5" />
              <Text style={styles.sectionTitle}>API Token</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Current Token</Text>
              <Text style={styles.infoValue} numberOfLines={2}>
                {maskToken(currentToken)}
              </Text>
            </View>

            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>Update Token</Text>
              <Text style={styles.inputDescription}>
                Paste your new Bearer token below when the current one expires.
              </Text>
              <TextInput
                style={styles.tokenInput}
                placeholder="Paste your Bearer token here..."
                placeholderTextColor="#999"
                value={tokenInput}
                onChangeText={setTokenInput}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.resetButton]}
                  onPress={handleResetToken}
                >
                  <Ionicons name="refresh" size={18} color="#666" />
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSaveToken}
                  disabled={loading}
                >
                  <Ionicons name="checkmark" size={18} color="#FFF" />
                  <Text style={styles.saveButtonText}>
                    {loading ? 'Saving...' : 'Save Token'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* App Info Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle-outline" size={22} color="#1E88E5" />
              <Text style={styles.sectionTitle}>About</Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.aboutRow}>
                <Text style={styles.aboutLabel}>App Name</Text>
                <Text style={styles.aboutValue}>Qwiky Admin</Text>
              </View>
              <View style={styles.aboutRow}>
                <Text style={styles.aboutLabel}>Version</Text>
                <Text style={styles.aboutValue}>1.0.0</Text>
              </View>
              <View style={styles.aboutRow}>
                <Text style={styles.aboutLabel}>Purpose</Text>
                <Text style={styles.aboutValue}>Internal Booking Management</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    marginLeft: 10,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 13,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  inputCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  inputDescription: {
    fontSize: 13,
    color: '#888',
    marginBottom: 12,
    lineHeight: 18,
  },
  tokenInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    fontSize: 13,
    color: '#333',
    minHeight: 100,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  resetButton: {
    backgroundColor: '#F5F5F5',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#1E88E5',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  aboutLabel: {
    fontSize: 14,
    color: '#666',
  },
  aboutValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});
