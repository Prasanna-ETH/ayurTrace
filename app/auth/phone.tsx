import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Phone, ArrowRight } from 'lucide-react-native';
import { useAuth } from '@/providers/auth-provider';

export default function PhoneAuthScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setPhoneNumber: savePhoneNumber } = useAuth();

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    
    // Simulate OTP sending
    setTimeout(() => {
      savePhoneNumber(phoneNumber);
      setIsLoading(false);
      router.push('/auth/otp');
    }, 1500);
  };

  return (
    <LinearGradient
      colors={['#f0fdf4', '#dcfce7']}
      style={styles.container}
    >

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Phone size={32} color="#16a34a" />
            </View>
            <Text style={styles.title}>Enter Your Phone Number</Text>
            <Text style={styles.subtitle}>
              We&apos;ll send you a verification code to confirm your identity
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={10}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSendOTP}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isLoading ? ['#9ca3af', '#6b7280'] : ['#16a34a', '#22c55e']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </Text>
                {!isLoading && <ArrowRight size={20} color="white" />}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#16a34a',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginRight: 12,
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    paddingVertical: 16,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  disclaimer: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
});