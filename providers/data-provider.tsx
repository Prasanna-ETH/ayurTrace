import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './auth-provider';

// Data Types
export interface FarmerBatch {
  id: string;
  farmerId: string;
  farmerName: string;
  species: string;
  seedQuantity: number;
  plantingDate: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  photos: string[];
  status: 'planting' | 'ongoing' | 'harvested' | 'sold';
  careEvents: CareEvent[];
  harvestData?: HarvestData;
  paymentAmount?: number;
  paymentStatus?: 'pending' | 'paid';
  createdAt: string;
  updatedAt: string;
}

export interface CareEvent {
  id: string;
  batchId: string;
  type: 'watering' | 'fertilizing' | 'weeding' | 'other';
  notes: string;
  voiceNote?: string;
  photos: string[];
  date: string;
  createdAt: string;
}

export interface HarvestData {
  weight: number;
  moisture: number;
  photos: string[];
  harvestDate: string;
  quality: 'premium' | 'standard' | 'low';
}

export interface AggregationBatch {
  id: string;
  collectorId: string;
  collectorName: string;
  farmerBatches: string[]; // Array of farmer batch IDs
  totalWeight: number;
  totalValue: number;
  pricePerKg: number;
  status: 'collecting' | 'in-transit' | 'delivered';
  destination?: string;
  facilityId?: string;
  transportData?: TransportData;
  createdAt: string;
  updatedAt: string;
}

export interface TransportData {
  startTime: string;
  endTime?: string;
  route: {
    latitude: number;
    longitude: number;
    timestamp: string;
  }[];
  sensorData: {
    temperature: number;
    humidity: number;
    timestamp: string;
  }[];
  deliveryPhoto?: string;
}

