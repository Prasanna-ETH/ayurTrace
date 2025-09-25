import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FileText, FlaskConical, CheckCircle, XCircle, Camera } from 'lucide-react-native';
import { router } from 'expo-router';
import { useData } from '@/providers/data-provider';

const testParameters = [
  { id: 'moisture', label: 'Moisture Content (%)', unit: '%', required: true, type: 'number' },
  { id: 'pesticides', label: 'Pesticide Residue', unit: 'ppm', required: true, type: 'pass_fail' },
  { id: 'heavyMetals', label: 'Heavy Metals', unit: 'ppm', required: true, type: 'pass_fail' },
  { id: 'dnaAuth', label: 'DNA Authentication', unit: '', required: false, type: 'pass_fail' },
  { id: 'microbiological', label: 'Microbiological', unit: 'cfu/g', required: false, type: 'pass_fail' },
];

export default function EnterResults() {
  const { labSamples, submitTestResults } = useData();
  const [selectedSample, setSelectedSample] = useState<any>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [overallResult, setOverallResult] = useState<'approved' | 'rejected' | ''>('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingSamples = labSamples.filter(sample => 
    sample.status === 'pending' || sample.status === 'testing'
  );

  const handleResultChange = (paramId: string, value: any) => {
    setTestResults(prev => ({
      ...prev,
      [paramId]: value
    }));
  };

  const handleTakePhoto = () => {
    // Simulate photo capture
    const photoUrl = `https://picsum.photos/400/300?random=${Date.now()}`;
    setPhotos(prev => [...prev, photoUrl]);
    Alert.alert('Photo Captured', 'Test result photo has been captured successfully');
  };

  const calculateOverallResult = () => {
    const requiredTests = testParameters.filter(param => param.required);
    const allRequiredPassed = requiredTests.every(param => {
      const result = testResults[param.id];
      if (param.type === 'pass_fail') {
        return result === 'pass';
      } else if (param.type === 'number') {
        return result !== undefined && result !== '';
      }
      return true;
    });

    return allRequiredPassed ? 'approved' : 'rejected';
  };

  const handleSubmit = async () => {
    if (!selectedSample) {
      Alert.alert('Missing Selection', 'Please select a sample to enter results for.');
      return;
    }

    const requiredTests = testParameters.filter(param => param.required);
    const missingRequired = requiredTests.filter(param => {
      const result = testResults[param.id];
      return result === undefined || result === '';
    });

    if (missingRequired.length > 0) {
      Alert.alert(
        'Missing Required Tests', 
        `Please complete all required tests: ${missingRequired.map(t => t.label).join(', ')}`
      );
      return;
    }

    const calculatedResult = calculateOverallResult();
    
    setIsSubmitting(true);
    try {
      await submitTestResults(selectedSample.id, {
        testResults,
        overallResult: overallResult || calculatedResult,
        notes: notes.trim(),
        photos: photos,
        completedAt: new Date().toISOString(),
      });

      Alert.alert(
        'Success!', 
        `Test results for sample ${selectedSample.id} have been submitted successfully.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error submitting test results:', error);
      Alert.alert('Error', 'Failed to submit test results. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSampleCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.sampleCard,
        selectedSample?.id === item.id && styles.sampleCardSelected
      ]}
      onPress={() => setSelectedSample(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.sampleId}>{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'pending' ? '#f59e0b' : '#3b82f6' }]}>
          <Text style={styles.statusText}>{item.status === 'pending' ? 'Pending' : 'Testing'}</Text>
        </View>
      </View>

      <Text style={styles.sampleDetails}>Sample: {item.sampleId}</Text>
      <Text style={styles.sampleDetails}>Weight: {item.sampleWeight} kg</Text>
      <Text style={styles.sampleDetails}>
        Received: {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  const renderTestParameter = ({ item }: { item: typeof testParameters[0] }) => (
    <View style={styles.parameterCard}>
      <Text style={styles.parameterLabel}>
        {item.label}
        {item.required && ' *'}
        {item.unit && ` (${item.unit})`}
      </Text>
      
      {item.type === 'number' ? (
        <TextInput
          style={styles.numberInput}
          value={testResults[item.id]?.toString() || ''}
          onChangeText={(text) => handleResultChange(item.id, parseFloat(text) || undefined)}
          placeholder="Enter value"
          keyboardType="numeric"
          placeholderTextColor="#9ca3af"
        />
      ) : (
        <View style={styles.passFailContainer}>
          <TouchableOpacity
            style={[
              styles.passFailButton,
              styles.passButton,
              testResults[item.id] === 'pass' && styles.passButtonSelected
            ]}
            onPress={() => handleResultChange(item.id, 'pass')}
          >
            <CheckCircle size={20} color={testResults[item.id] === 'pass' ? 'white' : '#10b981'} />
            <Text style={[
              styles.passFailText,
              testResults[item.id] === 'pass' && styles.passFailTextSelected
            ]}>
              Pass
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.passFailButton,
              styles.failButton,
              testResults[item.id] === 'fail' && styles.failButtonSelected
            ]}
            onPress={() => handleResultChange(item.id, 'fail')}
          >
            <XCircle size={20} color={testResults[item.id] === 'fail' ? 'white' : '#ef4444'} />
            <Text style={[
              styles.passFailText,
              testResults[item.id] === 'fail' && styles.passFailTextSelected
            ]}>
              Fail
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Enter Test Results</Text>
          <Text style={styles.subtitle}>Input test data and analysis results</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Sample</Text>
          {pendingSamples.length > 0 ? (
            <FlatList
              data={pendingSamples}
              renderItem={renderSampleCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              style={styles.sampleList}
            />
          ) : (
            <View style={styles.emptyState}>
              <FlaskConical size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No samples pending testing</Text>
              <Text style={styles.emptyStateSubtext}>New samples will appear here</Text>
            </View>
          )}
        </View>

        {selectedSample && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Test Parameters</Text>
              <FlatList
                data={testParameters}
                renderItem={renderTestParameter}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.parametersList}
              />
              <Text style={styles.helperText}>* Required parameters must be completed</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Overall Result</Text>
              <View style={styles.overallResultContainer}>
                <TouchableOpacity
                  style={[
                    styles.overallButton,
                    styles.approvedButton,
                    overallResult === 'approved' && styles.approvedButtonSelected
                  ]}
                  onPress={() => setOverallResult('approved')}
                >
                  <CheckCircle size={24} color={overallResult === 'approved' ? 'white' : '#10b981'} />
                  <Text style={[
                    styles.overallButtonText,
                    overallResult === 'approved' && styles.overallButtonTextSelected
                  ]}>
                    Approved
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.overallButton,
                    styles.rejectedButton,
                    overallResult === 'rejected' && styles.rejectedButtonSelected
                  ]}
                  onPress={() => setOverallResult('rejected')}
                >
                  <XCircle size={24} color={overallResult === 'rejected' ? 'white' : '#ef4444'} />
                  <Text style={[
                    styles.overallButtonText,
                    overallResult === 'rejected' && styles.overallButtonTextSelected
                  ]}>
                    Rejected
                  </Text>
                </TouchableOpacity>
              </View>
              
              {!overallResult && (
                <Text style={styles.autoResultText}>
                  Result will be auto-calculated based on test parameters
                </Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Notes</Text>
              
              <View style={styles.inputGroup}>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Enter detailed test observations and notes..."
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.photoSection}>
                <Text style={styles.inputLabel}>Test Result Photos</Text>
                <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
                  <Camera size={24} color="#16a34a" />
                  <Text style={styles.photoButtonText}>Take Photo</Text>
                </TouchableOpacity>
                {photos.length > 0 && (
                  <Text style={styles.photoCount}>{photos.length} photo(s) captured</Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Submitting...' : 'Submit Test Results'}
              </Text>
            </TouchableOpacity>
          </>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 16,
  },
  sampleList: {
    maxHeight: 200,
  },
  sampleCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sampleCardSelected: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sampleId: {
    fontSize: 16,
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
  sampleDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  parametersList: {
    paddingBottom: 16,
  },
  parameterCard: {
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
  parameterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  numberInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  passFailContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  passFailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    borderWidth: 2,
  },
  passButton: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
  },
  passButtonSelected: {
    backgroundColor: '#10b981',
  },
  failButton: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  failButtonSelected: {
    backgroundColor: '#ef4444',
  },
  passFailText: {
    fontSize: 16,
    fontWeight: '600',
  },
  passFailTextSelected: {
    color: 'white',
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 8,
  },
  overallResultContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  overallButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
  },
  approvedButton: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
  },
  approvedButtonSelected: {
    backgroundColor: '#10b981',
  },
  rejectedButton: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  rejectedButtonSelected: {
    backgroundColor: '#ef4444',
  },
  overallButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  overallButtonTextSelected: {
    color: 'white',
  },
  autoResultText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  photoSection: {
    marginBottom: 16,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: '#16a34a',
    borderStyle: 'dashed',
  },
  photoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16a34a',
  },
  photoCount: {
    fontSize: 14,
    color: '#10b981',
    marginTop: 8,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
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