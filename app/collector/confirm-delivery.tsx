import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, TextInput, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { CheckCircle, Package, MapPin, Camera, Upload } from 'lucide-react-native';
import { useData, AggregationBatch } from '@/providers/data-provider';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ConfirmDeliveryScreen() {
  const { aggregationBatches, updateTransport } = useData();
  const [selectedAggregation, setSelectedAggregation] = useState<string | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');
  const [deliveryPhoto, setDeliveryPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const insets = useSafeAreaInsets();

  // Filter aggregations that are in-transit and ready for delivery confirmation
  const deliveryReadyAggregations = aggregationBatches.filter(agg => 
    agg.status === 'in-transit' && agg.transportData?.startTime
  );

  const selectedAggregationData = selectedAggregation 
    ? aggregationBatches.find(agg => agg.id === selectedAggregation)
    : null;

  const handleTakePhoto = () => {
    // In a real app, this would open camera
    // For demo purposes, we'll simulate a photo URL
    const photoUrl = `https://picsum.photos/400/300?random=${Date.now()}`;
    setDeliveryPhoto(photoUrl);
    
    if (Platform.OS !== 'web') {
      Alert.alert('Photo Captured', 'Delivery photo has been captured successfully');
    } else {
      console.log('Photo Captured: Delivery photo has been captured successfully');
    }
  };

  const handleConfirmDelivery = async () => {
    if (!selectedAggregation || !selectedAggregationData) {
      if (Platform.OS !== 'web') {
        Alert.alert('Error', 'Please select an aggregation to confirm delivery');
      } else {
        console.log('Error: Please select an aggregation to confirm delivery');
      }
      return;
    }

    if (!deliveryNotes.trim()) {
      if (Platform.OS !== 'web') {
        Alert.alert('Error', 'Please add delivery notes');
      } else {
        console.log('Error: Please add delivery notes');
      }
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Update transport data to mark as delivered
      const updatedTransportData = {
        ...selectedAggregationData.transportData,
        endTime: new Date().toISOString(),
        deliveryPhoto: deliveryPhoto || undefined,
        deliveryNotes: deliveryNotes.trim()
      };

      await updateTransport(selectedAggregation, updatedTransportData);

      if (Platform.OS !== 'web') {
        Alert.alert(
          'Delivery Confirmed!',
          `Aggregation ${selectedAggregation} has been successfully delivered.`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        console.log(`Delivery Confirmed: Aggregation ${selectedAggregation} has been successfully delivered.`);
        router.back();
      }
    } catch (error) {
      console.error('Error confirming delivery:', error);
      if (Platform.OS !== 'web') {
        Alert.alert('Error', 'Failed to confirm delivery. Please try again.');
      } else {
        console.log('Error: Failed to confirm delivery. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAggregationCard = ({ item }: { item: AggregationBatch }) => {
    const isSelected = selectedAggregation === item.id;
    const transportDuration = item.transportData?.startTime 
      ? Math.floor((Date.now() - new Date(item.transportData.startTime).getTime()) / 60000)
      : 0;

    return (
      <TouchableOpacity
        style={[
          styles.aggregationCard,
          isSelected && styles.aggregationCardSelected
        ]}
        onPress={() => setSelectedAggregation(item.id)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.aggregationId}>{item.id}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>In Transit</Text>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.detailRow}>
            <MapPin size={16} color="#6b7280" />
            <Text style={styles.destinationText}>
              To: {item.destination || 'Processing Facility'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Package size={16} color="#6b7280" />
            <Text style={styles.detailText}>
              Weight: {item.totalWeight} kg
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Value:</Text>
            <Text style={styles.valueText}>₹{item.totalValue.toLocaleString()}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transport Duration:</Text>
            <Text style={styles.detailText}>{transportDuration} minutes</Text>
          </View>
          
          {item.transportData?.startTime && (
            <Text style={styles.startTimeText}>
              Started: {new Date(item.transportData.startTime).toLocaleString()}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: '#f0fdf4' }]}>
      <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={[styles.gradientContainer, { paddingTop: insets.top }]}>
        <Stack.Screen 
          options={{
            title: 'Confirm Delivery',
            headerStyle: { backgroundColor: '#16a34a' },
            headerTintColor: 'white'
          }} 
        />
        
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom }]}>
          <View style={styles.header}>
            <CheckCircle size={32} color="#16a34a" />
            <Text style={styles.headerTitle}>Confirm Delivery</Text>
            <Text style={styles.headerSubtitle}>Complete your transport and confirm delivery</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Aggregation for Delivery</Text>
            
            {deliveryReadyAggregations.length > 0 ? (
              <FlatList
                data={deliveryReadyAggregations}
                renderItem={renderAggregationCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Package size={48} color="#9ca3af" />
                <Text style={styles.emptyStateText}>No aggregations ready for delivery</Text>
                <Text style={styles.emptyStateSubtext}>
                  Start transport tracking first to confirm deliveries
                </Text>
              </View>
            )}
          </View>

          {selectedAggregationData && (
            <>
              <View style={styles.deliveryForm}>
                <Text style={styles.sectionTitle}>Delivery Details</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Delivery Notes *</Text>
                  <TextInput
                    style={styles.textArea}
                    value={deliveryNotes}
                    onChangeText={setDeliveryNotes}
                    placeholder="Enter delivery notes, recipient details, condition of goods, etc."
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Delivery Photo (Optional)</Text>
                  
                  {deliveryPhoto ? (
                    <View style={styles.photoContainer}>
                      <Text style={styles.photoText}>📷 Photo captured</Text>
                      <TouchableOpacity 
                        style={styles.retakeButton}
                        onPress={handleTakePhoto}
                      >
                        <Camera size={16} color="#16a34a" />
                        <Text style={styles.retakeButtonText}>Retake</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={styles.photoButton}
                      onPress={handleTakePhoto}
                    >
                      <Camera size={24} color="#6b7280" />
                      <Text style={styles.photoButtonText}>Take Delivery Photo</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>Delivery Summary</Text>
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Aggregation ID:</Text>
                    <Text style={styles.summaryValue}>{selectedAggregationData.id}</Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Destination:</Text>
                    <Text style={styles.summaryValue}>
                      {selectedAggregationData.destination || 'Processing Facility'}
                    </Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Weight:</Text>
                    <Text style={styles.summaryValue}>{selectedAggregationData.totalWeight} kg</Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Value:</Text>
                    <Text style={[styles.summaryValue, styles.valueHighlight]}>
                      ₹{selectedAggregationData.totalValue.toLocaleString()}
                    </Text>
                  </View>
                  
                  {selectedAggregationData.transportData?.startTime && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Transport Started:</Text>
                      <Text style={styles.summaryValue}>
                        {new Date(selectedAggregationData.transportData.startTime).toLocaleString()}
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity 
                  style={[
                    styles.confirmButton,
                    isSubmitting && styles.confirmButtonDisabled
                  ]}
                  onPress={handleConfirmDelivery}
                  disabled={isSubmitting}
                >
                  <CheckCircle size={20} color="white" />
                  <Text style={styles.confirmButtonText}>
                    {isSubmitting ? 'Confirming Delivery...' : 'Confirm Delivery'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#166534',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
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
  aggregationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  statusBadge: {
    backgroundColor: '#3b82f6',
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
  destinationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  valueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  startTimeText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
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
  deliveryForm: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  textArea: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 100,
    color: '#374151',
  },
  photoContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoText: {
    fontSize: 16,
    color: '#374151',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retakeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  photoButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: 8,
  },
  photoButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#16a34a',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
  },
  valueHighlight: {
    color: '#16a34a',
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});