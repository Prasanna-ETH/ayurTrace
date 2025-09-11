import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Building2 } from 'lucide-react-native';
import FormField from '@/components/form-field';
import FileUpload from '@/components/file-upload';
import LocationPicker from '@/components/location-picker';
import { useAuth } from '@/providers/auth-provider';

interface ManufacturerData {
  companyName: string;
  gmpLicenseNumber: string;
  contactPerson: string;
  email: string;
  plantAddress: { latitude: number; longitude: number; address: string } | null;
  gmpCertificate: any;
  productList: any;
}

export default function ManufacturerSignupScreen() {
  const { phoneNumber, authenticate } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ManufacturerData>({
    companyName: '',
    gmpLicenseNumber: '',
    contactPerson: '',
    email: '',
    plantAddress: null,
    gmpCertificate: null,
    productList: null,
  });
  const [errors, setErrors] = useState<Partial<ManufacturerData>>({});

  const validateForm = () => {
    const newErrors: Partial<ManufacturerData> = {};

    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.gmpLicenseNumber.trim()) newErrors.gmpLicenseNumber = 'GMP License number is required';
    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.plantAddress) newErrors.plantAddress = 'Plant address is required' as any;
    if (!formData.gmpCertificate) newErrors.gmpCertificate = 'GMP Certificate is required' as any;
    if (!formData.productList) newErrors.productList = 'Product list is required' as any;

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
        role: 'manufacturer',
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
              <Building2 size={32} color="#1d4ed8" />
            </View>
            <Text style={styles.title}>Manufacturer Registration</Text>
            <Text style={styles.subtitle}>Complete your profile to get started</Text>
          </View>

          <View style={styles.form}>
            <FormField
              label="Company Name"
              value={formData.companyName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, companyName: text }))}
              error={errors.companyName}
              required
              placeholder="Enter company name"
            />

            <FormField
              label="GMP License Number"
              value={formData.gmpLicenseNumber}
              onChangeText={(text) => setFormData(prev => ({ ...prev, gmpLicenseNumber: text }))}
              error={errors.gmpLicenseNumber}
              required
              placeholder="Enter GMP license number"
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
              label="Plant Address (GPS)"
              onLocationSelect={(location) => setFormData(prev => ({ ...prev, plantAddress: location }))}
              selectedLocation={formData.plantAddress}
              required
            />

            <FileUpload
              label="GMP Certificate"
              onFileSelect={(file) => setFormData(prev => ({ ...prev, gmpCertificate: file }))}
              selectedFile={formData.gmpCertificate}
              required
              accept="documents"
            />

            <FileUpload
              label="Product List"
              onFileSelect={(file) => setFormData(prev => ({ ...prev, productList: file }))}
              selectedFile={formData.productList}
              required
              accept="documents"
            />

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isLoading ? ['#9ca3af', '#6b7280'] : ['#1d4ed8', '#3b82f6']}
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
    backgroundColor: 'rgba(29, 78, 216, 0.1)',
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