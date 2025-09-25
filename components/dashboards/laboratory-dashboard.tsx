import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FlaskConical, FileText, Building2, QrCode, Download } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/providers/auth-provider';
import { useData } from '@/providers/data-provider';

interface TestRequest {
  id: string;
  sampleId: string;
  facilityName: string;
  species: string;
  requestDate: string;
  status: 'pending' | 'testing' | 'completed';
  testResults?: {
    moisture: number;
    pesticides: 'pass' | 'fail';
    heavyMetals: 'pass' | 'fail';
    dnaAuth: 'pass' | 'fail';
    overallResult: 'approved' | 'rejected';
  };
}

const mockTestRequests: TestRequest[] = [
  {
    id: 'LAB-REQ-001-20250910',
    sampleId: 'PL-GVP-001-20250910',
    facilityName: 'Green Valley Processing',
    species: 'Turmeric',
    requestDate: '2025-09-10',
    status: 'testing'
  },
  {
    id: 'LAB-REQ-002-20250908',
    sampleId: 'PL-GVP-002-20250908',
    facilityName: 'Herbal Tech Facility',
    species: 'Ginger',
    requestDate: '2025-09-08',
    status: 'completed',
    testResults: {
      moisture: 12.5,
      pesticides: 'pass',
      heavyMetals: 'pass',
      dnaAuth: 'pass',
      overallResult: 'approved'
    }
  }
];

const statusColors = {
  pending: '#f59e0b',
  testing: '#3b82f6',
  completed: '#10b981'
};

const statusLabels = {
  pending: 'Pending',
  testing: 'Testing',
  completed: 'Completed'
};

const resultColors = {
  approved: '#10b981',
  rejected: '#ef4444',
  pass: '#10b981',
  fail: '#ef4444'
};

export default function LaboratoryDashboard() {
  const { userProfile } = useAuth();
  const { labSamples, processingLots, certificates } = useData();

  const quickActions = [
    { 
      icon: Building2, 
      title: 'View Facilities', 
      subtitle: 'Processing facilities', 
      color: '#16a34a',
      onPress: () => console.log('View Facilities - Not implemented yet')
    },
    { 
      icon: FlaskConical, 
      title: 'Link Sample', 
      subtitle: 'Scan QR code', 
      color: '#059669',
      onPress: () => router.push('/laboratory/link-sample')
    },
    { 
      icon: FileText, 
      title: 'Enter Results', 
      subtitle: 'Input test data', 
      color: '#0d9488',
      onPress: () => router.push('/laboratory/enter-results')
    },
    { 
      icon: QrCode, 
      title: 'Certificates', 
      subtitle: 'View CoAs', 
      color: '#0891b2',
      onPress: () => router.push('/laboratory/view-certificates')
    }
  ];

  const pendingTests = labSamples.filter(sample => sample.status === 'pending').length;
  const activeTests = labSamples.filter(sample => sample.status === 'testing').length;
  const completedTests = labSamples.filter(sample => sample.status === 'completed').length;

  return (
    <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Hello, {userProfile?.labName}!</Text>
          <Text style={styles.subtitleText}>Laboratory testing operations</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{pendingTests}</Text>
            <Text style={styles.statLabel}>Pending Tests</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{activeTests}</Text>
            <Text style={styles.statLabel}>Active Tests</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedTests}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lab Samples</Text>
          
          {labSamples.length > 0 ? (
            <FlatList
              data={labSamples}
              renderItem={({ item }) => {
                const lot = processingLots.find(lot => lot.id === item.processingLotId);
                return (
                  <View style={styles.testCard}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.testId}>{item.id}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
                        <Text style={styles.statusText}>{statusLabels[item.status]}</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.speciesText}>{lot?.species || 'Unknown'}</Text>
                    <Text style={styles.facilityText}>From: {lot?.facilityName || 'Unknown Facility'}</Text>
                    <Text style={styles.sampleText}>Sample: {item.processingLotId}</Text>
                    <Text style={styles.sampleText}>Weight: {item.sampleWeight}kg</Text>
                    
                    {item.testResults && (
                      <View style={styles.resultsContainer}>
                        <Text style={styles.resultsTitle}>Test Results:</Text>
                        <View style={styles.resultRow}>
                          <Text style={styles.resultLabel}>Moisture:</Text>
                          <Text style={styles.resultValue}>{item.testResults.moisture}%</Text>
                        </View>
                        <View style={styles.resultRow}>
                          <Text style={styles.resultLabel}>Pesticides:</Text>
                          <Text style={[styles.resultValue, { color: item.testResults.pesticides.detected ? '#ef4444' : '#10b981' }]}>
                            {item.testResults.pesticides.detected ? 'DETECTED' : 'PASS'}
                          </Text>
                        </View>
                        <View style={styles.resultRow}>
                          <Text style={styles.resultLabel}>Heavy Metals:</Text>
                          <Text style={[styles.resultValue, { color: item.testResults.heavyMetals.detected ? '#ef4444' : '#10b981' }]}>
                            {item.testResults.heavyMetals.detected ? 'DETECTED' : 'PASS'}
                          </Text>
                        </View>
                        <View style={styles.overallResult}>
                          <Text style={[styles.overallText, { color: resultColors[item.testResults.overallResult] }]}>
                            {item.testResults.overallResult.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    )}
                    
                    <Text style={styles.dateText}>Created: {new Date(item.createdAt).toLocaleDateString()}</Text>
                  </View>
                );
              }}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.testList}
            />
          ) : (
            <View style={styles.emptyState}>
              <FlaskConical size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No lab samples yet</Text>
              <Text style={styles.emptyStateSubtext}>Samples will appear here when facilities send them for testing</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Certificates</Text>
          <View style={styles.certificateCard}>
            {certificates.length > 0 ? (
              certificates.slice(0, 3).map((cert) => {
                const lot = processingLots.find(lot => lot.id === cert.processingLotId);
                return (
                  <View key={cert.id} style={styles.certificateItem}>
                    <View style={styles.certificateInfo}>
                      <Text style={styles.certificateId}>{cert.id}</Text>
                      <Text style={styles.certificateSpecies}>{lot?.species || 'Unknown'} - Grade {lot?.grade || 'N/A'}</Text>
                      <Text style={styles.certificateStatus}>✓ {cert.status === 'active' ? 'Active' : 'Revoked'}</Text>
                    </View>
                    <TouchableOpacity style={styles.downloadButton}>
                      <Download size={16} color="#16a34a" />
                    </TouchableOpacity>
                  </View>
                );
              })
            ) : (
              <Text style={styles.noActivityText}>No certificates issued yet</Text>
            )}
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
  testList: {
    paddingRight: 20,
  },
  testCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 320,
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
  testId: {
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
  speciesText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 4,
  },
  facilityText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  sampleText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 12,
  },
  resultsContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  resultLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  resultValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  overallResult: {
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  overallText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  certificateCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  certificateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  certificateInfo: {
    flex: 1,
  },
  certificateId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  certificateSpecies: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  certificateStatus: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 2,
  },
  downloadButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0fdf4',
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
  noActivityText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
});