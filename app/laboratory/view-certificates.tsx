import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { QrCode, Download, Search, FileText, Calendar, Filter, CheckCircle } from 'lucide-react-native';
import { useData } from '@/providers/data-provider';

const statusColors = {
  active: '#10b981',
  revoked: '#ef4444',
  expired: '#f59e0b'
};

const statusLabels = {
  active: 'Active',
  revoked: 'Revoked',
  expired: 'Expired'
};

export default function ViewCertificates() {
  const { certificates, processingLots } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const statusFilters = [
    { id: 'all', label: 'All Certificates' },
    { id: 'active', label: 'Active' },
    { id: 'revoked', label: 'Revoked' },
    { id: 'expired', label: 'Expired' }
  ];

  const filteredCertificates = certificates.filter(cert => {
    const lot = processingLots.find(lot => lot.id === cert.processingLotId);
    const matchesSearch = cert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cert.processingLotId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (lot?.species || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || cert.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleDownloadCertificate = (certId: string) => {
    // Simulate certificate download
    console.log(`Downloading certificate: ${certId}`);
    // In a real app, this would trigger a PDF download
  };

  const renderCertificateCard = ({ item }: { item: any }) => {
    const lot = processingLots.find(lot => lot.id === item.processingLotId);
    
    return (
      <View style={styles.certificateCard}>
        <View style={styles.cardHeader}>
          <View style={styles.certificateInfo}>
            <Text style={styles.certificateId}>{item.id}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
              <Text style={styles.statusText}>{statusLabels[item.status]}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.downloadButton}
            onPress={() => handleDownloadCertificate(item.id)}
          >
            <Download size={20} color="#16a34a" />
          </TouchableOpacity>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.detailRow}>
            <Text style={styles.labelText}>Processing Lot:</Text>
            <Text style={styles.valueText}>{item.processingLotId}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.labelText}>Species:</Text>
            <Text style={styles.valueText}>{lot?.species || 'Unknown'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.labelText}>Grade:</Text>
            <Text style={styles.valueText}>Grade {lot?.grade || 'N/A'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.labelText}>Weight:</Text>
            <Text style={styles.valueText}>{lot?.availableWeight || 0} kg</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.labelText}>Issue Date:</Text>
            <Text style={styles.valueText}>
              {new Date(item.issuedAt).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.labelText}>Valid Until:</Text>
            <Text style={styles.valueText}>
              {new Date(item.expiresAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.qrCodeSection}>
            <QrCode size={16} color="#6b7280" />
            <Text style={styles.qrText}>QR: {item.qrCode}</Text>
          </View>
          
          <View style={styles.testResultsSection}>
            <CheckCircle size={16} color="#10b981" />
            <Text style={styles.testResultsText}>
              {item.testResults?.overallResult === 'approved' ? 'All Tests Passed' : 'Tests Failed'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderFilterChip = ({ item }: { item: { id: string; label: string } }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        selectedStatus === item.id && styles.filterChipSelected
      ]}
      onPress={() => setSelectedStatus(item.id)}
    >
      <Text style={[
        styles.filterChipText,
        selectedStatus === item.id && styles.filterChipTextSelected
      ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Certificates</Text>
          <Text style={styles.subtitle}>View and manage quality certificates</Text>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by certificate ID, lot ID, or species..."
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{certificates.filter(c => c.status === 'active').length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{filteredCertificates.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {Math.round((certificates.filter(c => c.status === 'active').length / Math.max(certificates.length, 1)) * 100)}%
            </Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
        </View>

        <View style={styles.filtersSection}>
          <Text style={styles.filterTitle}>Filter by Status</Text>
          <FlatList
            data={statusFilters}
            renderItem={renderFilterChip}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quality Certificates</Text>
            <View style={styles.resultCount}>
              <Filter size={16} color="#6b7280" />
              <Text style={styles.resultText}>{filteredCertificates.length} certificates</Text>
            </View>
          </View>
          
          {filteredCertificates.length > 0 ? (
            <FlatList
              data={filteredCertificates}
              renderItem={renderCertificateCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.certificatesList}
            />
          ) : (
            <View style={styles.emptyState}>
              <FileText size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No certificates found</Text>
              <Text style={styles.emptyStateSubtext}>
                Certificates will appear here after test completion
              </Text>
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <QrCode size={24} color="#3b82f6" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Certificate Authenticity</Text>
              <Text style={styles.infoText}>
                Each certificate includes a unique QR code for verification. 
                Scan the QR code to verify authenticity and view full test results.
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
  certificatesList: {
    paddingBottom: 20,
  },
  certificateCard: {
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
    marginBottom: 16,
  },
  certificateInfo: {
    flex: 1,
  },
  certificateId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  downloadButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0fdf4',
  },
  cardContent: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelText: {
    fontSize: 14,
    color: '#6b7280',
  },
  valueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  qrCodeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  qrText: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  testResultsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  testResultsText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
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