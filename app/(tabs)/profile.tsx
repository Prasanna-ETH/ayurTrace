import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Edit, Phone, Mail, MapPin, FileText } from 'lucide-react-native';
import { useAuth } from '@/providers/auth-provider';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { userProfile, logout, selectedRole } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          }
        },
      ]
    );
  };

  if (!userProfile) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const renderProfileField = (icon: any, label: string, value: string) => {
    const IconComponent = icon;
    return (
      <View style={styles.profileField}>
        <View style={styles.fieldIcon}>
          <IconComponent size={20} color="#16a34a" />
        </View>
        <View style={styles.fieldContent}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <Text style={styles.fieldValue}>{value}</Text>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {(userProfile.fullName || userProfile.facilityName || userProfile.companyName || userProfile.labName || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.nameText}>
              {userProfile.fullName || userProfile.facilityName || userProfile.companyName || userProfile.labName}
            </Text>
            <Text style={styles.roleText}>{selectedRole?.toUpperCase()}</Text>
          </View>

          <View style={styles.profileSection}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            {renderProfileField(Phone, 'Phone Number', userProfile.phoneNumber)}
            {renderProfileField(Mail, 'Email', userProfile.email)}
            
            {userProfile.location && (
              renderProfileField(MapPin, 'Location', userProfile.location.address)
            )}
            
            {userProfile.plantAddress && (
              renderProfileField(MapPin, 'Plant Address', userProfile.plantAddress.address)
            )}
          </View>

          <View style={styles.profileSection}>
            <Text style={styles.sectionTitle}>Professional Details</Text>
            
            {userProfile.nmpbLicense && (
              renderProfileField(FileText, 'NMPB License', userProfile.nmpbLicense)
            )}
            
            {userProfile.collectorLicense && (
              renderProfileField(FileText, 'Collector License', userProfile.collectorLicense)
            )}
            
            {userProfile.licenseNumber && (
              renderProfileField(FileText, 'License Number', userProfile.licenseNumber)
            )}
            
            {userProfile.accreditationNumber && (
              renderProfileField(FileText, 'Accreditation Number', userProfile.accreditationNumber)
            )}
            
            {userProfile.gmpLicenseNumber && (
              renderProfileField(FileText, 'GMP License Number', userProfile.gmpLicenseNumber)
            )}
            
            {userProfile.companyName && (
              renderProfileField(FileText, 'Company Name', userProfile.companyName)
            )}
            
            {userProfile.serviceArea && (
              renderProfileField(FileText, 'Service Area', userProfile.serviceArea)
            )}
            
            {userProfile.preferredLanguage && (
              renderProfileField(FileText, 'Preferred Language', userProfile.preferredLanguage)
            )}
          </View>

          <View style={styles.actionSection}>
            <TouchableOpacity style={styles.editButton}>
              <Edit size={20} color="#16a34a" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LogOut size={20} color="#ef4444" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
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
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 4,
    textAlign: 'center',
  },
  roleText: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '600',
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  profileSection: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 16,
  },
  profileField: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  fieldIcon: {
    width: 40,
    alignItems: 'center',
  },
  fieldContent: {
    flex: 1,
    marginLeft: 8,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  actionSection: {
    gap: 12,
  },
  editButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16a34a',
  },
  logoutButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
});