import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Package, Search, Eye, FlaskConical, Calendar, Filter } from 'lucide-react-native';
import { useData, ProcessingLot } from '@/providers/data-provider';

const statusColors = {
  received: '#f59e0b',
  processing: '#3b82f6',
  completed: '#10b981',
  'lab-testing': '#8b5cf6',
  approved: '#16a34a',
  rejected: '#ef4444'
};

const statusLabels = {
  received: 'Received',
  processing: 'Processing',
  completed: 'Completed',
  'lab-testing': 'Lab Testing',
  approved: 'Approved',
  rejected: 'Rejected'
};

const gradeColors = {
  premium: '#10b981',
  standard: '#f59e0b',
  low: '#ef4444'
};

export default function ViewStock() {
  const { processingLots } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');

  const statusFilters = [
    { id: 'all', label: 'All Status' },
    { id: 'received', label: 'Received' },
    { id: 'processing', label: 'Processing' },
    { id: 'completed', label: 'Completed' },
    { id: 'lab-testing', label: 'Lab Testing' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' }
  ];

  const speciesOptions = Array.from(new Set(processingLots.map(lot => lot.species)));
  const speciesFilters = [
    { id: 'all', label: 'All Species' },
    ...speciesOptions.map(species => ({ id: species, label: species }))
  ];

  const filteredLots = processingLots.filter(lot => {
    const matchesSearch = lot.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lot.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lot.facilityName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || lot.status === selectedStatus;
    const matchesSpecies = selectedSpecies === 'all' || lot.species === selectedSpecies;
    
    return matchesSearch && matchesStatus && matchesSpecies;
  });

  const totalStock = filteredLots.reduce((sum, lot) => sum + lot.availableWeight, 0);
  const totalValue = filteredLots.reduce((sum, lot) => sum + (lot.availableWeight * 500), 0); // Assuming ₹500/kg average

  const renderLotCard = ({ item }: { item: ProcessingLot }) => (
    <View style={styles.lotCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.lotId}>{item.id}</Text>
        <View style={styles.badgeContainer}>
          {item.grade && (
            <View style={[styles.gradeBadge, { backgroundColor: gradeColors[item.grade] }]}>
              <Text style={styles.gradeText}>{item.grade}</Text>
            </View>
          )}
          <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
            <Text style={styles.statusText}>{statusLabels[item.status]}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.speciesText}>{item.species}</Text>
      
      <View style={styles.stockDetails}>
        <View style={styles.detailRow}>
          <Package size={16} color="#6b7280" />
          <Text style={styles.detailText}>Available: {item.availableWeight} kg</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailText}>Total: {item.totalWeight} kg</Text>
        </View>
        <View style={styles.detailRow}>
          <Calendar size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            Received: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        {item.processingSteps.length > 0 && (
          <View style={styles.detailRow}>
            <Text style={styles.detailText}>
              {item.processingSteps.length} processing steps
            </Text>
          </View>
        )}
        {item.testResults && (
          <View style={styles.detailRow}>
            <FlaskConical size={16} color="#10b981" />
            <Text style={[styles.detailText, { color: '#10b981' }]}>
              Test Results Available
            </Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.valueText}>
          Est. Value: ₹{(item.availableWeight * 500).toLocaleString()}
        </Text>
        <TouchableOpacity style={styles.viewButton}>
          <Eye size={16} color="#16a34a" />
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFilterChip = ({ item }: { item: { id: string; label: string } }, isStatus: boolean) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        (isStatus ? selectedStatus : selectedSpecies) === item.id && styles.filterChipSelected
      ]}
      onPress={() => isStatus ? setSelectedStatus(item.id) : setSelectedSpecies(item.id)}
    >
      <Text style={[
        styles.filterChipText,
        (isStatus ? selectedStatus : selectedSpecies) === item.id && styles.filterChipTextSelected
      ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Stock Inventory</Text>
          <Text style={styles.subtitle}>View and manage processing lots</Text>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by ID, species, or facility..."
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{filteredLots.length}</Text>
            <Text style={styles.statLabel}>Total Lots</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalStock.toFixed(1)}kg</Text>
            <Text style={styles.statLabel}>Total Stock</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>₹{(totalValue / 1000).toFixed(0)}K</Text>
            <Text style={styles.statLabel}>Est. Value</Text>
          </View>
        </View>

        <View style={styles.filtersSection}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterTitle}>Status</Text>
            <FlatList
              data={statusFilters}
              renderItem={(props) => renderFilterChip(props, true)}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterList}
            />
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterTitle}>Species</Text>
            <FlatList
              data={speciesFilters}
              renderItem={(props) => renderFilterChip(props, false)}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterList}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Stock Items</Text>
            <View style={styles.resultCount}>
              <Filter size={16} color="#6b7280" />
              <Text style={styles.resultText}>{filteredLots.length} items</Text>
            </View>
          </View>
          
          {filteredLots.length > 0 ? (
            <FlatList
              data={filteredLots}
              renderItem={renderLotCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.lotsList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Package size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No stock items found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your search or filters
              </Text>
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
  searchSection: {
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
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
  filtersSection: {
    marginBottom: 24,
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  filterList: {
    paddingRight: 20,
  },
  filterChip: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipSelected: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  filterChipText: {
    fontSize: 14,
    color: '#6b7280',
  },
  filterChipTextSelected: {
    color: 'white',
    fontWeight: '600',
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
  resultCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resultText: {
    fontSize: 14,
    color: '#6b7280',
  },
  lotsList: {
    paddingBottom: 20,
  },
  lotCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    flexDirection: 'row',
    gap: 4,
  },
  gradeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  gradeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
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
  stockDetails: {
    gap: 6,
    marginBottom: 16,
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
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  valueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '600',
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
});