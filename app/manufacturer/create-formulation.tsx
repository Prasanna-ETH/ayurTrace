import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Beaker, Plus, Minus, Package, Calculator, Camera, QrCode } from 'lucide-react-native';
import { router } from 'expo-router';
import { useData, useApprovedProcessingLots } from '@/providers/data-provider';

interface FormulationIngredient {
  processingLotId: string;
  species: string;
  weightKg: number;
  pricePerKg: number;
}

const productTemplates = [
  { id: 'capsules', name: 'Herbal Capsules', description: 'Standardized herbal capsules' },
  { id: 'extract', name: 'Liquid Extract', description: 'Concentrated liquid extract' },
  { id: 'powder', name: 'Herbal Powder', description: 'Fine herbal powder blend' },
  { id: 'tea', name: 'Herbal Tea', description: 'Blended herbal tea' },
  { id: 'oil', name: 'Essential Oil', description: 'Extracted essential oil' },
];

export default function CreateFormulation() {
  const { createFinalProductFromFormulation } = useData();
  const approvedProcessingLots = useApprovedProcessingLots();
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [productName, setProductName] = useState('');
  const [batchSize, setBatchSize] = useState('');
  const [ingredients, setIngredients] = useState<FormulationIngredient[]>([]);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addIngredient = (lot: any) => {
    const existingIndex = ingredients.findIndex(ing => ing.processingLotId === lot.id);
    
    if (existingIndex >= 0) {
      // Increase quantity if already added
      const newIngredients = [...ingredients];
      newIngredients[existingIndex].weightKg += 1;
      setIngredients(newIngredients);
    } else {
      // Add new ingredient
      const newIngredient: FormulationIngredient = {
        processingLotId: lot.id,
        species: lot.species,
        weightKg: 1,
        pricePerKg: 500, // Default price
      };
      setIngredients([...ingredients, newIngredient]);
    }
  };

  const updateIngredientWeight = (processingLotId: string, newWeight: number) => {
    if (newWeight <= 0) {
      setIngredients(ingredients.filter(ing => ing.processingLotId !== processingLotId));
    } else {
      setIngredients(ingredients.map(ing => 
        ing.processingLotId === processingLotId 
          ? { ...ing, weightKg: newWeight }
          : ing
      ));
    }
  };

  const removeIngredient = (processingLotId: string) => {
    setIngredients(ingredients.filter(ing => ing.processingLotId !== processingLotId));
  };

  const handleTakePhoto = () => {
    // Simulate photo capture
    const photoUrl = `https://picsum.photos/400/300?random=${Date.now()}`;
    setPhotos(prev => [...prev, photoUrl]);
    Alert.alert('Photo Captured', 'Formulation photo has been captured successfully');
  };

  const calculateTotalCost = () => {
    return ingredients.reduce((sum, ing) => sum + (ing.weightKg * ing.pricePerKg), 0);
  };

  const calculateTotalWeight = () => {
    return ingredients.reduce((sum, ing) => sum + ing.weightKg, 0);
  };

  const generateProductId = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `FP-MFG-${dateStr}-${randomStr}`;
  };

  const handleSubmit = async () => {
    if (!productName.trim()) {
      Alert.alert('Missing Product Name', 'Please enter a product name.');
      return;
    }

    if (!batchSize || parseInt(batchSize) <= 0) {
      Alert.alert('Invalid Batch Size', 'Please enter a valid batch size.');
      return;
    }

    if (ingredients.length === 0) {
      Alert.alert('No Ingredients', 'Please add at least one ingredient.');
      return;
    }

    setIsSubmitting(true);
    try {
      const productId = generateProductId();
      const qrCode = `QR-${productId}-${Date.now()}`;
      
      await createFinalProductFromFormulation({
        id: productId,
        productName: productName.trim(),
        batchSize: parseInt(batchSize),
        processingLotIds: ingredients.map(ing => ing.processingLotId),
        totalCost: calculateTotalCost(),
        totalWeight: calculateTotalWeight(),
        status: 'active',
        qrCode,
        notes: notes.trim(),
        photos,
        createdAt: new Date().toISOString(),
      });

      Alert.alert(
        'Success!', 
        `Product formulation ${productId} created successfully!`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error creating formulation:', error);
      Alert.alert('Error', 'Failed to create formulation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTemplateCard = ({ item }: { item: typeof productTemplates[0] }) => (
    <TouchableOpacity
      style={[
        styles.templateCard,
        selectedTemplate === item.id && styles.templateCardSelected
      ]}
      onPress={() => {
        setSelectedTemplate(item.id);
        setProductName(item.name);
      }}
    >
      <Text style={styles.templateName}>{item.name}</Text>
      <Text style={styles.templateDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  const renderLotCard = ({ item }: { item: any }) => {
    const isAdded = ingredients.some(ing => ing.processingLotId === item.id);
    
    return (
      <View style={styles.lotCard}>
        <View style={styles.lotHeader}>
          <Text style={styles.lotSpecies}>{item.species}</Text>
          <Text style={styles.lotWeight}>{item.availableWeight} kg</Text>
        </View>
        
        <Text style={styles.lotId}>{item.id}</Text>
        <Text style={styles.lotPrice}>₹500/kg</Text>
        
        <TouchableOpacity
          style={[styles.addButton, isAdded && styles.addButtonAdded]}
          onPress={() => addIngredient(item)}
        >
          <Plus size={16} color={isAdded ? '#6b7280' : 'white'} />
          <Text style={[styles.addButtonText, isAdded && styles.addButtonTextAdded]}>
            {isAdded ? 'Added' : 'Add'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderIngredientItem = ({ item }: { item: FormulationIngredient }) => (
    <View style={styles.ingredientCard}>
      <View style={styles.ingredientHeader}>
        <Text style={styles.ingredientSpecies}>{item.species}</Text>
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => removeIngredient(item.processingLotId)}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.ingredientId}>{item.processingLotId}</Text>
      
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateIngredientWeight(item.processingLotId, item.weightKg - 1)}
        >
          <Minus size={16} color="#16a34a" />
        </TouchableOpacity>
        
        <TextInput
          style={styles.quantityInput}
          value={item.weightKg.toString()}
          onChangeText={(text) => updateIngredientWeight(item.processingLotId, parseFloat(text) || 0)}
          keyboardType="numeric"
        />
        
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateIngredientWeight(item.processingLotId, item.weightKg + 1)}
        >
          <Plus size={16} color="#16a34a" />
        </TouchableOpacity>
        
        <Text style={styles.quantityUnit}>kg</Text>
      </View>
      
      <Text style={styles.ingredientCost}>₹{(item.weightKg * item.pricePerKg).toLocaleString()}</Text>
    </View>
  );

  return (
    <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Formulation</Text>
          <Text style={styles.subtitle}>Design a new product batch</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Template</Text>
          <FlatList
            data={productTemplates}
            renderItem={renderTemplateCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.templateList}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Product Name</Text>
            <TextInput
              style={styles.input}
              value={productName}
              onChangeText={setProductName}
              placeholder="Enter product name"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Batch Size (units)</Text>
            <TextInput
              style={styles.input}
              value={batchSize}
              onChangeText={setBatchSize}
              placeholder="1000"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Ingredients</Text>
          <FlatList
            data={approvedProcessingLots}
            renderItem={renderLotCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.lotsList}
          />
        </View>

        {ingredients.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selected Ingredients</Text>
            <FlatList
              data={ingredients}
              renderItem={renderIngredientItem}
              keyExtractor={(item) => item.processingLotId}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.ingredientsList}
            />
            
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Weight:</Text>
                <Text style={styles.summaryValue}>{calculateTotalWeight()} kg</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Cost:</Text>
                <Text style={styles.summaryValue}>₹{calculateTotalCost().toLocaleString()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Cost per Unit:</Text>
                <Text style={styles.summaryValue}>
                  ₹{batchSize ? (calculateTotalCost() / parseInt(batchSize)).toFixed(2) : '0'}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Formulation Notes</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Enter formulation instructions and notes..."
              multiline
              numberOfLines={4}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.photoSection}>
            <Text style={styles.inputLabel}>Formulation Photos</Text>
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
            {isSubmitting ? 'Creating...' : 'Create Formulation'}
          </Text>
        </TouchableOpacity>
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
  templateList: {
    paddingRight: 20,
  },
  templateCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 200,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  templateCardSelected: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: '#6b7280',
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
  lotsList: {
    paddingRight: 20,
  },
  lotCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 180,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  lotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lotSpecies: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
    flex: 1,
  },
  lotWeight: {
    fontSize: 12,
    color: '#6b7280',
  },
  lotId: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  lotPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    borderRadius: 8,
    paddingVertical: 8,
    gap: 4,
  },
  addButtonAdded: {
    backgroundColor: '#f3f4f6',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  addButtonTextAdded: {
    color: '#6b7280',
  },
  ingredientsList: {
    paddingBottom: 16,
  },
  ingredientCard: {
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
  ingredientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ingredientSpecies: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
  },
  removeButton: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  removeButtonText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
  },
  ingredientId: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  quantityButton: {
    backgroundColor: '#f0fdf4',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  quantityInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    textAlign: 'center',
    minWidth: 60,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quantityUnit: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 4,
  },
  ingredientCost: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
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
});