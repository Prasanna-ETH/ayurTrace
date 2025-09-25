import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Package, QrCode, Eye, Beaker, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/providers/auth-provider';
import { useData, useApprovedProcessingLots, FinalProduct, ProcessingLot } from '@/providers/data-provider';

interface FinalBatch {
  id: string;
  productName: string;
  batchSize: number;
  status: 'formulating' | 'ready' | 'shipped';
  createdDate: string;
  processingLots: string[];
  qrGenerated: boolean;
}

const mockFinalBatches: FinalBatch[] = [
  {
    id: 'FB-MFG-001-20250910',
    productName: 'Turmeric Capsules',
    batchSize: 1000,
    status: 'ready',
    createdDate: '2025-09-10',
    processingLots: ['PL-GVP-001-20250910', 'PL-GVP-003-20250909'],
    qrGenerated: true
  },
  {
    id: 'FB-MFG-002-20250908',
    productName: 'Ginger Extract',
    batchSize: 500,
    status: 'formulating',
    createdDate: '2025-09-08',
    processingLots: ['PL-GVP-002-20250908'],
    qrGenerated: false
  }
];

interface AvailableStock {
  id: string;
  facilityName: string;
  species: string;
  grade: 'A' | 'B' | 'C';
  quantity: number;
  testStatus: 'approved' | 'pending' | 'rejected';
  pricePerKg: number;
}

const mockAvailableStock: AvailableStock[] = [
  {
    id: 'PL-GVP-004-20250910',
    facilityName: 'Green Valley Processing',
    species: 'Turmeric',
    grade: 'A',
    quantity: 150,
    testStatus: 'approved',
    pricePerKg: 500
  },
  {
    id: 'PL-HTP-001-20250909',
    facilityName: 'Herbal Tech Processing',
    species: 'Ginger',
    grade: 'B',
    quantity: 200,
    testStatus: 'approved',
    pricePerKg: 400
  }
];

const statusColors = {
  formulating: '#f59e0b',
  ready: '#10b981',
  shipped: '#3b82f6'
};

const statusLabels = {
  formulating: 'Formulating',
  ready: 'Ready',
  shipped: 'Shipped'
};

const testStatusColors = {
  approved: '#10b981',
  pending: '#f59e0b',
  rejected: '#ef4444'
};

const gradeColors = {
  A: '#10b981',
  B: '#f59e0b',
  C: '#ef4444'
};

