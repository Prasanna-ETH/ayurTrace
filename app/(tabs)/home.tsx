import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/providers/auth-provider';
import FarmerDashboard from '@/components/dashboards/farmer-dashboard';
import CollectorDashboard from '@/components/dashboards/collector-dashboard';
import FacilityDashboard from '@/components/dashboards/facility-dashboard';
import LaboratoryDashboard from '@/components/dashboards/laboratory-dashboard';
import ManufacturerDashboard from '@/components/dashboards/manufacturer-dashboard';

export default function DashboardScreen() {
  const { userProfile, selectedRole } = useAuth();
  
  if (!userProfile || !selectedRole) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  switch (selectedRole) {
    case 'farmer':
      return <FarmerDashboard />;
    case 'collector':
      return <CollectorDashboard />;
    case 'facility':
      return <FacilityDashboard />;
    case 'laboratory':
      return <LaboratoryDashboard />;
    case 'manufacturer':
      return <ManufacturerDashboard />;
    default:
      return (
        <View style={styles.container}>
          <Text style={styles.errorText}>Unknown role: {selectedRole}</Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
  },
  loadingText: {
    fontSize: 18,
    color: '#166534',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
});