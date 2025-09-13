import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Scale, Droplets, Star, Calendar } from 'lucide-react-native';
import { router } from 'expo-router';
import { useData, FarmerBatch, HarvestData } from '@/providers/data-provider';

const qualityOptions = [
  { id: 'premium', label: 'Premium', color: '#10b981', description: 'Excellent quality' },
  { id: 'standard', label: 'Standard', color: '#3b82f6', description: 'Good quality' },
  { id: 'low', label: 'Low', color: '#f59e0b', description: 'Below average' },
];

export default function RecordHarvest() {
  const { farmerBatches, recordHarvest } = useData();
  const [selectedBatch, setSelectedBatch] = useState<FarmerBatch | null>(null);
  const [formData, setFormData] = useState({
    weight: '',
    moisture: '',
    quality: '' as HarvestData['quality'] | '',
    photos: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const harvestReadyBatches = farmerBatches.filter(batch => 
    batch.status === 'ongoing' && batch.careEvents.length > 0
  );

  const handleSubmit = async () => {
    if (!selectedBatch || !formData.weight || !formData.moisture || !formData.quality) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    const weight = parseFloat(formData.weight);
    const moisture = parseFloat(formData.moisture);

    if (isNaN(weight) || weight <= 0) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight.');
      return;
    }

    if (isNaN(moisture) || moisture < 0 || moisture > 100) {
      Alert.alert('Invalid Moisture', 'Please enter a valid moisture percentage (0-100).');
      return;
    }

    setIsSubmitting(true);
    try {
      const harvestData: HarvestData = {
        weight,
        moisture,
        quality: formData.quality as HarvestData['quality'],
        photos: formData.photos,
        harvestDate: new Date().toISOString().split('T')[0],
      };

      await recordHarvest(selectedBatch.id, harvestData);

      Alert.alert(
        'Success!', 
        `Harvest recorded successfully! Your batch is now ready for collection.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error recording harvest:', error);
      Alert.alert('Error', 'Failed to record harvest. Please try again.');
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
      <Text style={styles.batchSeedQuantity}>
        Seed: {item.seedQuantity} kg
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
          <Camera size={32} color="#16a34a" />
          <Text style={styles.title}>Record Harvest</Text>
          <Text style={styles.subtitle}>Submit harvest data for your crops</Text>
        </View>

        {harvestReadyBatches.length === 0 ? (
          <View style={styles.emptyState}>
            <Camera size={48} color="#9ca3af" />
            <Text style={styles.emptyStateText}>No batches ready for harvest</Text>
            <Text style={styles.emptyStateSubtext}>
              You need ongoing batches with care activities to record harvest
            </Text>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Batch to Harvest</Text>
              <FlatList
                data={harvestReadyBatches}
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
                  <Text style={styles.sectionTitle}>Harvest Weight (kg)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.weight}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, weight: text }))}
                    placeholder="Enter total harvest weight in kg"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Moisture Content (%)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.moisture}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, moisture: text }))}
                    placeholder="Enter moisture percentage (0-100)"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Quality Assessment</Text>
                  <View style={styles.qualityGrid}>
                    {qualityOptions.map((quality) => (
                      <TouchableOpacity
                        key={quality.id}
                        style={[
                          styles.qualityCard,
                          formData.quality === quality.id && styles.qualityCardSelected
                        ]}
                        onPress={() => setFormData(prev => ({ ...prev, quality: quality.id as any }))}
                      >
                        <View style={[
                          styles.qualityIcon,
                          { backgroundColor: `${quality.color}20` },
                          formData.quality === quality.id && { backgroundColor: quality.color }
                        ]}>
                          <Star 
                            size={24} 
                            color={formData.quality === quality.id ? 'white' : quality.color} 
                          />
                        </View>
                        <Text style={[
                          styles.qualityLabel,
                          formData.quality === quality.id && styles.qualityLabelSelected
                        ]}>
                          {quality.label}
                        </Text>
                        <Text style={styles.qualityDescription}>
                          {quality.description}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Harvest Date</Text>
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
                    <Text style={styles.photoText}>Add photos of harvested crops</Text>
                    <Text style={styles.photoSubtext}>Coming soon</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  <Text style={styles.submitButtonText}>
                    {isSubmitting ? 'Recording Harvest...' : 'Submit Harvest'}
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
    marginBottom: 4,
  },
  batchSeedQuantity: {
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
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  qualityGrid: {
    gap: 12,
  },
  qualityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  qualityCardSelected: {
    borderColor: '#16a34a',
  },
  qualityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  qualityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  qualityLabelSelected: {
    color: '#16a34a',
  },
  qualityDescription: {
    fontSize: 14,
    color: '#6b7280',
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