import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tractor } from 'lucide-react-native';
import FormField from '@/components/form-field';
import FileUpload from '@/components/file-upload';
import LocationPicker from '@/components/location-picker';
import { useAuth } from '@/providers/auth-provider';

interface FarmerData {
  fullName: string;
  email: string;
  dateOfBirth: string;
  age: string;
  nmpbLicense: string;
  preferredLanguage: string;
  location: { latitude: number; longitude: number; address: string } | null;
  gacpCertificate: any;
  cultivationLicense: any;
}

export default function FarmerSignupScreen() {
  const { phoneNumber, authenticate } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FarmerData>({
    fullName: '',
    email: '',
    dateOfBirth: '',
    age: '',
    nmpbLicense: '',
    preferredLanguage: '',
    location: null,
    gacpCertificate: null,
    cultivationLicense: null,
  });
  const [errors, setErrors] = useState<Partial<FarmerData>>({});

  const validateForm = () => {
    const newErrors: Partial<FarmerData> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.dateOfBirth.trim()) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.nmpbLicense.trim()) newErrors.nmpbLicense = 'NMPB License is required';
    if (!formData.preferredLanguage.trim()) newErrors.preferredLanguage = 'Preferred language is required';
    if (!formData.location) newErrors.location = 'Location is required' as any;
    if (!formData.gacpCertificate) newErrors.gacpCertificate = 'GACP Training Certificate is required' as any;
    if (!formData.cultivationLicense) newErrors.cultivationLicense = 'Cultivation License is required' as any;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    // Simulate profile creation
    setTimeout(() => {
      const profile = {
        role: 'farmer',
        phoneNumber,
        ...formData,
        createdAt: new Date().toISOString(),
      };

      authenticate(profile);
      setIsLoading(false);
      router.replace('/(tabs)/home');
    }, 2000);
  };

  return (
    <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={styles.container}>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Tractor size={32} color="#16a34a" />
            </View>
            <Text style={styles.title}>Farmer Registration</Text>
            <Text style={styles.subtitle}>Complete your profile to get started</Text>
          </View>

          <View style={styles.form}>
            <FormField
              label="Full Name"
              value={formData.fullName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
              error={errors.fullName}
              required
              placeholder="Enter your full name"
            />

            <FormField
              label="Email"
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              error={errors.email}
              required
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <FormField
              label="Date of Birth"
              value={formData.dateOfBirth}
              onChangeText={(text) => setFormData(prev => ({ ...prev, dateOfBirth: text }))}
              error={errors.dateOfBirth}
              required
              placeholder="DD/MM/YYYY"
            />

            <FormField
              label="Age"
              value={formData.age}
              onChangeText={(text) => setFormData(prev => ({ ...prev, age: text }))}
              placeholder="Enter your age"
              keyboardType="numeric"
            />

            <LocationPicker
              label="Location"
              onLocationSelect={(location) => setFormData(prev => ({ ...prev, location }))}
              selectedLocation={formData.location}
              required
            />

            <FormField
              label="NMPB License Number"
              value={formData.nmpbLicense}
              onChangeText={(text) => setFormData(prev => ({ ...prev, nmpbLicense: text }))}
              error={errors.nmpbLicense}
              required
              placeholder="Enter NMPB license number"
            />

            <FileUpload
              label="GACP Training Certificate"
              onFileSelect={(file) => setFormData(prev => ({ ...prev, gacpCertificate: file }))}
              selectedFile={formData.gacpCertificate}
              required
              accept="documents"
            />

            <FileUpload
              label="Cultivation License"
              onFileSelect={(file) => setFormData(prev => ({ ...prev, cultivationLicense: file }))}
              selectedFile={formData.cultivationLicense}
              required
              accept="documents"
            />

            <FormField
              label="Preferred Language"
              value={formData.preferredLanguage}
              onChangeText={(text) => setFormData(prev => ({ ...prev, preferredLanguage: text }))}
              error={errors.preferredLanguage}
              required
              placeholder="e.g., English, Hindi, Regional language"
            />

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isLoading ? ['#9ca3af', '#6b7280'] : ['#16a34a', '#22c55e']}
                style={styles.submitButtonGradient}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Creating Profile...' : 'Complete Registration'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>

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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#16a34a',
    textAlign: 'center',
  },
  form: {
    gap: 4,
  },
  submitButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});