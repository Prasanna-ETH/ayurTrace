import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { ArrowLeft, User, MapPin, Phone, Mail, Award, Calendar, Package, Plus, Eye } from 'lucide-react-native';
import { useData, FarmerBatch, FarmerProfile } from '@/providers/data-provider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FarmerDetailsScreen() {
  const { farmerBatches, farmers, addToAggregationCart, aggregationCart } = useData();
  const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const selectedFarmer = selectedFarmerId ? farmers.find(f => f.id === selectedFarmerId) : null;
  const farmerBatchesForSelected = selectedFarmerId 
    ? farmerBatches.filter(batch => batch.farmerId === selectedFarmerId)
    : [];

  const handleAddToCart = (batch: FarmerBatch) => {
    if (batch.status !== 'harvested') {
      if (Platform.OS !== 'web') {
        Alert.alert('Error', 'Only harvested batches can be added to aggregation');
      } else {
        console.log('Error: Only harvested batches can be added to aggregation');
      }
      return;
    }
    
    addToAggregationCart(batch.id);
    if (Platform.OS !== 'web') {
      Alert.alert('Success', 'Batch added to aggregation cart');
    } else {
      console.log('Success: Batch added to aggregation cart');
    }
  };

  const isInCart = (batchId: string) => {
    return aggregationCart.includes(batchId);
  };

  const renderFarmerCard = ({ item }: { item: FarmerProfile }) => {
    const farmerBatchCount = farmerBatches.filter(batch => batch.farmerId === item.id).length;
    const harvestedCount = farmerBatches.filter(batch => batch.farmerId === item.id && batch.status === 'harvested').length;
    
    return (
      <TouchableOpacity 
        style={styles.farmerCard}
        onPress={() => setSelectedFarmerId(item.id)}
      >
        <View style={styles.farmerHeader}>
          <View style={styles.farmerAvatar}>
            <User size={24} color="#16a34a" />
          </View>
          <View style={styles.farmerInfo}>
            <Text style={styles.farmerName}>{item.fullName}</Text>
            <View style={styles.farmerMeta}>
              <MapPin size={14} color="#6b7280" />
              <Text style={styles.farmerLocation}>{item.location}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.farmerStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{farmerBatchCount}</Text>
            <Text style={styles.statLabel}>Total Batches</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#16a34a' }]}>{harvestedCount}</Text>
            <Text style={styles.statLabel}>Harvested</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderBatchCard = ({ item }: { item: FarmerBatch }) => {
    const statusColors = {
      planting: '#f59e0b',
      ongoing: '#3b82f6',
      harvested: '#10b981',
      sold: '#6b7280'
    };

    const statusLabels = {
      planting: 'Planting',
      ongoing: 'Growing',
      harvested: 'Harvested',
      sold: 'Sold'
    };

    return (
      <View style={styles.batchCard}>
        <View style={styles.batchHeader}>
          <Text style={styles.batchId}>{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
            <Text style={styles.statusText}>{statusLabels[item.status]}</Text>
          </View>
        </View>
        
        <View style={styles.batchContent}>
          <Text style={styles.batchSpecies}>{item.species}</Text>
          <View style={styles.batchMeta}>
            <Calendar size={14} color="#6b7280" />
            <Text style={styles.batchDate}>
              Planted: {new Date(item.plantingDate).toLocaleDateString()}
            </Text>
          </View>
          
          {item.harvestData && (
            <View style={styles.harvestInfo}>
              <Text style={styles.harvestWeight}>Weight: {item.harvestData.weight} kg</Text>
              <Text style={styles.harvestMoisture}>Moisture: {item.harvestData.moisture}%</Text>
            </View>
          )}
          
          <View style={styles.batchActions}>
            <TouchableOpacity 
              style={styles.viewButton}
              onPress={() => {
                console.log('View batch details:', item.id);
              }}
            >
              <Eye size={16} color="#3b82f6" />
              <Text style={styles.viewButtonText}>View Details</Text>
            </TouchableOpacity>
            
            {item.status === 'harvested' && (
              <TouchableOpacity 
                style={[
                  styles.addButton,
                  isInCart(item.id) && styles.addButtonDisabled
                ]}
                onPress={() => handleAddToCart(item)}
                disabled={isInCart(item.id)}
              >
                <Plus size={16} color={isInCart(item.id) ? '#9ca3af' : '#16a34a'} />
                <Text style={[
                  styles.addButtonText,
                  isInCart(item.id) && styles.addButtonTextDisabled
                ]}>
                  {isInCart(item.id) ? 'In Cart' : 'Add to Cart'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (selectedFarmer) {
    return (
      <View style={[styles.container, { backgroundColor: '#f0fdf4' }]}>
        <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={[styles.gradientContainer, { paddingTop: insets.top }]}>
          <Stack.Screen 
            options={{
              title: 'Farmer Details',
              headerStyle: { backgroundColor: '#16a34a' },
              headerTintColor: 'white',
              headerLeft: () => (
                <TouchableOpacity onPress={() => setSelectedFarmerId(null)}>
                  <ArrowLeft size={24} color="white" />
                </TouchableOpacity>
              )
            }} 
          />
          
          <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom }]}>
            <View style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <View style={styles.profileAvatar}>
                  <User size={32} color="#16a34a" />
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{selectedFarmer.fullName}</Text>
                  <Text style={styles.profileLicense}>License: {selectedFarmer.nmpbLicense}</Text>
                </View>
              </View>
              
              <View style={styles.contactInfo}>
                <View style={styles.contactItem}>
                  <Phone size={16} color="#6b7280" />
                  <Text style={styles.contactText}>{selectedFarmer.mobile}</Text>
                </View>
                <View style={styles.contactItem}>
                  <Mail size={16} color="#6b7280" />
                  <Text style={styles.contactText}>{selectedFarmer.email}</Text>
                </View>
                <View style={styles.contactItem}>
                  <MapPin size={16} color="#6b7280" />
                  <Text style={styles.contactText}>{selectedFarmer.location}</Text>
                </View>
                <View style={styles.contactItem}>
                  <Award size={16} color="#6b7280" />
                  <Text style={styles.contactText}>GACP Certified</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Farmer Batches ({farmerBatchesForSelected.length})</Text>
              {farmerBatchesForSelected.length > 0 ? (
                <FlatList
                  data={farmerBatchesForSelected}
                  renderItem={renderBatchCard}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Package size={48} color="#9ca3af" />
                  <Text style={styles.emptyStateText}>No batches found</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#f0fdf4' }]}>
      <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={[styles.gradientContainer, { paddingTop: insets.top }]}>
        <Stack.Screen 
          options={{
            title: 'Farmer Details',
            headerStyle: { backgroundColor: '#16a34a' },
            headerTintColor: 'white'
          }} 
        />
        
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom }]}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Select a Farmer</Text>
            <Text style={styles.headerSubtitle}>View farmer profiles and their batches</Text>
          </View>
          
          <FlatList
            data={farmers}
            renderItem={renderFarmerCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
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
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  farmerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  farmerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  farmerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  farmerInfo: {
    flex: 1,
  },
  farmerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  farmerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  farmerLocation: {
    fontSize: 14,
    color: '#6b7280',
  },
  farmerStats: {
    flexDirection: 'row',
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  profileLicense: {
    fontSize: 14,
    color: '#6b7280',
  },
  contactInfo: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#374151',
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
  batchCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  batchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  batchId: {
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
  batchContent: {
    gap: 8,
  },
  batchSpecies: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16a34a',
  },
  batchMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  batchDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  harvestInfo: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  harvestWeight: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  harvestMoisture: {
    fontSize: 14,
    color: '#6b7280',
  },
  batchActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  viewButtonText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#dcfce7',
  },
  addButtonDisabled: {
    backgroundColor: '#f3f4f6',
  },
  addButtonText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
  },
  addButtonTextDisabled: {
    color: '#9ca3af',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
});