import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Platform } from 'react-native';
import { MapPin, Navigation } from 'lucide-react-native';
import * as Location from 'expo-location';
import FormField from './form-field';

interface LocationPickerProps {
  label: string;
  onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void;
  selectedLocation?: { latitude: number; longitude: number; address: string };
  required?: boolean;
}

export default function LocationPicker({ 
  label, 
  onLocationSelect, 
  selectedLocation, 
  required 
}: LocationPickerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [manualAddress, setManualAddress] = useState(selectedLocation?.address || '');

  const getCurrentLocation = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'GPS location is not available on web. Please enter address manually.');
      return;
    }

    setIsLoading(true);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to get your current location');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const formattedAddress = address[0] 
        ? `${address[0].street || ''} ${address[0].city || ''} ${address[0].region || ''} ${address[0].postalCode || ''}`.trim()
        : `${location.coords.latitude}, ${location.coords.longitude}`;

      const locationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: formattedAddress,
      };

      setManualAddress(formattedAddress);
      onLocationSelect(locationData);
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualAddressChange = (address: string) => {
    setManualAddress(address);
    if (address.trim()) {
      onLocationSelect({
        latitude: 0,
        longitude: 0,
        address: address.trim(),
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      <View style={styles.locationContainer}>
        <FormField
          label=""
          placeholder="Enter address manually"
          value={manualAddress}
          onChangeText={handleManualAddressChange}
          multiline
          style={styles.addressInput}
        />
        
        <TouchableOpacity 
          style={styles.gpsButton} 
          onPress={getCurrentLocation}
          disabled={isLoading}
        >
          {isLoading ? (
            <Navigation size={20} color="#16a34a" />
          ) : (
            <MapPin size={20} color="#16a34a" />
          )}
          <Text style={styles.gpsButtonText}>
            {isLoading ? 'Getting Location...' : 'Use GPS'}
          </Text>
        </TouchableOpacity>
      </View>

      {selectedLocation && selectedLocation.latitude !== 0 && (
        <Text style={styles.coordinates}>
          GPS: {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  required: {
    color: '#ef4444',
  },
  locationContainer: {
    gap: 8,
  },
  addressInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  gpsButton: {
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  gpsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  coordinates: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
});