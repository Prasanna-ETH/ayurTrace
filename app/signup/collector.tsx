import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Truck } from 'lucide-react-native';
import FormField from '@/components/form-field';
import FileUpload from '@/components/file-upload';
import { useAuth } from '@/providers/auth-provider';

interface CollectorData {
  fullName: string;
  email: string;
  companyName: string;
  collectorLicense: string;
  serviceArea: string;
  bankAccount: string;
  kycDocuments: any;
}

export default function CollectorSignupScreen() {
  const { phoneNumber, authenticate } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CollectorData>({
    fullName: '',
    email: '',
    companyName: '',
    collectorLicense: '',
    serviceArea: '',
    bankAccount: '',
    kycDocuments: null,
  });
  const [errors, setErrors] = useState<Partial<CollectorData>>({});

  const validateForm = () => {
    const newErrors: Partial<CollectorData> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.collectorLicense.trim()) newErrors.collectorLicense = 'Collector license is required';
    if (!formData.serviceArea.trim()) newErrors.serviceArea = 'Service area is required';
    if (!formData.bankAccount.trim()) newErrors.bankAccount = 'Bank account details are required';
    if (!formData.kycDocuments) newErrors.kycDocuments = 'KYC documents are required' as any;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const profile = {
        role: 'collector',
        phoneNumber,
        ...formData,
        createdAt: new Date().toISOString(),
      };

      authenticate(profile);
      setIsLoading(false);
      router.replace('/(tabs)');
    }, 2000);
  };

  return (
    <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Truck size={32} color="#059669" />
            </View>
            <Text style={styles.title}>Collector Registration</Text>
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
              label="Company Name"
              value={formData.companyName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, companyName: text }))}
              error={errors.companyName}
              required
              placeholder="Enter company name"
            />

            <FormField
              label="Collector License Number"
              value={formData.collectorLicense}
              onChangeText={(text) => setFormData(prev => ({ ...prev, collectorLicense: text }))}
              error={errors.collectorLicense}
              required
              placeholder="Enter collector license number"
            />

            <FormField
              label="Service Area"
              value={formData.serviceArea}
              onChangeText={(text) => setFormData(prev => ({ ...prev, serviceArea: text }))}
              error={errors.serviceArea}
              required
              placeholder="Enter service area coverage"
              multiline
            />

            <FormField
              label="Bank Account Details"
              value={formData.bankAccount}
              onChangeText={(text) => setFormData(prev => ({ ...prev, bankAccount: text }))}
              error={errors.bankAccount}
              required
              placeholder="Enter bank account details"
              multiline
            />

            <FileUpload
              label="KYC Documents"
              onFileSelect={(file) => setFormData(prev => ({ ...prev, kycDocuments: file }))}
              selectedFile={formData.kycDocuments}
              required
              accept="documents"
            />

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isLoading ? ['#9ca3af', '#6b7280'] : ['#059669', '#10b981']}
                style={styles.submitButtonGradient}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Creating Profile...' : 'Complete Registration'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
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
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
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