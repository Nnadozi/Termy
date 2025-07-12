import NetInfo from '@react-native-community/netinfo';
import { useTheme } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import CustomIcon from './CustomIcon';
import CustomText from './CustomText';

const OfflineIndicator = () => {
  const { colors } = useTheme();
  const [isConnected, setIsConnected] = useState(true);
  const slideAnim = useState(new Animated.Value(-50))[0];

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected === true && state.isInternetReachable === true;
      
      if (connected !== isConnected) {
        setIsConnected(connected);
        
        // Animate the indicator
        Animated.timing(slideAnim, {
          toValue: connected ? -50 : 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    });

    return () => unsubscribe();
  }, [isConnected, slideAnim]);

  if (isConnected) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          backgroundColor: colors.notification,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <CustomIcon 
        name="wifi-off" 
        type="feather" 
        size={16} 
        color={colors.background}
        style={styles.icon}
      />
      <CustomText 
        fontSize="small" 
        style={styles.text}
        color={colors.background}
      >
        No Internet Connection
      </CustomText>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontWeight: 'bold',
  },
});

export default OfflineIndicator; 