import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

export const checkInternetConnection = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected === true && state.isInternetReachable === true;
  } catch (error) {
    console.error('Error checking internet connection:', error);
    return false;
  }
};

export const showNoInternetAlert = () => {
  Alert.alert(
    'No Internet Connection',
    'Please check your internet connection and try again.',
    [{ text: 'OK' }]
  );
};

export const withInternetCheck = async <T>(
  operation: () => Promise<T>,
  showAlert: boolean = true
): Promise<T> => {
  const isConnected = await checkInternetConnection();
  
  if (!isConnected) {
    if (showAlert) {
      showNoInternetAlert();
    }
    throw new Error('No internet connection available');
  }
  
  return operation();
}; 