export default function ManufacturerDashboard() {
  const { userProfile } = useAuth();
  const { finalProducts } = useData();
  const approvedProcessingLots = useApprovedProcessingLots();

  const renderBatchCard = ({ item }: { item: FinalProduct }) => {
    const status = item.status === 'active' ? 'ready' : 'formulating';
    return (
    <View style={styles.batchCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.batchId}>{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[status] }]}>
          <Text style={styles.statusText}>{statusLabels[status]}</Text>
        </View>
      </View>
      
      <Text style={styles.productName}>{item.productName}</Text>
      <Text style={styles.batchSize}>{item.batchSize} units</Text>
      
      <View style={styles.lotInfo}>
        <Text style={styles.lotLabel}>Processing Lots:</Text>
        {item.processingLotIds.map((lot: string) => (
          <Text key={lot} style={styles.lotId}>{lot}</Text>
        ))}
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>Created: {new Date(item.createdAt).toLocaleDateString()}</Text>
        {item.qrCode && (
          <View style={styles.qrIndicator}>
            <QrCode size={16} color="#16a34a" />
            <Text style={styles.qrText}>QR Ready</Text>
          </View>
        )}
      </View>
    </View>
    );
  };

  const renderStockCard = ({ item }: { item: ProcessingLot }) => (
    <View style={styles.stockCard}>
      <View style={styles.stockHeader}>
        <Text style={styles.stockSpecies}>{item.species}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.gradeBadge, { backgroundColor: gradeColors['A'] }]}>
            <Text style={styles.gradeText}>Grade {item.grade || 'A'}</Text>
          </View>
          <View style={[styles.testBadge, { backgroundColor: testStatusColors[item.status === 'approved' ? 'approved' : 'pending'] }]}>
            <Text style={styles.testText}>{item.status === 'approved' ? 'approved' : 'pending'}</Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.facilityName}>{item.facilityName}</Text>
      <Text style={styles.stockQuantity}>{item.availableWeight} kg available</Text>
      <Text style={styles.stockPrice}>₹500/kg</Text>
      
      <TouchableOpacity style={styles.selectButton}>
        <Text style={styles.selectButtonText}>Select for Formulation</Text>
      </TouchableOpacity>
    </View>
  );

  const quickActions = [
    { 
      icon: Eye, 
      title: 'View Stock', 
      subtitle: 'Available materials', 
      color: '#16a34a',
      onPress: () => router.push('/manufacturer/view-stock')
    },
    { 
      icon: Beaker, 
      title: 'Create Formulation', 
      subtitle: 'New product batch', 
      color: '#059669',
      onPress: () => router.push('/manufacturer/create-formulation')
    },
    { 
      icon: QrCode, 
      title: 'Generate QR', 
      subtitle: 'Traceability codes', 
      color: '#0d9488',
      onPress: () => router.push('/manufacturer/generate-qr')
    },
    { 
      icon: Package, 
      title: 'View Provenance', 
      subtitle: 'Full supply chain', 
      color: '#0891b2',
      onPress: () => console.log('View Provenance - Not implemented yet')
    }
  ];

  const readyBatches = finalProducts.filter(product => product.status === 'active').length;
  const totalUnits = finalProducts.reduce((sum, product) => sum + product.batchSize, 0);
  const approvedStock = approvedProcessingLots.length;

  return (
    <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Hello, {userProfile?.companyName}!</Text>
          <Text style={styles.subtitleText}>Manufacturing operations</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{readyBatches}</Text>
            <Text style={styles.statLabel}>Ready Batches</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalUnits}</Text>
            <Text style={styles.statLabel}>Total Units</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{approvedStock}</Text>
            <Text style={styles.statLabel}>Approved Stock</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Final Product Batches</Text>
          
          {finalProducts.length > 0 ? (
            <FlatList
              data={finalProducts}
              renderItem={renderBatchCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.batchList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Package size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No final products yet</Text>
              <Text style={styles.emptyStateSubtext}>Create your first product formulation</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Stock</Text>
          
          {approvedProcessingLots.length > 0 ? (
            <FlatList
              data={approvedProcessingLots}
              renderItem={renderStockCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.stockList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Eye size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No approved stock available</Text>
              <Text style={styles.emptyStateSubtext}>Stock will appear here when processing facilities complete testing</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quality Alerts</Text>
          <View style={styles.alertCard}>
            <View style={styles.alertItem}>
              <AlertTriangle size={20} color="#f59e0b" />
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>Batch FB-MFG-001 expires in 30 days</Text>
                <Text style={styles.alertSubtitle}>Consider shipping or extending shelf life</Text>
              </View>
            </View>
            <View style={styles.alertItem}>
              <CheckCircle size={20} color="#10b981" />
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>All active batches are compliant</Text>
                <Text style={styles.alertSubtitle}>No quality issues detected</Text>
              </View>
            </View>
          </View>
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
  batchList: {
    paddingRight: 20,
  },
  batchCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 300,
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
    marginBottom: 8,
  },
  batchId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
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
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 4,
  },
  batchSize: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  lotInfo: {
    marginBottom: 12,
  },
  lotLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  lotId: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  qrIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  qrText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
  },
  stockList: {
    paddingRight: 20,
  },
  stockCard: {
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
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stockSpecies: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#166534',
    flex: 1,
  },
  badgeRow: {
    gap: 4,
  },
  gradeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  gradeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  testBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  testText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  facilityName: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  stockQuantity: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  stockPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 12,
  },
  selectButton: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  alertCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  alertSubtitle: {
    fontSize: 12,
    color: '#6b7280',
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