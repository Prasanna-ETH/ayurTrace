import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Package, Search, Eye, FlaskConical, Calendar, Filter, CheckCircle } from 'lucide-react-native';
import { useData, useApprovedProcessingLots, ProcessingLot } from '@/providers/data-provider';

const gradeColors = {
  premium: '#10b981',
  standard: '#f59e0b',
  low: '#ef4444'
};

export default function ManufacturerViewStock() {
  const { processingLots } = useData();
  const approvedProcessingLots = useApprovedProcessingLots();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');

  const speciesOptions = Array.from(new Set(approvedProcessingLots.map(lot => lot.species)));
  const speciesFilters = [
    { id: 'all', label: 'All Species' },
    ...speciesOptions.map(species => ({ id: species, label: species }))
  ];

  const gradeFilters = [
    { id: 'all', label: 'All Grades' },
    { id: 'premium', label: 'Premium' },
    { id: 'standard', label: 'Standard' },
    { id: 'low', label: 'Low' }
  ];

  const filteredLots = approvedProcessingLots.filter(lot => {
    const matchesSearch = lot.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lot.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lot.facilityName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecies = selectedSpecies === 'all' || lot.species === selectedSpecies;
    const matchesGrade = selectedGrade === 'all' || lot.grade === selectedGrade;
    
    return matchesSearch && matchesSpecies && matchesGrade;
  });

  const totalStock = filteredLots.reduce((sum, lot) => sum + lot.availableWeight, 0);
  const totalValue = filteredLots.reduce((sum, lot) => sum + (lot.availableWeight * 500), 0); // Assuming ₹500/kg average

  const handleSelectForFormulation = (lot: ProcessingLot) => {
    // In a real app, this would add to a formulation cart
    console.log(`Selected lot ${lot.id} for formulation`);
  };

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
          <View style={styles.approvedBadge}>
            <CheckCircle size={12} color="white" />
            <Text style={styles.approvedText}>Approved</Text>
          </View>
        </View>
      </View>

      <Text style={styles.speciesText}>{item.species}</Text>
      <Text style={styles.facilityText}>From: {item.facilityName}</Text>
      
      <View style={styles.stockDetails}>
        <View style={styles.detailRow}>
          <Package size={16} color="#6b7280" />
          <Text style={styles.detailText}>Available: {item.availableWeight} kg</Text>
        </View>
        <View style={styles.detailRow}>
          <Calendar size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            Processed: {new Date(item.updatedAt).toLocaleDateString()}
          </Text>
        </View>
        {item.testResults && (
          <View style={styles.detailRow}>
            <FlaskConical size={16} color="#10b981" />
            <Text style={[styles.detailText, { color: '#10b981' }]}>
              Lab Certified
            </Text>
          </View>
        )}
      </View>

      <View style={styles.priceSection}>
        <Text style={styles.priceText}>₹{(item.availableWeight * 500).toLocaleString()}</Text>
        <Text style={styles.pricePerKg}>₹500/kg</Text>
      </View>

      <TouchableOpacity 
        style={styles.selectButton}
        onPress={() => handleSelectForFormulation(item)}
      >
        <Text style={styles.selectButtonText}>Select for Formulation</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFilterChip = ({ item }: { item: { id: string; label: string } }, filterType: 'species' | 'grade') => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        (filterType === 'species' ? selectedSpecies : selectedGrade) === item.id && styles.filterChipSelected
      ]}
      onPress={() => filterType === 'species' ? setSelectedSpecies(item.id) : setSelectedGrade(item.id)}
    >
      <Text style={[
        styles.filterChipText,
        (filterType === 'species' ? selectedSpecies : selectedGrade) === item.id && styles.filterChipTextSelected
      ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Available Stock</Text>
          <Text style={styles.subtitle}>Approved materials ready for manufacturing</Text>
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
            <Text style={styles.statLabel}>Available Lots</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalStock.toFixed(1)}kg</Text>
            <Text style={styles.statLabel}>Total Weight</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>₹{(totalValue / 1000).toFixed(0)}K</Text>
            <Text style={styles.statLabel}>Total Value</Text>
          </View>
        </View>

        <View style={styles.filtersSection}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterTitle}>Species</Text>
            <FlatList
              data={speciesFilters}
              renderItem={(props) => renderFilterChip(props, 'species')}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterList}
            />
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterTitle}>Grade</Text>
            <FlatList
              data={gradeFilters}
              renderItem={(props) => renderFilterChip(props, 'grade')}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterList}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Raw Materials</Text>
            <View style={styles.resultCount}>
              <Filter size={16} color="#6b7280" />
              <Text style={styles.resultText}>{filteredLots.length} lots</Text>
            </View>
          </View>
          
          {filteredLots.length > 0 ? (
            <FlatList
              data={filteredLots}
              renderItem={renderLotCard}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.stockGrid}
            />
          ) : (
            <View style={styles.emptyState}>
              <Package size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No approved stock available</Text>
              <Text style={styles.emptyStateSubtext}>
                Stock will appear here when processing facilities complete testing
              </Text>
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <CheckCircle size={24} color="#10b981" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Quality Assurance</Text>
              <Text style={styles.infoText}>
                All displayed materials have passed laboratory testing and are certified 
                for use in manufacturing. Each lot includes complete traceability data.
              </Text>
            </View>
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
    textTransform: 'capitalize',
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
  stockGrid: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  lotCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '48%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    marginBottom: 8,
  },
  lotId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
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
  approvedBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  approvedText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  speciesText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 4,
  },
  facilityText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  stockDetails: {
    gap: 6,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280',
  },
  priceSection: {
    marginBottom: 12,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  pricePerKg: {
    fontSize: 12,
    color: '#6b7280',
  },
  selectButton: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
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