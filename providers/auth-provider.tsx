import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';

export type UserRole = 'farmer' | 'collector' | 'facility' | 'laboratory' | 'manufacturer';

interface AuthState {
  isAuthenticated: boolean;
  selectedRole: UserRole | null;
  phoneNumber: string | null;
  userProfile: any | null;
  isLoading: boolean;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    selectedRole: null,
    phoneNumber: null,
    userProfile: null,
    isLoading: true,
  });

  const loadAuthState = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('authState');
      if (stored) {
        const parsedState = JSON.parse(stored);
        setAuthState(prev => ({ ...prev, ...parsedState, isLoading: false }));
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    loadAuthState();
  }, [loadAuthState]);

  const saveAuthState = useCallback(async (newState: Partial<AuthState>) => {
    try {
      const updatedState = { ...authState, ...newState };
      await AsyncStorage.setItem('authState', JSON.stringify(updatedState));
      setAuthState(updatedState);
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  }, [authState]);

  const setSelectedRole = useCallback((role: UserRole) => {
    saveAuthState({ selectedRole: role });
  }, [saveAuthState]);

  const setPhoneNumber = useCallback((phone: string) => {
    saveAuthState({ phoneNumber: phone });
  }, [saveAuthState]);

  const authenticate = useCallback((profile: any) => {
    saveAuthState({ 
      isAuthenticated: true, 
      userProfile: profile 
    });
  }, [saveAuthState]);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('authState');
      setAuthState({
        isAuthenticated: false,
        selectedRole: null,
        phoneNumber: null,
        userProfile: null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, []);

  return useMemo(() => ({
    ...authState,
    setSelectedRole,
    setPhoneNumber,
    authenticate,
    logout,
  }), [authState, setSelectedRole, setPhoneNumber, authenticate, logout]);
});