import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, ArrowRight } from 'lucide-react-native';
import { useAuth } from '@/providers/auth-provider';

export default function OTPScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const { phoneNumber, selectedRole } = useAuth();
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    
    // Simulate OTP verification
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to appropriate signup form based on selected role
      router.push(`/signup/${selectedRole}` as any);
    }, 1500);
  };

  const handleResendOTP = () => {
    setTimer(30);
    Alert.alert('OTP Sent', 'A new OTP has been sent to your phone number');
  };

  return (
    <LinearGradient
      colors={['#f0fdf4', '#dcfce7']}
      style={styles.container}
    >

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Shield size={32} color="#16a34a" />
            </View>
            <Text style={styles.title}>Verify Your Phone</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to {phoneNumber}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={`otp-${index}`}
                  ref={(ref) => { if (ref) inputRefs.current[index] = ref; }}
                  style={[styles.otpInput, digit && styles.otpInputFilled]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleVerifyOTP}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isLoading ? ['#9ca3af', '#6b7280'] : ['#16a34a', '#22c55e']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Verifying...' : 'Verify OTP'}
                </Text>
                {!isLoading && <ArrowRight size={20} color="white" />}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              {timer > 0 ? (
                <Text style={styles.timerText}>Resend OTP in {timer}s</Text>
              ) : (
                <TouchableOpacity onPress={handleResendOTP}>
                  <Text style={styles.resendText}>Resend OTP</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
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
    alignItems: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'white',
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  otpInputFilled: {
    borderColor: '#16a34a',
  },
  button: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
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
  resendContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  resendText: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '600',
  },
});