import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Droplets, Leaf, Scissors, Plus, Camera } from 'lucide-react-native';
import { router } from 'expo-router';
import { useData, FarmerBatch } from '@/providers/data-provider';

const careTypes = [
  { id: 'watering', label: 'Watering', icon: Droplets, color: '#3b82f6' },
  { id: 'fertilizing', label: 'Fertilizing', icon: Leaf, color: '#10b981' },
  { id: 'weeding', label: 'Weeding', icon: Scissors, color: '#f59e0b' },
  { id: 'other', label: 'Other', icon: Plus, color: '#8b5cf6' },
];

export default function DailyCare() {
  const { farmerBatches, addCareEvent } = useData();
  const [selectedBatch, setSelectedBatch] = useState<FarmerBatch | null>(null);
  const [selectedCareType, setSelectedCareType] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeBatches = farmerBatches.filter(batch => 
    batch.status === 'planting' || batch.status === 'ongoing'
  );

  const handleSubmit = async () => {
    if (!selectedBatch || !selectedCareType || !notes.trim()) {
      Alert.alert('Missing Information', 'Please select a batch, care type, and add notes.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addCareEvent(selectedBatch.id, {
        type: selectedCareType as any,
        notes: notes.trim(),
        photos: [],
        date: new Date().toISOString().split('T')[0],
      });

      Alert.alert(
        'Success!', 
        'Care event has been logged successfully.',
        [{ text: 'OK', onPress: () => {
          setSelectedBatch(null);
          setSelectedCareType('');
          setNotes('');
          router.back();
        }}]
      );
    } catch (error) {
      console.error('Error logging care event:', error);
      Alert.alert('Error', 'Failed to log care event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBatchCard = ({ item }: { item: FarmerBatch }) => (
    <TouchableOpacity
      style={[
        styles.batchCard,
        selectedBatch?.id === item.id && styles.batchCardSelected
      ]}
      onPress={() => setSelectedBatch(item)}
    >
      <Text style={styles.batchId}>{item.id}</Text>
      <Text style={styles.batchSpecies}>{item.species}</Text>
      <Text style={styles.batchDate}>
        Planted: {new Date(item.plantingDate).toLocaleDateString()}
      </Text>
      <View style={styles.careEventsCount}>
        <Text style={styles.careEventsText}>
          {item.careEvents.length} care events
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Calendar size={32} color="#16a34a" />
          <Text style={styles.title}>Daily Care Log</Text>
          <Text style={styles.subtitle}>Record care activities for your crops</Text>
        </View>

        {activeBatches.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#9ca3af" />
            <Text style={styles.emptyStateText}>No active batches</Text>
            <Text style={styles.emptyStateSubtext}>
              You need active batches to log care activities
            </Text>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Batch</Text>
              <FlatList
                data={activeBatches}
                renderItem={renderBatchCard}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.batchList}
              />
            </View>

            {selectedBatch && (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Care Type</Text>
                  <View style={styles.careTypeGrid}>
                    {careTypes.map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <TouchableOpacity
                          key={type.id}
                          style={[
                            styles.careTypeCard,
                            selectedCareType === type.id && styles.careTypeCardSelected
                          ]}
                          onPress={() => setSelectedCareType(type.id)}
                        >
                          <View style={[
                            styles.careTypeIcon,
                            { backgroundColor: `${type.color}20` },
                            selectedCareType === type.id && { backgroundColor: type.color }
                          ]}>
                            <IconComponent 
                              size={24} 
                              color={selectedCareType === type.id ? 'white' : type.color} 
                            />
                          </View>
                          <Text style={[
                            styles.careTypeText,
                            selectedCareType === type.id && styles.careTypeTextSelected
                          ]}>
                            {type.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Notes</Text>
                  <TextInput
                    style={styles.notesInput}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Describe the care activity, observations, etc."
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Date</Text>
                  <View style={styles.dateCard}>
                    <Calendar size={20} color="#16a34a" />
                    <Text style={styles.dateText}>{new Date().toLocaleDateString()}</Text>
                    <Text style={styles.dateSubtext}>(Today)</Text>
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Photos (Optional)</Text>
                  <TouchableOpacity style={styles.photoCard}>
                    <Camera size={24} color="#6b7280" />
                    <Text style={styles.photoText}>Add photos of care activity</Text>
                    <Text style={styles.photoSubtext}>Coming soon</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  <Text style={styles.submitButtonText}>
                    {isSubmitting ? 'Logging Care Event...' : 'Log Care Event'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
  batchList: {
    paddingRight: 20,
  },
  batchCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 200,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  batchCardSelected: {
    borderColor: '#16a34a',
  },
  batchId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  batchSpecies: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 4,
  },
  batchDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  careEventsCount: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  careEventsText: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
  },
  careTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  careTypeCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  careTypeCardSelected: {
    borderColor: '#16a34a',
  },
  careTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  careTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  careTypeTextSelected: {
    color: '#16a34a',
  },
  notesInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 100,
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
});