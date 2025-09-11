import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Package, Users, DollarSign, MapPin, CheckCircle, Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { useData, FarmerBatch, useAvailableHarvestedBatches } from '@/providers/data-provider';

export default function CreateAggregation() {
  const { createAggregation } = useData();
  const availableHarvestedBatches = useAvailableHarvestedBatches();
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [pricePerKg, setPricePerKg] = useState('');
  const [destination, setDestination] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedBatchObjects = availableHarvestedBatches.filter(batch => 
    selectedBatches.includes(batch.id)
  );

  const totalWeight = selectedBatchObjects.reduce((sum, batch) => 
    sum + (batch.harvestData?.weight || 0), 0
  );

  const totalValue = totalWeight * parseFloat(pricePerKg || '0');

  const uniqueFarmers = new Set(selectedBatchObjects.map(batch => batch.farmerId)).size;

  const toggleBatchSelection = (batchId: string) => {
    setSelectedBatches(prev => 
      prev.includes(batchId) 
        ? prev.filter(id => id !== batchId)
        : [...prev, batchId]
    );
  };

  const handleSubmit = async () => {
    if (selectedBatches.length === 0) {
      Alert.alert('No Batches Selected', 'Please select at least one batch to create an aggregation.');
      return;
    }

    if (!pricePerKg || parseFloat(pricePerKg) <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price per kg.');
      return;
    }

    if (!destination.trim()) {
      Alert.alert('Missing Destination', 'Please enter a destination for this aggregation.');
      return;
    }

    setIsSubmitting(true);
    try {
      const aggregation = await createAggregation(
        selectedBatches,
        parseFloat(pricePerKg),
        destination.trim()
      );

      if (aggregation) {
        Alert.alert(
          'Success!', 
          `Aggregation ${aggregation.id} created successfully with ${selectedBatches.length} batches.`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error) {
      console.error('Error creating aggregation:', error);
      Alert.alert('Error', 'Failed to create aggregation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBatchCard = ({ item }: { item: FarmerBatch }) => {
    const isSelected = selectedBatches.includes(item.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.batchCard,
          isSelected && styles.batchCardSelected
        ]}
        onPress={() => toggleBatchSelection(item.id)}
      >
        <View style={styles.batchHeader}>
          <Text style={styles.batchId}>{item.id}</Text>
          {isSelected && (
            <View style={styles.selectedBadge}>
              <CheckCircle size={16} color="white" />
            </View>
          )}
        </View>

        <Text style={styles.farmerName}>{item.farmerName}</Text>
        <Text style={styles.speciesText}>{item.species}</Text>

        <View style={styles.batchDetails}>
          <Text style={styles.weightText}>
            Weight: {item.harvestData?.weight || 0} kg
          </Text>
          <Text style={styles.qualityText}>
            Quality: {item.harvestData?.quality || 'N/A'}
          </Text>
          <Text style={styles.harvestDate}>
            Harvested: {item.harvestData ? new Date(item.harvestData.harvestDate).toLocaleDateString() : 'N/A'}
          </Text>
        </View>

        {pricePerKg && (
          <View style={styles.priceRow}>
            <DollarSign size={16} color="#16a34a" />
            <Text style={styles.priceText}>
              ₹{((item.harvestData?.weight || 0) * parseFloat(pricePerKg)).toLocaleString()}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Package size={32} color="#16a34a" />
          <Text style={styles.title}>Create Aggregation</Text>
          <Text style={styles.subtitle}>Bundle harvested batches for processing</Text>
        </View>

        {availableHarvestedBatches.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={48} color="#9ca3af" />
            <Text style={styles.emptyStateText}>No harvested batches available</Text>
            <Text style={styles.emptyStateSubtext}>
              Wait for farmers to harvest their crops before creating aggregations
            </Text>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Available Harvested Batches ({availableHarvestedBatches.length})
              </Text>
              <FlatList
                data={availableHarvestedBatches}
                renderItem={renderBatchCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.batchList}
              />
            </View>

            {selectedBatches.length > 0 && (
              <>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>Aggregation Summary</Text>
                  <View style={styles.summaryRow}>
                    <Users size={16} color="#6b7280" />
                    <Text style={styles.summaryText}>{uniqueFarmers} Farmers</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Package size={16} color="#6b7280" />
                    <Text style={styles.summaryText}>{selectedBatches.length} Batches</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryWeight}>Total Weight: {totalWeight} kg</Text>
                  </View>
                  {pricePerKg && (
                    <View style={styles.summaryRow}>
                      <DollarSign size={16} color="#16a34a" />
                      <Text style={styles.summaryValue}>₹{totalValue.toLocaleString()}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Price per kg (₹)</Text>
                  <TextInput
                    style={styles.input}
                    value={pricePerKg}
                    onChangeText={setPricePerKg}
                    placeholder="Enter price per kg"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Destination</Text>
                  <TextInput
                    style={styles.input}
                    value={destination}
                    onChangeText={setDestination}
                    placeholder="Enter processing facility or destination"
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  <Text style={styles.submitButtonText}>
                    {isSubmitting ? 'Creating Aggregation...' : 'Create Aggregation'}
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
    gap: 12,
  },
  batchCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  batchCardSelected: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  batchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  batchId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  selectedBadge: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    padding: 4,
  },
  farmerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  speciesText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 8,
  },
  batchDetails: {
    gap: 4,
    marginBottom: 8,
  },
  weightText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  qualityText: {
    fontSize: 14,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  harvestDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#16a34a',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 14,
    color: '#374151',
  },
  summaryWeight: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16a34a',
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