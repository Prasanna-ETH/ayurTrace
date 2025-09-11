import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, Package, Truck, CheckCircle, MapPin, Weight, DollarSign, Clock } from 'lucide-react-native';
import { useAuth } from '@/providers/auth-provider';
import { useData, AggregationBatch, useAvailableHarvestedBatches } from '@/providers/data-provider';
import { router } from 'expo-router';



const statusColors = {
  collecting: '#f59e0b',
  'in-transit': '#3b82f6',
  delivered: '#10b981'
};

const statusLabels = {
  collecting: 'Collecting',
  'in-transit': 'In Transit',
  delivered: 'Delivered'
};

export default function CollectorDashboard() {
  const { userProfile } = useAuth();
  const { aggregationBatches, farmerBatches } = useData();
  const availableHarvestedBatches = useAvailableHarvestedBatches();

  const renderAggregationCard = ({ item }: { item: AggregationBatch }) => {
    const farmerCount = new Set(item.farmerBatches.map(batchId => {
      const batch = farmerBatches.find(b => b.id === batchId);
      return batch?.farmerId;
    })).size;
    
    return (
    <View style={styles.aggregationCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.aggregationId}>{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
          <Text style={styles.statusText}>{statusLabels[item.status]}</Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.metricRow}>
          <Users size={16} color="#6b7280" />
          <Text style={styles.metricText}>{farmerCount} Farmers</Text>
        </View>
        <View style={styles.metricRow}>
          <Weight size={16} color="#6b7280" />
          <Text style={styles.metricText}>{item.totalWeight} kg</Text>
        </View>
        <View style={styles.metricRow}>
          <DollarSign size={16} color="#16a34a" />
          <Text style={styles.valueText}>₹{item.totalValue.toLocaleString()}</Text>
        </View>
        <View style={styles.metricRow}>
          <MapPin size={16} color="#6b7280" />
          <Text style={styles.destinationText}>{item.destination || 'Not set'}</Text>
        </View>
      </View>
    </View>
    );
  };

  const quickActions = [
    { 
      icon: Users, 
      title: 'Farmer Details', 
      subtitle: 'View farmer profiles', 
      color: '#16a34a',
      onPress: () => router.push('/farmer/view-payments')
    },
    { 
      icon: Package, 
      title: 'Create Aggregation', 
      subtitle: 'Bundle farmer batches', 
      color: '#059669',
      onPress: () => router.push('/collector/create-aggregation')
    },
    { 
      icon: Truck, 
      title: 'Track Transport', 
      subtitle: 'Monitor deliveries', 
      color: '#0d9488',
      onPress: () => router.push('/collector/track-transport')
    },
    { 
      icon: CheckCircle, 
      title: 'Confirm Delivery', 
      subtitle: 'Complete transactions', 
      color: '#0891b2',
      onPress: () => router.push('/collector/confirm-delivery')
    }
  ];

  const totalWeight = aggregationBatches.reduce((sum, agg) => sum + agg.totalWeight, 0);
  const totalValue = aggregationBatches.reduce((sum, agg) => sum + agg.totalValue, 0);
  const activeAggregations = aggregationBatches.filter(agg => agg.status !== 'delivered').length;

  return (
    <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Hello, {userProfile?.fullName}!</Text>
          <Text style={styles.subtitleText}>Manage your collections</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{activeAggregations}</Text>
            <Text style={styles.statLabel}>Active Collections</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalWeight}kg</Text>
            <Text style={styles.statLabel}>Total Weight</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>₹{totalValue.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Value</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aggregated Batches</Text>
          
          {aggregationBatches.length > 0 ? (
            <FlatList
              data={aggregationBatches}
              renderItem={renderAggregationCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.aggregationList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Package size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No aggregations yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Create your first aggregation from harvested batches
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <TouchableOpacity 
                  key={action.title} 
                  style={styles.actionCard}
                  onPress={action.onPress}
                >
                  <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                    <IconComponent size={24} color={action.color} />
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Harvested Batches</Text>
          {availableHarvestedBatches.length > 0 ? (
            <View style={styles.activityCard}>
              <Text style={styles.availableTitle}>
                {availableHarvestedBatches.length} batches ready for collection
              </Text>
              {availableHarvestedBatches.slice(0, 3).map((batch) => (
                <View key={batch.id} style={styles.activityItem}>
                  <Clock size={16} color="#6b7280" />
                  <Text style={styles.activityText}>
                    {batch.farmerName} - {batch.harvestData?.weight}kg {batch.species}
                  </Text>
                </View>
              ))}
              {availableHarvestedBatches.length > 3 && (
                <Text style={styles.moreText}>
                  +{availableHarvestedBatches.length - 3} more batches available
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.activityCard}>
              <Text style={styles.noActivityText}>No harvested batches available for collection</Text>
            </View>
          )}
        </View>
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
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
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
  aggregationList: {
    paddingRight: 20,
  },
  aggregationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 280,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  },
  cardContent: {
    gap: 8,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricText: {
    fontSize: 14,
    color: '#6b7280',
  },
  valueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  destinationText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activityText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
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
  availableTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16a34a',
    marginBottom: 12,
  },
  moreText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 8,
  },
  noActivityText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});