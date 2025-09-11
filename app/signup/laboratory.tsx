import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlaskConical } from 'lucide-react-native';
import FormField from '@/components/form-field';
import FileUpload from '@/components/file-upload';
import LocationPicker from '@/components/location-picker';
import { useAuth } from '@/providers/auth-provider';

interface LaboratoryData {
  labName: string;
  accreditationNumber: string;
  contactPerson: string;
  email: string;
  location: { latitude: number; longitude: number; address: string } | null;
  accreditationCertificate: any;
  testMethods: any;
}

export default function LaboratorySignupScreen() {
  const { phoneNumber, authenticate } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LaboratoryData>({
    labName: '',
    accreditationNumber: '',
    contactPerson: '',
    email: '',
    location: null,
    accreditationCertificate: null,
    testMethods: null,
  });
  const [errors, setErrors] = useState<Partial<LaboratoryData>>({});

  const validateForm = () => {
    const newErrors: Partial<LaboratoryData> = {};

    if (!formData.labName.trim()) newErrors.labName = 'Lab name is required';
    if (!formData.accreditationNumber.trim()) newErrors.accreditationNumber = 'Accreditation number is required';
    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.location) newErrors.location = 'Location is required' as any;
    if (!formData.accreditationCertificate) newErrors.accreditationCertificate = 'Accreditation certificate is required' as any;
    if (!formData.testMethods) newErrors.testMethods = 'Test methods document is required' as any;

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
        role: 'laboratory',
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
              <FlaskConical size={32} color="#0891b2" />
            </View>
            <Text style={styles.title}>Laboratory Registration</Text>
            <Text style={styles.subtitle}>Complete your profile to get started</Text>
          </View>

          <View style={styles.form}>
            <FormField
              label="Laboratory Name"
              value={formData.labName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, labName: text }))}
              error={errors.labName}
              required
              placeholder="Enter laboratory name"
            />

            <FormField
              label="Accreditation Number"
              value={formData.accreditationNumber}
              onChangeText={(text) => setFormData(prev => ({ ...prev, accreditationNumber: text }))}
              error={errors.accreditationNumber}
              required
              placeholder="Enter accreditation number"
            />

            <FormField
              label="Contact Person"
              value={formData.contactPerson}
              onChangeText={(text) => setFormData(prev => ({ ...prev, contactPerson: text }))}
              error={errors.contactPerson}
              required
              placeholder="Enter contact person name"
            />

            <FormField
              label="Email"
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              error={errors.email}
              required
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <LocationPicker
              label="GPS Address"
              onLocationSelect={(location) => setFormData(prev => ({ ...prev, location }))}
              selectedLocation={formData.location}
              required
            />

            <FileUpload
              label="Accreditation Certificate"
              onFileSelect={(file) => setFormData(prev => ({ ...prev, accreditationCertificate: file }))}
              selectedFile={formData.accreditationCertificate}
              required
              accept="documents"
            />

            <FileUpload
              label="Test Methods Document"
              onFileSelect={(file) => setFormData(prev => ({ ...prev, testMethods: file }))}
              selectedFile={formData.testMethods}
              required
              accept="documents"
            />

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isLoading ? ['#9ca3af', '#6b7280'] : ['#0891b2', '#0ea5e9']}
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
    backgroundColor: 'rgba(8, 145, 178, 0.1)',
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