import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Package, Users, FlaskConical, Eye, Truck, CheckCircle, Thermometer, Droplets } from 'lucide-react-native';
import { useAuth } from '@/providers/auth-provider';

interface ProcessingLot {
  id: string;
  species: string;
  grade: 'A' | 'B' | 'C';
  quantity: number;
  status: 'received' | 'processing' | 'testing' | 'ready';
  receivedDate: string;
  aggregationId: string;
}

const mockProcessingLots: ProcessingLot[] = [
  {
    id: 'PL-GVP-001-20250910',
    species: 'Turmeric',
    grade: 'A',
    quantity: 200,
    status: 'processing',
    receivedDate: '2025-09-10',
    aggregationId: 'AGG-COL-001-20250910'
  },
  {
    id: 'PL-GVP-002-20250908',
    species: 'Ginger',
    grade: 'B',
    quantity: 150,
    status: 'testing',
    receivedDate: '2025-09-08',
    aggregationId: 'AGG-COL-002-20250908'
  }
];

const statusColors = {
  received: '#f59e0b',
  processing: '#3b82f6',
  testing: '#8b5cf6',
  ready: '#10b981'
};

const statusLabels = {
  received: 'Received',
  processing: 'Processing',
  testing: 'Lab Testing',
  ready: 'Ready'
};

const gradeColors = {
  A: '#10b981',
  B: '#f59e0b',
  C: '#ef4444'
};

export default function FacilityDashboard() {
  const { userProfile } = useAuth();
  const [processingLots] = useState<ProcessingLot[]>(mockProcessingLots);

  const renderLotCard = ({ item }: { item: ProcessingLot }) => (
    <View style={styles.lotCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.lotId}>{item.id}</Text>
        <View style={styles.badgeContainer}>
          <View style={[styles.gradeBadge, { backgroundColor: gradeColors[item.grade] }]}>
            <Text style={styles.gradeText}>Grade {item.grade}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
            <Text style={styles.statusText}>{statusLabels[item.status]}</Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.speciesText}>{item.species}</Text>
      
      <View style={styles.lotDetails}>
        <View style={styles.detailRow}>
          <Package size={16} color="#6b7280" />
          <Text style={styles.detailText}>{item.quantity} kg</Text>
        </View>
        <View style={styles.detailRow}>
          <Truck size={16} color="#6b7280" />
          <Text style={styles.detailText}>From: {item.aggregationId}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.dateText}>Received: {item.receivedDate}</Text>
        </View>
      </View>
    </View>
  );

  const quickActions = [
    { icon: Users, title: 'View Aggregators', subtitle: 'Collector details', color: '#16a34a' },
    { icon: CheckCircle, title: 'Receive Batch', subtitle: 'Acknowledge delivery', color: '#059669' },
    { icon: Thermometer, title: 'Record Processing', subtitle: 'Log processing steps', color: '#0d9488' },
    { icon: FlaskConical, title: 'Send Lab Sample', subtitle: 'Request testing', color: '#0891b2' },
    { icon: Eye, title: 'View Stock', subtitle: 'Check inventory', color: '#8b5cf6' },
    { icon: Package, title: 'View History', subtitle: 'Full provenance', color: '#f59e0b' }
  ];

  const totalStock = processingLots.reduce((sum, lot) => sum + lot.quantity, 0);
  const readyStock = processingLots.filter(lot => lot.status === 'ready').reduce((sum, lot) => sum + lot.quantity, 0);
  const processingCount = processingLots.filter(lot => lot.status === 'processing').length;

  return (
    <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Hello, {userProfile?.facilityName}!</Text>
          <Text style={styles.subtitleText}>Processing facility operations</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{processingCount}</Text>
            <Text style={styles.statLabel}>Processing</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalStock}kg</Text>
            <Text style={styles.statLabel}>Total Stock</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{readyStock}kg</Text>
            <Text style={styles.statLabel}>Ready Stock</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Processing Lots</Text>
          
          <FlatList
            data={processingLots}
            renderItem={renderLotCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.lotList}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Environmental Monitoring</Text>
          <View style={styles.monitoringCard}>
            <View style={styles.monitoringRow}>
              <View style={styles.monitoringItem}>
                <Thermometer size={24} color="#ef4444" />
                <Text style={styles.monitoringLabel}>Temperature</Text>
                <Text style={styles.monitoringValue}>22°C</Text>
              </View>
              <View style={styles.monitoringItem}>
                <Droplets size={24} color="#3b82f6" />
                <Text style={styles.monitoringLabel}>Humidity</Text>
                <Text style={styles.monitoringValue}>65%</Text>
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
                <TouchableOpacity key={action.title} style={styles.actionCard}>
                  <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                    <IconComponent size={20} color={action.color} />
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
  lotList: {
    paddingRight: 20,
  },
  lotCard: {
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  lotId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  badgeContainer: {
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
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  speciesText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 12,
  },
  lotDetails: {
    gap: 6,
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
  dateText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  monitoringCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  monitoringRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  monitoringItem: {
    alignItems: 'center',
    gap: 8,
  },
  monitoringLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  monitoringValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '31%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
});