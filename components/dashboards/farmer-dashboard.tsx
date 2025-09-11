import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sprout, Calendar, Camera, Eye, DollarSign, Plus, MapPin } from 'lucide-react-native';
import { useAuth } from '@/providers/auth-provider';
import { useData, FarmerBatch } from '@/providers/data-provider';
import { router } from 'expo-router';



const statusColors = {
  planting: '#f59e0b',
  ongoing: '#10b981',
  harvested: '#3b82f6',
  sold: '#8b5cf6'
};

const statusLabels = {
  planting: 'Planting',
  ongoing: 'Growing',
  harvested: 'Harvested',
  sold: 'Sold'
};

export default function FarmerDashboard() {
  const { userProfile } = useAuth();
  const { farmerBatches } = useData();

  const renderBatchCard = ({ item }: { item: FarmerBatch }) => (
    <View style={styles.batchCard}>
      <View style={styles.batchHeader}>
        <Text style={styles.batchId}>{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
          <Text style={styles.statusText}>{statusLabels[item.status]}</Text>
        </View>
      </View>
      
      <Text style={styles.speciesText}>{item.species}</Text>
      
      <View style={styles.batchDetails}>
        <View style={styles.detailRow}>
          <Calendar size={16} color="#6b7280" />
          <Text style={styles.detailText}>Planted: {new Date(item.plantingDate).toLocaleDateString()}</Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={16} color="#6b7280" />
          <Text style={styles.detailText}>{item.location.address}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.quantityText}>
            {item.harvestData?.weight || item.seedQuantity} kg
          </Text>
        </View>
      </View>
      
      {item.paymentAmount && (
        <View style={styles.paymentRow}>
          <DollarSign size={16} color="#16a34a" />
          <Text style={styles.paymentText}>₹{item.paymentAmount.toLocaleString()}</Text>
        </View>
      )}
    </View>
  );

  const quickActions = [
    { 
      icon: Sprout, 
      title: 'Record Planting', 
      subtitle: 'Start new batch', 
      color: '#16a34a',
      onPress: () => router.push('/farmer/record-planting')
    },
    { 
      icon: Calendar, 
      title: 'Daily Care', 
      subtitle: 'Log care activities', 
      color: '#059669',
      onPress: () => router.push('/farmer/daily-care')
    },
    { 
      icon: Camera, 
      title: 'Record Harvest', 
      subtitle: 'Submit harvest data', 
      color: '#0d9488',
      onPress: () => router.push('/farmer/record-harvest')
    },
    { 
      icon: Eye, 
      title: 'View Payments', 
      subtitle: 'Check payment status', 
      color: '#0891b2',
      onPress: () => router.push('/farmer/view-payments')
    }
  ];

  return (
    <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Hello, {userProfile?.fullName}!</Text>
          <Text style={styles.subtitleText}>Manage your herbal crops</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{farmerBatches.filter(b => b.status === 'ongoing').length}</Text>
            <Text style={styles.statLabel}>Active Batches</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{farmerBatches.filter(b => b.status === 'harvested').length}</Text>
            <Text style={styles.statLabel}>Ready to Sell</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>₹{farmerBatches.reduce((sum, b) => sum + (b.paymentAmount || 0), 0).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Batches</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => router.push('/farmer/record-planting')}
            >
              <Plus size={20} color="#16a34a" />
            </TouchableOpacity>
          </View>
          
          {farmerBatches.length > 0 ? (
            <FlatList
              data={farmerBatches}
              renderItem={renderBatchCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.batchList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Sprout size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No batches yet</Text>
              <Text style={styles.emptyStateSubtext}>Tap the + button to create your first batch</Text>
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
    fontSize: 20,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#166534',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  batchList: {
    paddingRight: 20,
  },
  batchCard: {
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
  batchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  speciesText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 12,
  },
  batchDetails: {
    gap: 6,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  paymentText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16a34a',
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