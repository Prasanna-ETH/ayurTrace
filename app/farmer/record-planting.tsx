import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sprout, MapPin, Camera, Calendar } from 'lucide-react-native';
import { router } from 'expo-router';
import { useData } from '@/providers/data-provider';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const speciesOptions = [
  'Turmeric', 'Ginger', 'Ashwagandha', 'Brahmi', 'Neem', 'Tulsi', 'Aloe Vera', 'Moringa'
];

export default function RecordPlanting() {
  const { createBatch } = useData();
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState({
    species: '',
    seedQuantity: '',
    location: {
      latitude: 0,
      longitude: 0,
      address: 'Getting location...'
    },
    photos: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        // Use default location
        setFormData(prev => ({
          ...prev,
          location: {
            latitude: 12.2958,
            longitude: 76.6394,
            address: 'Mysore, Karnataka (Default - Permission Denied)'
          }
        }));
        setLocationLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      let addressString = `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`;
      
      // Try geocoding with timeout
      try {
        const geocodePromise = Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Geocoding timeout')), 3000)
        );
        
        const address = await Promise.race([geocodePromise, timeoutPromise]) as any[];
        
        if (address && address[0]) {
          const addr = address[0];
          const parts = [addr.street, addr.city, addr.region, addr.country].filter(Boolean);
          if (parts.length > 0) {
            addressString = parts.join(', ');
          }
        }
      } catch (geocodeError) {
        console.log('Geocoding failed, using coordinates:', geocodeError);
        // Keep using coordinates as fallback
      }

      setFormData(prev => ({
        ...prev,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: addressString
        }
      }));
    } catch (error) {
      console.log('Location error:', error);
      // Fallback to default location
      setFormData(prev => ({
        ...prev,
        location: {
          latitude: 12.2958,
          longitude: 76.6394,
          address: 'Mysore, Karnataka (Default - Location Error)'
        }
      }));
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.species || !formData.seedQuantity) {
      if (Platform.OS === 'web') {
        console.log('Missing Information: Please fill in all required fields.');
      } else {
        Alert.alert('Missing Information', 'Please fill in all required fields.');
      }
      return;
    }

    if (formData.location.latitude === 0) {
      if (Platform.OS === 'web') {
        console.log('Location Required: Please get your current location before submitting.');
      } else {
        Alert.alert('Location Required', 'Please get your current location before submitting.');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const batch = await createBatch({
        species: formData.species,
        seedQuantity: parseFloat(formData.seedQuantity),
        plantingDate: new Date().toISOString().split('T')[0],
        location: formData.location,
        photos: formData.photos
      });

      if (batch) {
        if (Platform.OS === 'web') {
          console.log(`Success! Batch ${batch.id} has been created successfully.`);
          router.back();
        } else {
          Alert.alert(
            'Success!', 
            `Batch ${batch.id} has been created successfully.`,
            [{ text: 'OK', onPress: () => router.back() }]
          );
        }
      }
    } catch (error) {
      console.error('Error creating batch:', error);
      if (Platform.OS === 'web') {
        console.log('Error: Failed to create batch. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to create batch. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.backgroundContainer, { backgroundColor: '#f0fdf4' }]}>
      <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={styles.container}>
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}>
        <View style={styles.header}>
          <Sprout size={32} color="#16a34a" />
          <Text style={styles.title}>Record New Planting</Text>
          <Text style={styles.subtitle}>Create a new batch for tracking</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Species Selection</Text>
            <View style={styles.speciesGrid}>
              {speciesOptions.map((species) => (
                <TouchableOpacity
                  key={species}
                  style={[
                    styles.speciesCard,
                    formData.species === species && styles.speciesCardSelected
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, species }))}
                >
                  <Text style={[
                    styles.speciesText,
                    formData.species === species && styles.speciesTextSelected
                  ]}>
                    {species}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seed Quantity (kg)</Text>
            <TextInput
              style={styles.input}
              value={formData.seedQuantity}
              onChangeText={(text) => setFormData(prev => ({ ...prev, seedQuantity: text }))}
              placeholder="Enter seed quantity in kg"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Planting Date</Text>
            <View style={styles.dateCard}>
              <Calendar size={20} color="#16a34a" />
              <Text style={styles.dateText}>{new Date().toLocaleDateString()}</Text>
              <Text style={styles.dateSubtext}>(Today)</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <TouchableOpacity 
              style={styles.locationCard}
              onPress={getCurrentLocation}
              disabled={locationLoading}
            >
              <MapPin size={20} color="#16a34a" />
              <View style={styles.locationInfo}>
                <Text style={styles.locationText}>
                  {locationLoading ? 'Getting location...' : formData.location.address}
                </Text>
                {formData.location.latitude !== 0 && (
                  <Text style={styles.coordinatesText}>
                    {formData.location.latitude.toFixed(6)}, {formData.location.longitude.toFixed(6)}
                  </Text>
                )}
              </View>
              <Text style={styles.refreshText}>Tap to {formData.location.latitude === 0 ? 'get' : 'refresh'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos (Optional)</Text>
            <TouchableOpacity style={styles.photoCard}>
              <Camera size={24} color="#6b7280" />
              <Text style={styles.photoText}>Add photos of planting area</Text>
              <Text style={styles.photoSubtext}>Coming soon</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Creating Batch...' : 'Submit Planting'}
          </Text>
        </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#166534',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  form: {
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  speciesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  speciesCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  speciesCardSelected: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  speciesText: {
    fontSize: 14,
    color: '#374151',
  },
  speciesTextSelected: {
    color: 'white',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  dateSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  locationInfo: {
    flex: 1,
  },
  locationText: {
    fontSize: 16,
    color: '#374151',
  },
  coordinatesText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  refreshText: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '600',
  },
  photoCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  photoText: {
    fontSize: 16,
    color: '#6b7280',
  },
  photoSubtext: {
    fontSize: 12,
    color: '#9ca3af',
  },
  submitButton: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  backgroundContainer: {
    flex: 1,
  },
});