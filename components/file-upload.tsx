import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { Upload, File, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

interface FileUploadProps {
  label: string;
  onFileSelect: (file: any) => void;
  selectedFile?: any;
  required?: boolean;
  accept?: 'images' | 'documents' | 'all';
}

export default function FileUpload({ 
  label, 
  onFileSelect, 
  selectedFile, 
  required,
  accept = 'all' 
}: FileUploadProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = async () => {
    setIsLoading(true);
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: accept === 'images' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onFileSelect(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFile = () => {
    onFileSelect(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      {selectedFile ? (
        <View style={styles.selectedFile}>
          <View style={styles.fileInfo}>
            <File size={20} color="#16a34a" />
            <Text style={styles.fileName} numberOfLines={1}>
              {selectedFile.fileName || 'Selected file'}
            </Text>
          </View>
          <TouchableOpacity onPress={handleRemoveFile} style={styles.removeButton}>
            <X size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.uploadButton} 
          onPress={handleFileSelect}
          disabled={isLoading}
        >
          <Upload size={24} color="#6b7280" />
          <Text style={styles.uploadText}>
            {isLoading ? 'Selecting...' : 'Tap to upload file'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  required: {
    color: '#ef4444',
  },
  uploadButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 14,
    color: '#6b7280',
  },
  selectedFile: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
});