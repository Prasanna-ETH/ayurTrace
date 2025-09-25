import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Thermometer, Clock, Camera, Package, ChevronDown } from 'lucide-react-native';
import { router } from 'expo-router';
import { useData, ProcessingLot } from '@/providers/data-provider';

const processingSteps = [
  { id: 'cleaning', label: 'Cleaning', description: 'Remove impurities and foreign matter' },
  { id: 'sorting', label: 'Sorting', description: 'Grade by size and quality' },
  { id: 'drying', label: 'Drying', description: 'Reduce moisture content' },
  { id: 'grinding', label: 'Grinding', description: 'Process into powder form' },
  { id: 'packaging', label: 'Packaging', description: 'Pack into containers' },
];

export default function RecordProcessing() {
  const { processingLots, addProcessingStep } = useData();
  const [selectedLot, setSelectedLot] = useState<ProcessingLot | null>(null);
  const [selectedStep, setSelectedStep] = useState('');
  const [formData, setFormData] = useState({
    notes: '',
    temperature: '',
    duration: '',
    photos: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeLots = processingLots.filter(lot => 
    lot.status === 'received' || lot.status === 'processing'
  );

  const handleTakePhoto = () => {
    // Simulate photo capture
    const photoUrl = `https://picsum.photos/400/300?random=${Date.now()}`;
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, photoUrl]
    }));
    Alert.alert('Photo Captured', 'Processing photo has been captured successfully');
  };

  const handleSubmit = async () => {
    if (!selectedLot) {
      Alert.alert('Missing Selection', 'Please select a processing lot.');
      return;
    }

    if (!selectedStep) {
      Alert.alert('Missing Step', 'Please select a processing step.');
      return;
    }

    if (!formData.notes.trim()) {
      Alert.alert('Missing Notes', 'Please add processing notes.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addProcessingStep(selectedLot.id, {
        step: selectedStep,
        notes: formData.notes.trim(),
        temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        photos: formData.photos,
        timestamp: new Date().toISOString(),
      });

      Alert.alert(
        'Success!', 
        'Processing step has been recorded successfully.',
        [{ text: 'OK', onPress: () => {
          setSelectedLot(null);
          setSelectedStep('');
          setFormData({ notes: '', temperature: '', duration: '', photos: [] });
          router.back();
        }}]
      );
    } catch (error) {
      console.error('Error recording processing step:', error);
      Alert.alert('Error', 'Failed to record processing step. Please try again.');
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
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'received' ? '#f59e0b' : '#3b82f6' }]}>
          <Text style={styles.statusText}>{item.status === 'received' ? 'Received' : 'Processing'}</Text>
        </View>
      </View>

      <Text style={styles.speciesText}>{item.species}</Text>
      <Text style={styles.weightText}>{item.receivedWeight} kg received</Text>
      <Text style={styles.stepsText}>{item.processingSteps.length} steps completed</Text>
    </TouchableOpacity>
  );

  const renderStepCard = ({ item }: { item: typeof processingSteps[0] }) => (
    <TouchableOpacity
      style={[
        styles.stepCard,
        selectedStep === item.id && styles.stepCardSelected
      ]}
      onPress={() => setSelectedStep(item.id)}
    >
      <Text style={styles.stepLabel}>{item.label}</Text>
      <Text style={styles.stepDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Record Processing</Text>
          <Text style={styles.subtitle}>Log processing steps and conditions</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Processing Lot</Text>
          {activeLots.length > 0 ? (
            <FlatList
              data={activeLots}
              renderItem={renderLotCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              style={styles.lotList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Package size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No active processing lots</Text>
              <Text style={styles.emptyStateSubtext}>Processing lots will appear here</Text>
            </View>
          )}
        </View>

        {selectedLot && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Processing Step</Text>
              <FlatList
                data={processingSteps}
                renderItem={renderStepCard}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                style={styles.stepList}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Processing Details</Text>
              
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Temperature (°C)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.temperature}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, temperature: text }))}
                    placeholder="25"
                    keyboardType="numeric"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Duration (minutes)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.duration}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, duration: text }))}
                    placeholder="60"
                    keyboardType="numeric"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Processing Notes</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  value={formData.notes}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                  placeholder="Enter detailed processing notes..."
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.photoSection}>
                <Text style={styles.inputLabel}>Processing Photos</Text>
                <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
                  <Camera size={24} color="#16a34a" />
                  <Text style={styles.photoButtonText}>Take Photo</Text>
                </TouchableOpacity>
                {formData.photos.length > 0 && (
                  <Text style={styles.photoCount}>{formData.photos.length} photo(s) captured</Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Recording...' : 'Record Processing Step'}
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
  stepList: {
    maxHeight: 250,
  },
  stepCard: {
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
  stepCardSelected: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
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
    minHeight: 100,
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