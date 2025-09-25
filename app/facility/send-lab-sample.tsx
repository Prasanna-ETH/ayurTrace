import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FlaskConical, Package, QrCode, Camera, Building2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { useData, ProcessingLot } from '@/providers/data-provider';

const testTypes = [
  { id: 'moisture', label: 'Moisture Content', required: true },
  { id: 'pesticides', label: 'Pesticide Residue', required: true },
  { id: 'heavyMetals', label: 'Heavy Metals', required: true },
  { id: 'dnaAuth', label: 'DNA Authentication', required: false },
  { id: 'microbiological', label: 'Microbiological', required: false },
];

const laboratories = [
  { id: 'lab-001', name: 'Central Herbal Testing Lab', location: 'Bangalore', accreditation: 'NABL-001' },
  { id: 'lab-002', name: 'Ayurveda Quality Lab', location: 'Mysore', accreditation: 'NABL-002' },
  { id: 'lab-003', name: 'Herbal Research Institute', location: 'Chennai', accreditation: 'NABL-003' },
];

export default function SendLabSample() {
  const { processingLots, sendSampleToLab } = useData();
  const [selectedLot, setSelectedLot] = useState<ProcessingLot | null>(null);
  const [selectedLab, setSelectedLab] = useState('');
  const [selectedTests, setSelectedTests] = useState<string[]>(['moisture', 'pesticides', 'heavyMetals']);
  const [sampleWeight, setSampleWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const readyLots = processingLots.filter(lot => 
    lot.status === 'processing' || lot.status === 'completed'
  );

  const handleTestToggle = (testId: string) => {
    const test = testTypes.find(t => t.id === testId);
    if (test?.required) return; // Don't allow toggling required tests

    setSelectedTests(prev => 
      prev.includes(testId) 
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    );
  };

  const handleTakePhoto = () => {
    // Simulate photo capture
    const photoUrl = `https://picsum.photos/400/300?random=${Date.now()}`;
    setPhotos(prev => [...prev, photoUrl]);
    Alert.alert('Photo Captured', 'Sample photo has been captured successfully');
  };

  const generateSampleId = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `SAMPLE-${dateStr}-${randomStr}`;
  };

  const handleSubmit = async () => {
    if (!selectedLot) {
      Alert.alert('Missing Selection', 'Please select a processing lot.');
      return;
    }

    if (!selectedLab) {
      Alert.alert('Missing Laboratory', 'Please select a laboratory.');
      return;
    }

    if (!sampleWeight || parseFloat(sampleWeight) <= 0) {
      Alert.alert('Invalid Weight', 'Please enter a valid sample weight.');
      return;
    }

    const weight = parseFloat(sampleWeight);
    if (weight > selectedLot.availableWeight) {
      Alert.alert('Weight Error', 'Sample weight cannot exceed available weight.');
      return;
    }

    setIsSubmitting(true);
    try {
      const sampleId = generateSampleId();
      const labInfo = laboratories.find(lab => lab.id === selectedLab);
      
      await sendSampleToLab(
        selectedLot.id,
        sampleId,
        selectedLab,
        labInfo?.name || 'Unknown Lab',
        weight,
        selectedTests,
        notes.trim(),
        photos
      );

      Alert.alert(
        'Success!', 
        `Sample ${sampleId} sent to ${labInfo?.name} for testing.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error sending sample to lab:', error);
      Alert.alert('Error', 'Failed to send sample to lab. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderLotCard = ({ item }: { item: ProcessingLot }) => (
    <TouchableOpacity
      style={[
        styles.lotCard,
        selectedLot?.id === item.id && styles.lotCardSelected
      ]}
      onPress={() => setSelectedLot(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.lotId}>{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'processing' ? '#3b82f6' : '#10b981' }]}>
          <Text style={styles.statusText}>{item.status === 'processing' ? 'Processing' : 'Completed'}</Text>
        </View>
      </View>

      <Text style={styles.speciesText}>{item.species}</Text>
      <Text style={styles.weightText}>{item.availableWeight} kg available</Text>
      <Text style={styles.stepsText}>{item.processingSteps.length} processing steps</Text>
    </TouchableOpacity>
  );

  const renderLabCard = ({ item }: { item: typeof laboratories[0] }) => (
    <TouchableOpacity
      style={[
        styles.labCard,
        selectedLab === item.id && styles.labCardSelected
      ]}
      onPress={() => setSelectedLab(item.id)}
    >
      <View style={styles.labHeader}>
        <Building2 size={20} color="#16a34a" />
        <Text style={styles.labName}>{item.name}</Text>
      </View>
      <Text style={styles.labLocation}>{item.location}</Text>
      <Text style={styles.labAccreditation}>Accreditation: {item.accreditation}</Text>
    </TouchableOpacity>
  );

  const renderTestItem = ({ item }: { item: typeof testTypes[0] }) => (
    <TouchableOpacity
      style={[
        styles.testItem,
        selectedTests.includes(item.id) && styles.testItemSelected,
        item.required && styles.testItemRequired
      ]}
      onPress={() => handleTestToggle(item.id)}
      disabled={item.required}
    >
      <Text style={[
        styles.testLabel,
        selectedTests.includes(item.id) && styles.testLabelSelected
      ]}>
        {item.label}
        {item.required && ' *'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Send Lab Sample</Text>
          <Text style={styles.subtitle}>Submit samples for quality testing</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Processing Lot</Text>
          {readyLots.length > 0 ? (
            <FlatList
              data={readyLots}
              renderItem={renderLotCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              style={styles.lotList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Package size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No lots ready for testing</Text>
              <Text style={styles.emptyStateSubtext}>Complete processing steps first</Text>
            </View>
          )}
        </View>

        {selectedLot && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Laboratory</Text>
              <FlatList
                data={laboratories}
                renderItem={renderLabCard}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                style={styles.labList}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Test Requirements</Text>
              <FlatList
                data={testTypes}
                renderItem={renderTestItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                style={styles.testList}
              />
              <Text style={styles.helperText}>* Required tests cannot be deselected</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sample Details</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Sample Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={sampleWeight}
                  onChangeText={setSampleWeight}
                  placeholder={`Max: ${selectedLot.availableWeight} kg`}
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Special Instructions</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Enter any special testing instructions..."
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

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Sending...' : 'Send to Laboratory'}
              </Text>
            </TouchableOpacity>
          </>
        )}
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
  lotList: {
    maxHeight: 200,
  },
  lotCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  lotCardSelected: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lotId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  speciesText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 4,
  },
  weightText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  stepsText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  labList: {
    maxHeight: 250,
  },
  labCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  labCardSelected: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  labHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  labName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  labLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  labAccreditation: {
    fontSize: 12,
    color: '#9ca3af',
  },
  testList: {
    maxHeight: 200,
  },
  testItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  testItemSelected: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  testItemRequired: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  testLabel: {
    fontSize: 14,
    color: '#374151',
  },
  testLabelSelected: {
    fontWeight: '600',
    color: '#16a34a',
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 8,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
});