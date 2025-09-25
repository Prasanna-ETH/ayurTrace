import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { QrCode, Download, Package, Share, Eye, CheckCircle } from 'lucide-react-native';
import { useData } from '@/providers/data-provider';

export default function GenerateQR() {
  const { finalProducts, generateQRCode } = useData();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [generatedQR, setGeneratedQR] = useState('');

  const readyProducts = finalProducts.filter(product => 
    product.status === 'active' && !product.qrCode
  );

  const productsWithQR = finalProducts.filter(product => 
    product.status === 'active' && product.qrCode
  );

  const handleGenerateQR = async () => {
    if (!selectedProduct) {
      Alert.alert('No Product Selected', 'Please select a product to generate QR code for.');
      return;
    }

    try {
      // Generate comprehensive QR data
      const qrData = {
        productId: selectedProduct.id,
        productName: selectedProduct.productName,
        batchSize: selectedProduct.batchSize,
        manufacturerInfo: {
          name: 'HerbalChain Manufacturing',
          location: 'Bangalore, India',
          license: 'MFG-LIC-2025-001'
        },
        traceabilityData: {
          processingLots: selectedProduct.processingLotIds,
          totalWeight: selectedProduct.totalWeight || 0,
          createdAt: selectedProduct.createdAt,
          qrGeneratedAt: new Date().toISOString()
        },
        verification: {
          qrId: `QR-${selectedProduct.id}-${Date.now()}`,
          hash: Math.random().toString(36).substring(2, 15).toUpperCase()
        }
      };

      const qrString = JSON.stringify(qrData, null, 2);
      setGeneratedQR(qrString);
      setQrGenerated(true);

      // Update product with QR code
      await generateQRCode(selectedProduct.id, qrData.verification.qrId);

      Alert.alert(
        'QR Code Generated!', 
        'QR code has been generated successfully with complete traceability data.'
      );
    } catch (error) {
      console.error('Error generating QR code:', error);
      Alert.alert('Error', 'Failed to generate QR code. Please try again.');
    }
  };

  const handleDownloadQR = () => {
    // Simulate QR code download
    Alert.alert('Download Started', 'QR code image download has started.');
    console.log('Downloading QR code for product:', selectedProduct?.id);
  };

  const handleShareQR = () => {
    // Simulate QR code sharing
    Alert.alert('Share QR Code', 'QR code sharing options would appear here.');
    console.log('Sharing QR code for product:', selectedProduct?.id);
  };

  const handleViewProvenance = () => {
    // Simulate provenance viewing
    Alert.alert('Full Provenance', 'Complete supply chain trace would be displayed here.');
    console.log('Viewing provenance for product:', selectedProduct?.id);
  };

  const renderProductCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.productCard,
        selectedProduct?.id === item.id && styles.productCardSelected
      ]}
      onPress={() => setSelectedProduct(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.productId}>{item.id}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Ready</Text>
        </View>
      </View>

      <Text style={styles.productName}>{item.productName}</Text>
      <Text style={styles.batchSize}>{item.batchSize} units</Text>
      <Text style={styles.ingredientCount}>
        {item.processingLotIds.length} ingredient(s)
      </Text>
      <Text style={styles.createdDate}>
        Created: {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  const renderQRProductCard = ({ item }: { item: any }) => (
    <View style={styles.qrProductCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.productId}>{item.id}</Text>
        <View style={styles.qrBadge}>
          <QrCode size={12} color="white" />
          <Text style={styles.qrBadgeText}>QR Ready</Text>
        </View>
      </View>

      <Text style={styles.productName}>{item.productName}</Text>
      <Text style={styles.qrId}>QR: {item.qrCode}</Text>
      
      <View style={styles.qrActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleDownloadQR}>
          <Download size={16} color="#16a34a" />
          <Text style={styles.actionButtonText}>Download</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleShareQR}>
          <Share size={16} color="#16a34a" />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleViewProvenance}>
          <Eye size={16} color="#16a34a" />
          <Text style={styles.actionButtonText}>Trace</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Generate QR Codes</Text>
          <Text style={styles.subtitle}>Create traceability QR codes for products</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Product</Text>
          {readyProducts.length > 0 ? (
            <FlatList
              data={readyProducts}
              renderItem={renderProductCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              style={styles.productList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Package size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No products ready for QR generation</Text>
              <Text style={styles.emptyStateSubtext}>Complete product formulations first</Text>
            </View>
          )}
        </View>

        {selectedProduct && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Generate QR Code</Text>
            
            <View style={styles.selectedProductCard}>
              <Text style={styles.selectedProductName}>{selectedProduct.productName}</Text>
              <Text style={styles.selectedProductId}>{selectedProduct.id}</Text>
              <Text style={styles.selectedProductBatch}>{selectedProduct.batchSize} units</Text>
              
              <View style={styles.ingredientsList}>
                <Text style={styles.ingredientsTitle}>Ingredients Traceability:</Text>
                {selectedProduct.processingLotIds.map((lotId: string) => (
                  <Text key={lotId} style={styles.ingredientLot}>• {lotId}</Text>
                ))}
              </View>
            </View>

            {!qrGenerated ? (
              <TouchableOpacity style={styles.generateButton} onPress={handleGenerateQR}>
                <QrCode size={24} color="white" />
                <Text style={styles.generateButtonText}>Generate QR Code</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.qrResultCard}>
                <View style={styles.qrHeader}>
                  <CheckCircle size={24} color="#10b981" />
                  <Text style={styles.qrSuccessText}>QR Code Generated Successfully!</Text>
                </View>
                
                <View style={styles.qrDataContainer}>
                  <Text style={styles.qrDataTitle}>QR Code Data:</Text>
                  <ScrollView style={styles.qrDataScroll} nestedScrollEnabled>
                    <Text style={styles.qrDataText}>{generatedQR}</Text>
                  </ScrollView>
                </View>
                
                <View style={styles.qrActionsRow}>
                  <TouchableOpacity style={styles.primaryActionButton} onPress={handleDownloadQR}>
                    <Download size={20} color="white" />
                    <Text style={styles.primaryActionButtonText}>Download QR</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.secondaryActionButton} onPress={handleShareQR}>
                    <Share size={20} color="#16a34a" />
                    <Text style={styles.secondaryActionButtonText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {productsWithQR.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Products with QR Codes</Text>
            <FlatList
              data={productsWithQR}
              renderItem={renderQRProductCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.qrProductsList}
            />
          </View>
        )}

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <QrCode size={24} color="#3b82f6" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Complete Traceability</Text>
              <Text style={styles.infoText}>
                Generated QR codes contain complete supply chain data including all processing 
                lots, facility information, test results, and manufacturing details for full transparency.
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 16,
  },
  productList: {
    maxHeight: 300,
  },
  productCard: {
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
  productCardSelected: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  statusBadge: {
    backgroundColor: '#10b981',
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 4,
  },
  batchSize: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  ingredientCount: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  createdDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  selectedProductCard: {
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
  selectedProductName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 4,
  },
  selectedProductId: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  selectedProductBatch: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 16,
  },
  ingredientsList: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
  },
  ingredientsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  ingredientLot: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  qrResultCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  qrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  qrSuccessText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  qrDataContainer: {
    marginBottom: 16,
  },
  qrDataTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  qrDataScroll: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  qrDataText: {
    fontSize: 11,
    color: '#6b7280',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  qrActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  primaryActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  secondaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  secondaryActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  qrProductsList: {
    paddingBottom: 16,
  },
  qrProductCard: {
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
  qrBadge: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  qrBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  qrId: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  qrActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: 6,
    paddingVertical: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
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