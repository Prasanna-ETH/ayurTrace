import React from 'react';
import { StyleSheet, Text, View, ScrollView, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, DollarSign, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react-native';
import { useData, FarmerBatch } from '@/providers/data-provider';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'paid':
      return <CheckCircle size={16} color="#10b981" />;
    case 'pending':
      return <Clock size={16} color="#f59e0b" />;
    default:
      return <AlertCircle size={16} color="#6b7280" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return '#10b981';
    case 'pending':
      return '#f59e0b';
    default:
      return '#6b7280';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'paid':
      return 'Paid';
    case 'pending':
      return 'Pending';
    default:
      return 'Not Set';
  }
};

export default function ViewPayments() {
  const { farmerBatches } = useData();

  const soldBatches = farmerBatches.filter(batch => 
    batch.status === 'sold' && batch.paymentAmount
  );

  const totalEarnings = soldBatches.reduce((sum, batch) => sum + (batch.paymentAmount || 0), 0);
  const paidAmount = soldBatches
    .filter(batch => batch.paymentStatus === 'paid')
    .reduce((sum, batch) => sum + (batch.paymentAmount || 0), 0);
  const pendingAmount = totalEarnings - paidAmount;

  const renderPaymentCard = ({ item }: { item: FarmerBatch }) => (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <Text style={styles.batchId}>{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.paymentStatus || '')}20` }]}>
          {getStatusIcon(item.paymentStatus || '')}
          <Text style={[styles.statusText, { color: getStatusColor(item.paymentStatus || '') }]}>
            {getStatusLabel(item.paymentStatus || '')}
          </Text>
        </View>
      </View>

      <Text style={styles.speciesText}>{item.species}</Text>

      <View style={styles.paymentDetails}>
        <View style={styles.detailRow}>
          <Calendar size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            Harvested: {item.harvestData ? new Date(item.harvestData.harvestDate).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.weightText}>
            Weight: {item.harvestData?.weight || 0} kg
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.qualityText}>
            Quality: {item.harvestData?.quality || 'N/A'}
          </Text>
        </View>
      </View>

      <View style={styles.amountRow}>
        <DollarSign size={20} color="#16a34a" />
        <Text style={styles.amountText}>₹{(item.paymentAmount || 0).toLocaleString()}</Text>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Eye size={32} color="#16a34a" />
          <Text style={styles.title}>Payment Overview</Text>
          <Text style={styles.subtitle}>Track your earnings and payment status</Text>
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryAmount}>₹{totalEarnings.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Total Earnings</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryAmount, { color: '#10b981' }]}>₹{paidAmount.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Paid</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryAmount, { color: '#f59e0b' }]}>₹{pendingAmount.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          
          {soldBatches.length > 0 ? (
            <FlatList
              data={soldBatches}
              renderItem={renderPaymentCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.paymentList}
            />
          ) : (
            <View style={styles.emptyState}>
              <DollarSign size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No payments yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Complete harvest and sell your crops to see payments here
              </Text>
            </View>
          )}
        </View>

        {soldBatches.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Information</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>How payments work:</Text>
              <Text style={styles.infoText}>
                • Payments are processed after collectors purchase your harvested crops
              </Text>
              <Text style={styles.infoText}>
                • Payment status updates automatically when transactions are completed
              </Text>
              <Text style={styles.infoText}>
                • You can track the full journey of your crops through the supply chain
              </Text>
            </View>
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
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
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
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 4,
  },
  summaryLabel: {
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
  paymentList: {
    gap: 12,
  },
  paymentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  paymentHeader: {
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  speciesText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 12,
  },
  paymentDetails: {
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
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  amountText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16a34a',
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
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
    lineHeight: 20,
  },
});