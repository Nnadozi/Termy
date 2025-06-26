import { useTheme } from '@react-navigation/native'
import { StyleSheet, View } from 'react-native'
import CustomButton from './CustomButton'
import CustomIcon from './CustomIcon'
import CustomText from './CustomText'

interface ErrorDisplayProps {
  title?: string
  message: string
  onRetry?: () => void
  showIcon?: boolean
  style?: any
}

const ErrorDisplay = ({ 
  title = "Something went wrong", 
  message, 
  onRetry, 
  showIcon = true,
  style 
}: ErrorDisplayProps) => {
  const { colors } = useTheme()

  return (
    <View style={[styles.container, style]}>
      {showIcon && (
        <CustomIcon 
          name="alert-circle" 
          type="feather" 
          size={60} 
          color="#FF4444" 
          style={styles.icon}
        />
      )}
      <CustomText fontSize="large" bold style={styles.title}>
        {title}
      </CustomText>
      <CustomText 
        fontSize="normal" 
        textAlign="center" 
        style={{ ...styles.message, color: colors.text }}
      >
        {message}
      </CustomText>
      {onRetry && (
        <CustomButton
          title="Try Again"
          onPress={onRetry}
          style={styles.retryButton}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    marginBottom: 20,
    opacity: 0.8,
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 10,
  },
})

export default ErrorDisplay 