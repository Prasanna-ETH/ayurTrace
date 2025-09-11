import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Factory } from 'lucide-react-native';
import FormField from '@/components/form-field';
import FileUpload from '@/components/file-upload';
import LocationPicker from '@/components/location-picker';
import { useAuth } from '@/providers/auth-provider';

interface FacilityData {
  facilityName: string;
  licenseNumber: string;
  contactPerson: string;
  email: string;
  location: { latitude: number; longitude: number; address: string } | null;
  processingLicense: any;
  layoutDiagram: any;
  equipmentList: string;
}

export default function FacilitySignupScreen() {
  const { phoneNumber, authenticate } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FacilityData>({
    facilityName: '',
    licenseNumber: '',
    contactPerson: '',
    email: '',
    location: null,
    processingLicense: null,
    layoutDiagram: null,
    equipmentList: '',
  });
  const [errors, setErrors] = useState<Partial<FacilityData>>({});

  const validateForm = () => {
    const newErrors: Partial<FacilityData> = {};

    if (!formData.facilityName.trim()) newErrors.facilityName = 'Facility name is required';
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.location) newErrors.location = 'Location is required' as any;
    if (!formData.processingLicense) newErrors.processingLicense = 'Processing license is required' as any;
    if (!formData.layoutDiagram) newErrors.layoutDiagram = 'Layout diagram is required' as any;
    if (!formData.equipmentList.trim()) newErrors.equipmentList = 'Equipment list is required';

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
        role: 'facility',
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
              <Factory size={32} color="#0d9488" />
            </View>
            <Text style={styles.title}>Processing Facility Registration</Text>
            <Text style={styles.subtitle}>Complete your profile to get started</Text>
          </View>

          <View style={styles.form}>
            <FormField
              label="Facility Name"
              value={formData.facilityName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, facilityName: text }))}
              error={errors.facilityName}
              required
              placeholder="Enter facility name"
            />

            <FormField
              label="License Number"
              value={formData.licenseNumber}
              onChangeText={(text) => setFormData(prev => ({ ...prev, licenseNumber: text }))}
              error={errors.licenseNumber}
              required
              placeholder="Enter license number"
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
              selectedLocation={formData.location || undefined}
              required
            />

            <FileUpload
              label="Processing License"
              onFileSelect={(file) => setFormData(prev => ({ ...prev, processingLicense: file }))}
              selectedFile={formData.processingLicense}
              required
              accept="documents"
            />

            <FileUpload
              label="Layout Diagram"
              onFileSelect={(file) => setFormData(prev => ({ ...prev, layoutDiagram: file }))}
              selectedFile={formData.layoutDiagram}
              required
              accept="images"
            />

            <FormField
              label="Equipment List"
              value={formData.equipmentList}
              onChangeText={(text) => setFormData(prev => ({ ...prev, equipmentList: text }))}
              error={errors.equipmentList}
              required
              placeholder="List all processing equipment"
              multiline
              style={styles.multilineInput}
            />

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isLoading ? ['#9ca3af', '#6b7280'] : ['#0d9488', '#14b8a6']}
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
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 4,
    textAlign: 'center',
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
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});