export interface ProcessingLot {
  id: string;
  facilityId: string;
  facilityName: string;
  aggregationBatchIds: string[];
  species: string;
  totalWeight: number;
  receivedWeight: number;
  status: 'received' | 'processing' | 'completed' | 'lab-testing' | 'approved' | 'rejected';
  processingSteps: ProcessingStep[];
  labSampleId?: string;
  testResults?: TestResults;
  grade?: 'premium' | 'standard' | 'low';
  availableWeight: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessingStep {
  id: string;
  lotId: string;
  step: 'cleaning' | 'drying' | 'grinding' | 'packaging';
  temperature?: number;
  humidity?: number;
  duration: number;
  photos: string[];
  notes: string;
  timestamp: string;
}

export interface LabSample {
  id: string;
  processingLotId: string;
  facilityId: string;
  labId: string;
  sampleWeight: number;
  samplePhoto?: string;
  status: 'pending' | 'testing' | 'completed';
  testResults?: TestResults;
  certificateId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestResults {
  moisture: number;
  pesticides: {
    detected: boolean;
    values: { name: string; value: number; limit: number; pass: boolean }[];
  };
  heavyMetals: {
    detected: boolean;
    values: { name: string; value: number; limit: number; pass: boolean }[];
  };
  dnaAuthentication: boolean;
  overallResult: 'pass' | 'fail';
  reportPdf?: string;
  reportPhotos: string[];
  testedBy: string;
  testDate: string;
}

export interface Certificate {
  id: string;
  sampleId: string;
  processingLotId: string;
  qrCode: string;
  issuedBy: string;
  issuedDate: string;
  validUntil: string;
  status: 'active' | 'revoked';
}

export interface FinalProduct {
  id: string;
  manufacturerId: string;
  manufacturerName: string;
  processingLotIds: string[];
  productName: string;
  batchSize: number;
  excipients?: string[];
  qrCode: string;
  provenanceChain: ProvenanceData;
  status: 'active' | 'recalled';
  createdAt: string;
  updatedAt: string;
}

export interface ProvenanceData {
  farmers: { id: string; name: string; batches: string[] }[];
  collectors: { id: string; name: string; aggregations: string[] }[];
  facilities: { id: string; name: string; lots: string[] }[];
  labs: { id: string; name: string; tests: string[] }[];
  manufacturer: { id: string; name: string };
  timeline: {
    event: string;
    date: string;
    actor: string;
    details: any;
  }[];
}

interface DataState {
  farmerBatches: FarmerBatch[];
  aggregationBatches: AggregationBatch[];
  processingLots: ProcessingLot[];
  labSamples: LabSample[];
  certificates: Certificate[];
  finalProducts: FinalProduct[];
  farmers: FarmerProfile[];
  aggregationCart: string[];
  isLoading: boolean;
}

export interface FarmerProfile {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  location: string;
  nmpbLicense: string;
  gacpCertificate: string;
  cultivationLicense: string;
  preferredLanguage: string;
}

export const [DataProvider, useData] = createContextHook(() => {
  const { userProfile, selectedRole } = useAuth();
  const [dataState, setDataState] = useState<DataState>({
    farmerBatches: [],
    aggregationBatches: [],
    processingLots: [],
    labSamples: [],
    certificates: [],
    finalProducts: [],
    farmers: [],
    aggregationCart: [],
    isLoading: true,
  });

  // Load data from AsyncStorage
  const loadData = useCallback(async () => {
    try {
      const keys = [
        'farmerBatches',
        'aggregationBatches', 
        'processingLots',
        'labSamples',
        'certificates',
        'finalProducts',
        'farmers',
        'aggregationCart'
      ];
      
      const results = await AsyncStorage.multiGet(keys);
      const loadedData: Partial<DataState> = {};
      
      results.forEach(([key, value]) => {
        if (value) {
          loadedData[key as keyof DataState] = JSON.parse(value);
        }
      });
      
      setDataState(prev => ({ ...prev, ...loadedData, isLoading: false }));
    } catch (error) {
      console.error('Error loading data:', error);
      setDataState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Save data to AsyncStorage
  const saveData = useCallback(async (key: keyof DataState, data: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Initialize sample data after loading
    const initSampleData = async () => {
      const existingFarmers = await AsyncStorage.getItem('farmers');
      const existingBatches = await AsyncStorage.getItem('farmerBatches');
      
      if (!existingFarmers) {
        const sampleFarmers: FarmerProfile[] = [
          {
            id: 'farmer-1',
            fullName: 'Rajesh Kumar',
            mobile: '+91 9876543210',
            email: 'rajesh.kumar@example.com',
            location: 'Mysore, Karnataka',
            nmpbLicense: 'NMPB/KAR/2023/001',
            gacpCertificate: 'GACP/2023/RK001',
            cultivationLicense: 'CL/KAR/2023/001',
            preferredLanguage: 'Kannada'
          },
          {
            id: 'farmer-2',
            fullName: 'Priya Sharma',
            mobile: '+91 9876543211',
            email: 'priya.sharma@example.com',
            location: 'Coorg, Karnataka',
            nmpbLicense: 'NMPB/KAR/2023/002',
            gacpCertificate: 'GACP/2023/PS002',
            cultivationLicense: 'CL/KAR/2023/002',
            preferredLanguage: 'English'
          },
          {
            id: 'farmer-3',
            fullName: 'Suresh Reddy',
            mobile: '+91 9876543212',
            email: 'suresh.reddy@example.com',
            location: 'Bangalore Rural, Karnataka',
            nmpbLicense: 'NMPB/KAR/2023/003',
            gacpCertificate: 'GACP/2023/SR003',
            cultivationLicense: 'CL/KAR/2023/003',
            preferredLanguage: 'Telugu'
          }
        ];
        
        setDataState(prev => ({ ...prev, farmers: sampleFarmers }));
        await saveData('farmers', sampleFarmers);
      }
      
      if (!existingBatches) {
        const sampleBatches: FarmerBatch[] = [
          {
            id: 'FAR-20250910-001',
            farmerId: 'farmer-1',
            farmerName: 'Rajesh Kumar',
            species: 'Turmeric',
            seedQuantity: 50,
            plantingDate: '2024-06-15',
            location: {
              latitude: 12.2958,
              longitude: 76.6394,
              address: 'Mysore, Karnataka'
            },
            photos: ['https://picsum.photos/400/300?random=1'],
            status: 'harvested',
            careEvents: [
              {
                id: 'CARE-001',
                batchId: 'FAR-20250910-001',
                type: 'watering',
                notes: 'Regular watering completed',
                photos: [],
                date: '2024-07-01',
                createdAt: '2024-07-01T10:00:00Z'
              }
            ],
            harvestData: {
              weight: 120,
              moisture: 12,
              photos: ['https://picsum.photos/400/300?random=2'],
              harvestDate: '2024-09-01',
              quality: 'premium'
            },
            createdAt: '2024-06-15T08:00:00Z',
            updatedAt: '2024-09-01T16:00:00Z'
          },
          {
            id: 'FAR-20250910-002',
            farmerId: 'farmer-2',
            farmerName: 'Priya Sharma',
            species: 'Cardamom',
            seedQuantity: 30,
            plantingDate: '2024-05-20',
            location: {
              latitude: 12.3375,
              longitude: 75.7139,
              address: 'Coorg, Karnataka'
            },
            photos: ['https://picsum.photos/400/300?random=3'],
            status: 'harvested',
            careEvents: [],
            harvestData: {
              weight: 85,
              moisture: 10,
              photos: ['https://picsum.photos/400/300?random=4'],
              harvestDate: '2024-08-25',
              quality: 'standard'
            },
            createdAt: '2024-05-20T09:00:00Z',
            updatedAt: '2024-08-25T14:00:00Z'
          },
          {
            id: 'FAR-20250910-003',
            farmerId: 'farmer-3',
            farmerName: 'Suresh Reddy',
            species: 'Black Pepper',
            seedQuantity: 25,
            plantingDate: '2024-04-10',
            location: {
              latitude: 13.0827,
              longitude: 80.2707,
              address: 'Bangalore Rural, Karnataka'
            },
            photos: ['https://picsum.photos/400/300?random=5'],
            status: 'ongoing',
            careEvents: [
              {
                id: 'CARE-002',
                batchId: 'FAR-20250910-003',
                type: 'fertilizing',
                notes: 'Applied organic fertilizer',
                photos: [],
                date: '2024-06-15',
                createdAt: '2024-06-15T11:00:00Z'
              }
            ],
            createdAt: '2024-04-10T07:00:00Z',
            updatedAt: '2024-06-15T11:00:00Z'
          }
        ];
        
        setDataState(prev => ({ ...prev, farmerBatches: sampleBatches }));
        await saveData('farmerBatches', sampleBatches);
      }
    };
    
    initSampleData();
  }, [loadData, saveData]);



  // Generate unique IDs
  const generateId = useCallback((prefix: string) => {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${date}-${random}`;
  }, []);

  // Farmer Actions
  const createBatch = useCallback(async (batchData: Omit<FarmerBatch, 'id' | 'farmerId' | 'farmerName' | 'status' | 'careEvents' | 'createdAt' | 'updatedAt'>) => {
    if (!userProfile || selectedRole !== 'farmer') return;
    
    const newBatch: FarmerBatch = {
      ...batchData,
      id: generateId('FAR'),
      farmerId: userProfile.id || 'farmer-1',
      farmerName: userProfile.fullName,
      status: 'planting',
      careEvents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedBatches = [...dataState.farmerBatches, newBatch];
    setDataState(prev => ({ ...prev, farmerBatches: updatedBatches }));
    await saveData('farmerBatches', updatedBatches);
    
    return newBatch;
  }, [userProfile, selectedRole, dataState.farmerBatches, generateId, saveData]);

  const addCareEvent = useCallback(async (batchId: string, careData: Omit<CareEvent, 'id' | 'batchId' | 'createdAt'>) => {
    const careEvent: CareEvent = {
      ...careData,
      id: generateId('CARE'),
      batchId,
      createdAt: new Date().toISOString(),
    };
    
    const updatedBatches = dataState.farmerBatches.map(batch => {
      if (batch.id === batchId) {
        return {
          ...batch,
          careEvents: [...batch.careEvents, careEvent],
          status: 'ongoing' as const,
          updatedAt: new Date().toISOString(),
        };
      }
      return batch;
    });
    
    setDataState(prev => ({ ...prev, farmerBatches: updatedBatches }));
    await saveData('farmerBatches', updatedBatches);
    
    return careEvent;
  }, [dataState.farmerBatches, generateId, saveData]);

  const recordHarvest = useCallback(async (batchId: string, harvestData: HarvestData) => {
    const updatedBatches = dataState.farmerBatches.map(batch => {
      if (batch.id === batchId) {
        return {
          ...batch,
          harvestData,
          status: 'harvested' as const,
          updatedAt: new Date().toISOString(),
        };
      }
      return batch;
    });
    
    setDataState(prev => ({ ...prev, farmerBatches: updatedBatches }));
    await saveData('farmerBatches', updatedBatches);
  }, [dataState.farmerBatches, saveData]);

  // Collector Actions
  const createAggregation = useCallback(async (farmerBatchIds: string[], pricePerKg: number, destination?: string, facilityId?: string) => {
    if (!userProfile || selectedRole !== 'collector') return;
    
    const selectedBatches = dataState.farmerBatches.filter(batch => 
      farmerBatchIds.includes(batch.id) && batch.status === 'harvested'
    );
    
    const totalWeight = selectedBatches.reduce((sum, batch) => 
      sum + (batch.harvestData?.weight || 0), 0
    );
    
    const newAggregation: AggregationBatch = {
      id: generateId('AGG'),
      collectorId: userProfile.id || 'collector-1',
      collectorName: userProfile.fullName,
      farmerBatches: farmerBatchIds,
      totalWeight,
      totalValue: totalWeight * pricePerKg,
      pricePerKg,
      status: 'collecting',
      destination,
      facilityId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Update farmer batches to sold status
    const updatedFarmerBatches = dataState.farmerBatches.map(batch => {
      if (farmerBatchIds.includes(batch.id)) {
        return {
          ...batch,
          status: 'sold' as const,
          paymentAmount: (batch.harvestData?.weight || 0) * pricePerKg,
          paymentStatus: 'pending' as const,
          updatedAt: new Date().toISOString(),
        };
      }
      return batch;
    });
    
    const updatedAggregations = [...dataState.aggregationBatches, newAggregation];
    
    setDataState(prev => ({ 
      ...prev, 
      farmerBatches: updatedFarmerBatches,
      aggregationBatches: updatedAggregations 
    }));
    
    await saveData('farmerBatches', updatedFarmerBatches);
    await saveData('aggregationBatches', updatedAggregations);
    
    return newAggregation;
  }, [userProfile, selectedRole, dataState.farmerBatches, dataState.aggregationBatches, generateId, saveData]);

  const updateTransport = useCallback(async (aggregationId: string, transportData: Partial<TransportData>) => {
    const updatedAggregations = dataState.aggregationBatches.map(agg => {
      if (agg.id === aggregationId) {
        const newStatus: AggregationBatch['status'] = transportData.endTime ? 'delivered' : 'in-transit';
        return {
          ...agg,
          transportData: { ...agg.transportData, ...transportData } as TransportData,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
      }
      return agg;
    });
    
    setDataState(prev => ({ ...prev, aggregationBatches: updatedAggregations }));
    await saveData('aggregationBatches', updatedAggregations);
  }, [dataState.aggregationBatches, saveData]);

  // Processing Facility Actions
  const receiveAggregation = useCallback(async (aggregationId: string, receivedWeight: number) => {
    if (!userProfile || selectedRole !== 'facility') return;
    
    const aggregation = dataState.aggregationBatches.find(agg => agg.id === aggregationId);
    if (!aggregation) return;
    
    const newProcessingLot: ProcessingLot = {
      id: generateId('PL'),
      facilityId: userProfile.id || 'facility-1',
      facilityName: userProfile.facilityName || userProfile.fullName,
      aggregationBatchIds: [aggregationId],
      species: 'Mixed', // Could be determined from farmer batches
      totalWeight: aggregation.totalWeight,
      receivedWeight,
      status: 'received',
      processingSteps: [],
      availableWeight: receivedWeight,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedLots = [...dataState.processingLots, newProcessingLot];
    setDataState(prev => ({ ...prev, processingLots: updatedLots }));
    await saveData('processingLots', updatedLots);
    
    return newProcessingLot;
  }, [userProfile, selectedRole, dataState.aggregationBatches, dataState.processingLots, generateId, saveData]);

  const addProcessingStep = useCallback(async (lotId: string, stepData: Omit<ProcessingStep, 'id' | 'lotId' | 'timestamp'>) => {
    const step: ProcessingStep = {
      ...stepData,
      id: generateId('STEP'),
      lotId,
      timestamp: new Date().toISOString(),
    };
    
    const updatedLots = dataState.processingLots.map(lot => {
      if (lot.id === lotId) {
        return {
          ...lot,
          processingSteps: [...lot.processingSteps, step],
          status: 'processing' as const,
          updatedAt: new Date().toISOString(),
        };
      }
      return lot;
    });
    
    setDataState(prev => ({ ...prev, processingLots: updatedLots }));
    await saveData('processingLots', updatedLots);
  }, [dataState.processingLots, generateId, saveData]);

  const sendLabSample = useCallback(async (lotId: string, labId: string, sampleWeight: number, samplePhoto?: string) => {
    const newSample: LabSample = {
      id: generateId('LAB'),
      processingLotId: lotId,
      facilityId: userProfile?.id || 'facility-1',
      labId,
      sampleWeight,
      samplePhoto,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedSamples = [...dataState.labSamples, newSample];
    const updatedLots = dataState.processingLots.map(lot => {
      if (lot.id === lotId) {
        return {
          ...lot,
          labSampleId: newSample.id,
          status: 'lab-testing' as const,
          updatedAt: new Date().toISOString(),
        };
      }
      return lot;
    });
    
    setDataState(prev => ({ 
      ...prev, 
      labSamples: updatedSamples,
      processingLots: updatedLots 
    }));
    
    await saveData('labSamples', updatedSamples);
    await saveData('processingLots', updatedLots);
    
    return newSample;
  }, [userProfile, dataState.labSamples, dataState.processingLots, generateId, saveData]);

  // Laboratory Actions
  const submitTestResults = useCallback(async (sampleId: string, testResults: TestResults) => {
    const updatedSamples = dataState.labSamples.map(sample => {
      if (sample.id === sampleId) {
        return {
          ...sample,
          testResults,
          status: 'completed' as const,
          updatedAt: new Date().toISOString(),
        };
      }
      return sample;
    });
    
    const sample = dataState.labSamples.find(s => s.id === sampleId);
    if (sample) {
      const updatedLots = dataState.processingLots.map(lot => {
        if (lot.id === sample.processingLotId) {
          const newStatus: ProcessingLot['status'] = testResults.overallResult === 'pass' ? 'approved' : 'rejected';
          const newGrade: ProcessingLot['grade'] = testResults.overallResult === 'pass' ? 'premium' : 'low';
          return {
            ...lot,
            testResults,
            status: newStatus,
            grade: newGrade,
            updatedAt: new Date().toISOString(),
          };
        }
        return lot;
      });
      
      setDataState(prev => ({ 
        ...prev, 
        labSamples: updatedSamples,
        processingLots: updatedLots 
      }));
      
      await saveData('labSamples', updatedSamples);
      await saveData('processingLots', updatedLots);
      
      // Generate certificate if test passed
      if (testResults.overallResult === 'pass') {
        const certificate: Certificate = {
          id: generateId('CERT'),
          sampleId,
          processingLotId: sample.processingLotId,
          qrCode: generateId('QR'),
          issuedBy: userProfile?.labName || userProfile?.fullName || 'Lab',
          issuedDate: new Date().toISOString(),
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
        };
        
        const updatedCertificates = [...dataState.certificates, certificate];
        setDataState(prev => ({ ...prev, certificates: updatedCertificates }));
        await saveData('certificates', updatedCertificates);
      }
    }
  }, [userProfile, dataState.labSamples, dataState.processingLots, dataState.certificates, generateId, saveData]);

  // Manufacturer Actions
  const createFinalProduct = useCallback(async (lotIds: string[], productName: string, batchSize: number, excipients?: string[]) => {
    if (!userProfile || selectedRole !== 'manufacturer') return;
    
    const selectedLots = dataState.processingLots.filter(lot => 
      lotIds.includes(lot.id) && lot.status === 'approved'
    );
    
    // Build provenance chain
    const provenanceChain: ProvenanceData = {
      farmers: [],
      collectors: [],
      facilities: [],
      labs: [],
      manufacturer: {
        id: userProfile.id || 'manufacturer-1',
        name: userProfile.companyName || userProfile.fullName,
      },
      timeline: [],
    };
    
    // Collect all related data for provenance
    selectedLots.forEach(lot => {
      lot.aggregationBatchIds.forEach(aggId => {
        const aggregation = dataState.aggregationBatches.find(agg => agg.id === aggId);
        if (aggregation) {
          aggregation.farmerBatches.forEach(batchId => {
            const farmerBatch = dataState.farmerBatches.find(batch => batch.id === batchId);
            if (farmerBatch) {
              const existingFarmer = provenanceChain.farmers.find(f => f.id === farmerBatch.farmerId);
              if (existingFarmer) {
                existingFarmer.batches.push(batchId);
              } else {
                provenanceChain.farmers.push({
                  id: farmerBatch.farmerId,
                  name: farmerBatch.farmerName,
                  batches: [batchId],
                });
              }
            }
          });
          
          const existingCollector = provenanceChain.collectors.find(c => c.id === aggregation.collectorId);
          if (existingCollector) {
            existingCollector.aggregations.push(aggId);
          } else {
            provenanceChain.collectors.push({
              id: aggregation.collectorId,
              name: aggregation.collectorName,
              aggregations: [aggId],
            });
          }
        }
      });
      
      const existingFacility = provenanceChain.facilities.find(f => f.id === lot.facilityId);
      if (existingFacility) {
        existingFacility.lots.push(lot.id);
      } else {
        provenanceChain.facilities.push({
          id: lot.facilityId,
          name: lot.facilityName,
          lots: [lot.id],
        });
      }
      
      if (lot.labSampleId) {
        const sample = dataState.labSamples.find(s => s.id === lot.labSampleId);
        if (sample) {
          const existingLab = provenanceChain.labs.find(l => l.id === sample.labId);
          if (existingLab) {
            existingLab.tests.push(sample.id);
          } else {
            provenanceChain.labs.push({
              id: sample.labId,
              name: 'Lab', // Would need lab name from user profiles
              tests: [sample.id],
            });
          }
        }
      }
    });
    
    const newProduct: FinalProduct = {
      id: generateId('FB'),
      manufacturerId: userProfile.id || 'manufacturer-1',
      manufacturerName: userProfile.companyName || userProfile.fullName,
      processingLotIds: lotIds,
      productName,
      batchSize,
      excipients,
      qrCode: generateId('QR-FINAL'),
      provenanceChain,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedProducts = [...dataState.finalProducts, newProduct];
    setDataState(prev => ({ ...prev, finalProducts: updatedProducts }));
    await saveData('finalProducts', updatedProducts);
    
    return newProduct;
  }, [userProfile, selectedRole, dataState.processingLots, dataState.aggregationBatches, dataState.farmerBatches, dataState.labSamples, dataState.finalProducts, generateId, saveData]);

  // Recall product
  const recallProduct = useCallback(async (productId: string) => {
    const updatedProducts = dataState.finalProducts.map(product => {
      if (product.id === productId) {
        return {
          ...product,
          status: 'recalled' as const,
          updatedAt: new Date().toISOString(),
        };
      }
      return product;
    });
    
    setDataState(prev => ({ ...prev, finalProducts: updatedProducts }));
    await saveData('finalProducts', updatedProducts);
  }, [dataState.finalProducts, saveData]);

  // Aggregation cart functions
  const addToAggregationCart = useCallback(async (batchId: string) => {
    if (!dataState.aggregationCart.includes(batchId)) {
      const updatedCart = [...dataState.aggregationCart, batchId];
      setDataState(prev => ({ ...prev, aggregationCart: updatedCart }));
      await saveData('aggregationCart', updatedCart);
    }
  }, [dataState.aggregationCart, saveData]);

  const removeFromAggregationCart = useCallback(async (batchId: string) => {
    const updatedCart = dataState.aggregationCart.filter(id => id !== batchId);
    setDataState(prev => ({ ...prev, aggregationCart: updatedCart }));
    await saveData('aggregationCart', updatedCart);
  }, [dataState.aggregationCart, saveData]);

  const clearAggregationCart = useCallback(async () => {
    setDataState(prev => ({ ...prev, aggregationCart: [] }));
    await saveData('aggregationCart', []);
  }, [saveData]);

  // Add farmer profile
  const addFarmerProfile = useCallback(async (profile: FarmerProfile) => {
    const updatedFarmers = [...dataState.farmers, profile];
    setDataState(prev => ({ ...prev, farmers: updatedFarmers }));
    await saveData('farmers', updatedFarmers);
  }, [dataState.farmers, saveData]);

  // Filtered data based on user role
  const getFilteredData = useMemo(() => {
    if (!userProfile || !selectedRole) return dataState;
    
    switch (selectedRole) {
      case 'farmer':
        return {
          ...dataState,
          farmerBatches: dataState.farmerBatches.filter(batch => 
            batch.farmerId === userProfile.id || batch.farmerId === 'farmer-1'
          ),
        };
      case 'collector':
        return {
          ...dataState,
          // Collectors can see all harvested batches from all farmers
          farmerBatches: dataState.farmerBatches,
          aggregationBatches: dataState.aggregationBatches.filter(agg => 
            agg.collectorId === userProfile.id || agg.collectorId === 'collector-1'
          ),
        };
      case 'facility':
        return {
          ...dataState,
          // Facilities can see all aggregation batches and their own processing lots
          aggregationBatches: dataState.aggregationBatches,
          processingLots: dataState.processingLots.filter(lot => 
            lot.facilityId === userProfile.id || lot.facilityId === 'facility-1'
          ),
        };
      case 'laboratory':
        return {
          ...dataState,
          // Labs can see all processing lots and their own samples
          processingLots: dataState.processingLots,
          labSamples: dataState.labSamples.filter(sample => 
            sample.labId === userProfile.id || sample.labId === 'lab-1'
          ),
        };
      case 'manufacturer':
        return {
          ...dataState,
          // Manufacturers can see all approved processing lots and their own products
          processingLots: dataState.processingLots,
          finalProducts: dataState.finalProducts.filter(product => 
            product.manufacturerId === userProfile.id || product.manufacturerId === 'manufacturer-1'
          ),
        };
      default:
        return dataState;
    }
  }, [dataState, userProfile, selectedRole]);

  return useMemo(() => ({
    ...getFilteredData,
    // Farmer actions
    createBatch,
    addCareEvent,
    recordHarvest,
    // Collector actions
    createAggregation,
    updateTransport,
    addToAggregationCart,
    removeFromAggregationCart,
    clearAggregationCart,
    // Facility actions
    receiveAggregation,
    addProcessingStep,
    sendLabSample,
    // Lab actions
    submitTestResults,
    // Manufacturer actions
    createFinalProduct,
    recallProduct,
    // Profile actions
    addFarmerProfile,
    // Utility functions
    generateId,
  }), [
    getFilteredData,
    createBatch,
    addCareEvent,
    recordHarvest,
    createAggregation,
    updateTransport,
    addToAggregationCart,
    removeFromAggregationCart,
    clearAggregationCart,
    receiveAggregation,
    addProcessingStep,
    sendLabSample,
    submitTestResults,
    createFinalProduct,
    recallProduct,
    addFarmerProfile,
    generateId,
  ]);
});

// Helper hooks for specific data queries
export const useAvailableHarvestedBatches = () => {
  const { farmerBatches } = useData();
  return farmerBatches.filter(batch => batch.status === 'harvested');
};

export const useApprovedProcessingLots = () => {
  const { processingLots } = useData();
  return processingLots.filter(lot => lot.status === 'approved');
};

export const usePendingLabSamples = () => {
  const { labSamples } = useData();
  return labSamples.filter(sample => sample.status === 'pending');
};

export const useProvenanceChain = (productId: string) => {
  const { finalProducts, farmerBatches, aggregationBatches, processingLots, labSamples } = useData();
  
  const product = finalProducts.find(p => p.id === productId);
  if (!product) return null;
  
  return {
    product,
    farmers: product.provenanceChain.farmers.map(farmer => ({
      ...farmer,
      batches: farmerBatches.filter(batch => farmer.batches.includes(batch.id)),
    })),
    collectors: product.provenanceChain.collectors.map(collector => ({
      ...collector,
      aggregations: aggregationBatches.filter(agg => collector.aggregations.includes(agg.id)),
    })),
    facilities: product.provenanceChain.facilities.map(facility => ({
      ...facility,
      lots: processingLots.filter(lot => facility.lots.includes(lot.id)),
    })),
    labs: product.provenanceChain.labs.map(lab => ({
      ...lab,
      tests: labSamples.filter(sample => lab.tests.includes(sample.id)),
    })),
  };
};