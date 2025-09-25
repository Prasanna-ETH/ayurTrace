import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle, Package, Truck, Camera, Users } from 'lucide-react-native';
import { router } from 'expo-router';
import { useData, AggregationBatch } from '@/providers/data-provider';

export default function ReceiveBatch() {
  const { aggregationBatches, receiveBatchAtFacility } = useData();
  const [selectedAggregation, setSelectedAggregation] = useState<AggregationBatch | null>(null);
  const [receivedWeight, setReceivedWeight] = useState('');
  const [qualityNotes, setQualityNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deliveredAggregations = aggregationBatches.filter(agg => 
    agg.status === 'in-transit' || (agg.status === 'delivered' && !agg.facilityId)
  );

  const handleTakePhoto = () => {
    // Simulate photo capture
    const photoUrl = `https://picsum.photos/400/300?random=${Date.now()}`;
    setPhotos(prev => [...prev, photoUrl]);
    Alert.alert('Photo Captured', 'Delivery photo has been captured successfully');
  };

  const handleSubmit = async () => {
    if (!selectedAggregation) {
      Alert.alert('Missing Selection', 'Please select an aggregation to receive.');
      return;
    }

    if (!receivedWeight || parseFloat(receivedWeight) <= 0) {
      Alert.alert('Invalid Weight', 'Please enter a valid received weight.');
      return;
    }

    const weight = parseFloat(receivedWeight);
    if (weight > selectedAggregation.totalWeight) {
      Alert.alert('Weight Error', 'Received weight cannot exceed the shipped weight.');
      return;
    }

    setIsSubmitting(true);
    try {
      await receiveBatchAtFacility(
        selectedAggregation.id,
        weight,
        qualityNotes.trim(),
        photos
      );

      Alert.alert(
        'Success!', 
        `Aggregation ${selectedAggregation.id} received successfully!`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error receiving batch:', error);
      Alert.alert('Error', 'Failed to receive batch. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAggregationCard = ({ item }: { item: AggregationBatch }) => (
    <TouchableOpacity
      style={[
        styles.aggregationCard,
        selectedAggregation?.id === item.id && styles.aggregationCardSelected
      ]}
      onPress={() => setSelectedAggregation(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.aggregationId}>{item.id}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Delivered</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.detailRow}>
          <Package size={16} color="#6b7280" />
          <Text style={styles.detailText}>{item.totalWeight} kg</Text>
        </View>
        <View style={styles.detailRow}>
          <Users size={16} color="#6b7280" />
          <Text style={styles.detailText}>From: {item.collectorName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Truck size={16} color="#6b7280" />
          <Text style={styles.detailText}>Destination: {item.destination}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Receive Aggregation</Text>
          <Text style={styles.subtitle}>Acknowledge delivery and inspect quality</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Aggregation</Text>
          {deliveredAggregations.length > 0 ? (
            <FlatList
              data={deliveredAggregations}
              renderItem={renderAggregationCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              style={styles.aggregationList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Package size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No aggregations to receive</Text>
              <Text style={styles.emptyStateSubtext}>Delivered aggregations will appear here</Text>
            </View>
          )}
        </View>

        {selectedAggregation && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Inspection Details</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Received Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={receivedWeight}
                  onChangeText={setReceivedWeight}
                  placeholder={`Expected: ${selectedAggregation.totalWeight} kg`}
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Quality Notes</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  value={qualityNotes}
                  onChangeText={setQualityNotes}
                  placeholder="Enter quality inspection notes..."
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.photoSection}>
                <Text style={styles.inputLabel}>Inspection Photos</Text>
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
                {isSubmitting ? 'Receiving...' : 'Confirm Receipt'}
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
  aggregationList: {
    maxHeight: 300,
  },
  aggregationCard: {
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
  aggregationCardSelected: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  aggregationId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  statusBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  cardContent: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
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