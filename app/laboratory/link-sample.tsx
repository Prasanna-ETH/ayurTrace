import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { QrCode, FlaskConical, Camera, Package, Building2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { useData } from '@/providers/data-provider';

export default function LinkSample() {
  const { processingLots, linkSampleToLab } = useData();
  const [qrData, setQrData] = useState('');
  const [sampleId, setSampleId] = useState('');
  const [facilityId, setFacilityId] = useState('');
  const [sampleWeight, setSampleWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleScanQR = () => {
    // Simulate QR code scanning - use an existing sample ID that would have been created by facility
    // In real implementation, this would scan an actual QR code with the facility-generated sample ID
    const existingProcessingLot = processingLots.find(lot => lot.status === 'lab-testing' && lot.labSampleId);
    
    const mockQRData = {
      sampleId: existingProcessingLot?.labSampleId || 'LAB-SAMPLE-001', // Use actual existing sample ID
      facilityId: existingProcessingLot?.facilityId || 'facility-1',
      facilityName: existingProcessingLot?.facilityName || 'Green Valley Processing',
      processingLotId: existingProcessingLot?.id || 'PL-GVP-001-20250925',
      species: existingProcessingLot?.species || 'Turmeric',
      submissionDate: new Date().toISOString()
    };
    
    setQrData(JSON.stringify(mockQRData, null, 2));
    setSampleId(mockQRData.sampleId);
    setFacilityId(mockQRData.facilityId);
    Alert.alert('QR Code Scanned', 'Sample information has been retrieved from QR code');
  };

  const handleTakePhoto = () => {
    // Simulate photo capture
    const photoUrl = `https://picsum.photos/400/300?random=${Date.now()}`;
    setPhotos(prev => [...prev, photoUrl]);
    Alert.alert('Photo Captured', 'Sample photo has been captured successfully');
  };

  const handleSubmit = async () => {
    if (!sampleId.trim()) {
      Alert.alert('Missing Sample ID', 'Please scan QR code or enter sample ID.');
      return;
    }

    if (!sampleWeight || parseFloat(sampleWeight) <= 0) {
      Alert.alert('Invalid Weight', 'Please enter a valid sample weight.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Use the linkSampleToLab function from data provider
      // Pass the scanned sampleId directly (don't generate new ID)
      const processingLotId = qrData ? JSON.parse(qrData).processingLotId : '';
      
      await linkSampleToLab(
        sampleId.trim(), // Use the scanned sampleId directly
        facilityId.trim(),
        processingLotId,
        parseFloat(sampleWeight),
        notes.trim(),
        photos
      );

      Alert.alert(
        'Success!', 
        `Sample ${sampleId} has been linked to the laboratory successfully.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error linking sample:', error);
      Alert.alert('Error', 'Failed to link sample. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Link Sample</Text>
          <Text style={styles.subtitle}>Scan QR code to receive sample for testing</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scan Sample QR Code</Text>
          
          <TouchableOpacity style={styles.qrButton} onPress={handleScanQR}>
            <QrCode size={24} color="#16a34a" />
            <Text style={styles.qrButtonText}>Scan QR Code</Text>
          </TouchableOpacity>

          {qrData && (
            <View style={styles.qrDataContainer}>
              <Text style={styles.qrDataTitle}>Scanned Information:</Text>
              <View style={styles.qrDataCard}>
                <Text style={styles.qrDataText}>{qrData}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sample Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Sample ID</Text>
            <TextInput
              style={styles.input}
              value={sampleId}
              onChangeText={setSampleId}
              placeholder="Enter sample ID or scan QR code"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Facility ID</Text>
            <TextInput
              style={styles.input}
              value={facilityId}
              onChangeText={setFacilityId}
              placeholder="Enter facility ID"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Sample Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={sampleWeight}
              onChangeText={setSampleWeight}
              placeholder="0.5"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Receiving Notes</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Enter any notes about sample condition..."
              multiline
              numberOfLines={3}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.photoSection}>
            <Text style={styles.inputLabel}>Sample Photos</Text>
            <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
              <Camera size={24} color="#16a34a" />
              <Text style={styles.photoButtonText}>Take Photo</Text>
            </TouchableOpacity>
            {photos.length > 0 && (
              <Text style={styles.photoCount}>{photos.length} photo(s) captured</Text>
            )}
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <FlaskConical size={24} color="#3b82f6" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Sample Testing Protocol</Text>
              <Text style={styles.infoText}>
                Once linked, samples will be queued for standard testing including moisture content, 
                pesticide residue, heavy metals, and DNA authentication.
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Linking...' : 'Link Sample to Lab'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
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
    marginTop: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 16,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 20,
    gap: 12,
    borderWidth: 2,
    borderColor: '#16a34a',
    borderStyle: 'dashed',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  qrButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#16a34a',
  },
  qrDataContainer: {
    marginTop: 16,
  },
  qrDataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  qrDataCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  qrDataText: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  photoSection: {
    marginBottom: 16,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: '#16a34a',
    borderStyle: 'dashed',
  },
  photoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16a34a',
  },
  photoCount: {
    fontSize: 14,
    color: '#10b981',
    marginTop: 8,
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
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
});