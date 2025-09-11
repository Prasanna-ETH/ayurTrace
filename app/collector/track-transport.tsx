import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Truck, Thermometer, Droplets, Clock, Play, Square, Navigation } from 'lucide-react-native';
import { useData, AggregationBatch, TransportData } from '@/providers/data-provider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TrackTransportScreen() {
  const { aggregationBatches, updateTransport } = useData();
  const [selectedAggregation, setSelectedAggregation] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [sensorData, setSensorData] = useState<{ temperature: number; humidity: number }>({
    temperature: 25,
    humidity: 60
  });
  const insets = useSafeAreaInsets();

  // Filter aggregations that are ready for transport
  const transportReadyAggregations = aggregationBatches.filter(agg => 
    agg.status === 'collecting' || agg.status === 'in-transit'
  );

  const selectedAggregationData = selectedAggregation 
    ? aggregationBatches.find(agg => agg.id === selectedAggregation)
    : null;

  // Simulate location updates when tracking
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isTracking && selectedAggregation) {
      interval = setInterval(() => {
        // Simulate GPS coordinates (in real app, use actual GPS)
        const lat = 12.9716 + (Math.random() - 0.5) * 0.01;
        const lng = 77.5946 + (Math.random() - 0.5) * 0.01;
        
        setCurrentLocation({ latitude: lat, longitude: lng });
        
        // Simulate sensor data changes
        setSensorData({
          temperature: 20 + Math.random() * 15,
          humidity: 50 + Math.random() * 30
        });
      }, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, selectedAggregation]);

  const handleStartTracking = async () => {
    if (!selectedAggregation) return;
    
    setIsTracking(true);
    
    const transportData: Partial<TransportData> = {
      startTime: new Date().toISOString(),
      route: currentLocation ? [{
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        timestamp: new Date().toISOString()
      }] : [],
      sensorData: [{
        temperature: sensorData.temperature,
        humidity: sensorData.humidity,
        timestamp: new Date().toISOString()
      }]
    };
    
    await updateTransport(selectedAggregation, transportData);
    
    if (Platform.OS !== 'web') {
      Alert.alert('Success', 'Transport tracking started');
    } else {
      console.log('Success: Transport tracking started');
    }
  };

  const handleEndTransport = async () => {
    if (!selectedAggregation || !selectedAggregationData) return;
    
    const transportData: Partial<TransportData> = {
      endTime: new Date().toISOString(),
      route: [
        ...(selectedAggregationData.transportData?.route || []),
        ...(currentLocation ? [{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          timestamp: new Date().toISOString()
        }] : [])
      ],
      sensorData: [
        ...(selectedAggregationData.transportData?.sensorData || []),
        {
          temperature: sensorData.temperature,
          humidity: sensorData.humidity,
          timestamp: new Date().toISOString()
        }
      ]
    };
    
    await updateTransport(selectedAggregation, transportData);
    setIsTracking(false);
    
    if (Platform.OS !== 'web') {
      Alert.alert('Success', 'Transport completed and marked as delivered');
    } else {
      console.log('Success: Transport completed and marked as delivered');
    }
  };

  const renderAggregationCard = ({ item }: { item: AggregationBatch }) => {
    const isSelected = selectedAggregation === item.id;
    const statusColors = {
      collecting: '#f59e0b',
      'in-transit': '#3b82f6',
      delivered: '#10b981'
    };

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
          <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.destinationText}>
            To: {item.destination || 'Not specified'}
          </Text>
          <Text style={styles.weightText}>
            Weight: {item.totalWeight} kg
          </Text>
          <Text style={styles.valueText}>
            Value: ₹{item.totalValue.toLocaleString()}
          </Text>
          
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
            title: 'Track Transport',
            headerStyle: { backgroundColor: '#16a34a' },
            headerTintColor: 'white'
          }} 
        />
        
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom }]}>
          <View style={styles.header}>
            <Truck size={32} color="#16a34a" />
            <Text style={styles.headerTitle}>Transport Tracking</Text>
            <Text style={styles.headerSubtitle}>Monitor your deliveries in real-time</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Aggregation to Track</Text>
            
            {transportReadyAggregations.length > 0 ? (
              <FlatList
                data={transportReadyAggregations}
                renderItem={renderAggregationCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Truck size={48} color="#9ca3af" />
                <Text style={styles.emptyStateText}>No aggregations ready for transport</Text>
                <Text style={styles.emptyStateSubtext}>
                  Create aggregations first to start tracking transport
                </Text>
              </View>
            )}
          </View>

          {selectedAggregationData && (
            <>
              <View style={styles.trackingControls}>
                <Text style={styles.sectionTitle}>Transport Controls</Text>
                
                <View style={styles.controlButtons}>
                  {!isTracking ? (
                    <TouchableOpacity 
                      style={styles.startButton}
                      onPress={handleStartTracking}
                    >
                      <Play size={20} color="white" />
                      <Text style={styles.startButtonText}>Start Transport</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={styles.endButton}
                      onPress={handleEndTransport}
                    >
                      <Square size={20} color="white" />
                      <Text style={styles.endButtonText}>End Transport</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {isTracking && (
                <View style={styles.liveDataSection}>
                  <Text style={styles.sectionTitle}>Live Tracking Data</Text>
                  
                  <View style={styles.dataGrid}>
                    <View style={styles.dataCard}>
                      <Navigation size={24} color="#3b82f6" />
                      <Text style={styles.dataLabel}>Current Location</Text>
                      <Text style={styles.dataValue}>
                        {currentLocation 
                          ? `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`
                          : 'Getting location...'
                        }
                      </Text>
                    </View>
                    
                    <View style={styles.dataCard}>
                      <Thermometer size={24} color="#ef4444" />
                      <Text style={styles.dataLabel}>Temperature</Text>
                      <Text style={styles.dataValue}>{sensorData.temperature.toFixed(1)}°C</Text>
                    </View>
                    
                    <View style={styles.dataCard}>
                      <Droplets size={24} color="#06b6d4" />
                      <Text style={styles.dataLabel}>Humidity</Text>
                      <Text style={styles.dataValue}>{sensorData.humidity.toFixed(1)}%</Text>
                    </View>
                    
                    <View style={styles.dataCard}>
                      <Clock size={24} color="#6b7280" />
                      <Text style={styles.dataLabel}>Duration</Text>
                      <Text style={styles.dataValue}>
                        {selectedAggregationData.transportData?.startTime 
                          ? Math.floor((Date.now() - new Date(selectedAggregationData.transportData.startTime).getTime()) / 60000) + ' min'
                          : '0 min'
                        }
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {selectedAggregationData.transportData && (
                <View style={styles.historySection}>
                  <Text style={styles.sectionTitle}>Transport History</Text>
                  
                  <View style={styles.historyCard}>
                    <View style={styles.historyItem}>
                      <Text style={styles.historyLabel}>Started:</Text>
                      <Text style={styles.historyValue}>
                        {new Date(selectedAggregationData.transportData.startTime).toLocaleString()}
                      </Text>
                    </View>
                    
                    {selectedAggregationData.transportData.endTime && (
                      <View style={styles.historyItem}>
                        <Text style={styles.historyLabel}>Completed:</Text>
                        <Text style={styles.historyValue}>
                          {new Date(selectedAggregationData.transportData.endTime).toLocaleString()}
                        </Text>
                      </View>
                    )}
                    
                    <View style={styles.historyItem}>
                      <Text style={styles.historyLabel}>Route Points:</Text>
                      <Text style={styles.historyValue}>
                        {selectedAggregationData.transportData.route?.length || 0} recorded
                      </Text>
                    </View>
                    
                    <View style={styles.historyItem}>
                      <Text style={styles.historyLabel}>Sensor Readings:</Text>
                      <Text style={styles.historyValue}>
                        {selectedAggregationData.transportData.sensorData?.length || 0} recorded
                      </Text>
                    </View>
                  </View>
                </View>
              )}
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textTransform: 'capitalize',
  },
  cardContent: {
    gap: 4,
  },
  destinationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  weightText: {
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
  trackingControls: {
    marginBottom: 24,
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  startButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  endButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  endButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  liveDataSection: {
    marginBottom: 24,
  },
  dataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dataCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dataLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  historySection: {
    marginBottom: 24,
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  historyLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  historyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
});