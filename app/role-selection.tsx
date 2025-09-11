import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tractor, Truck, Factory, FlaskConical, Building2 } from 'lucide-react-native';
import { useAuth } from '../providers/auth-provider';

const roles = [
  {
    id: 'farmer',
    title: 'Farmer',
    description: 'Cultivate and grow herbal crops',
    icon: Tractor,
    color: '#16a34a',
    route: '/auth/phone',
  },
  {
    id: 'collector',
    title: 'Collector',
    description: 'Collect and transport raw materials',
    icon: Truck,
    color: '#059669',
    route: '/auth/phone',
  },
  {
    id: 'facility',
    title: 'Processing Facility',
    description: 'Process raw materials into products',
    icon: Factory,
    color: '#0d9488',
    route: '/auth/phone',
  },
  {
    id: 'laboratory',
    title: 'Laboratory',
    description: 'Test and analyze product quality',
    icon: FlaskConical,
    color: '#0891b2',
    route: '/auth/phone',
  },
  {
    id: 'manufacturer',
    title: 'Manufacturer',
    description: 'Manufacture final herbal products',
    icon: Building2,
    color: '#1d4ed8',
    route: '/auth/phone',
  },
];

export default function RoleSelectionScreen() {
  const { setSelectedRole } = useAuth();

  const handleRoleSelect = (role: typeof roles[0]) => {
    setSelectedRole(role.id as any);
    router.push(role.route as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#f0fdf4', '#dcfce7', '#bbf7d0']}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Role</Text>
          <Text style={styles.subtitle}>
            Select your role in the herbal supply chain to get started
          </Text>
        </View>

        <View style={styles.rolesContainer}>
          {roles.map((role) => {
            const IconComponent = role.icon;
            return (
              <TouchableOpacity
                key={role.id}
                style={styles.roleCard}
                onPress={() => handleRoleSelect(role)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[role.color, `${role.color}dd`]}
                  style={styles.roleGradient}
                >
                  <View style={styles.roleContent}>
                    <View style={styles.iconContainer}>
                      <IconComponent size={32} color="white" />
                    </View>
                    <Text style={styles.roleTitle}>{role.title}</Text>
                    <Text style={styles.roleDescription}>{role.description}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#16a34a',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  rolesContainer: {
    gap: 16,
  },
  roleCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  roleGradient: {
    padding: 20,
  },
  roleContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
});