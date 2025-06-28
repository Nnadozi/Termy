import CustomIcon from "@/components/CustomIcon"
import CustomInput from "@/components/CustomInput"
import CustomText from "@/components/CustomText"
import OnboardingPage from "@/components/OnboardingPage"
import useUserStore from "@/stores/userStore"
import notificationService from "@/utils/notificationService"
import { useTheme } from "@react-navigation/native"
import { useRouter } from "expo-router"
import { useState } from "react"
import { Alert, StyleSheet, View } from "react-native"

const NotificationsSetup = () => {
  const {colors} = useTheme()
  const {
    notificationsEnabled, setNotificationsEnabled,
    dailyWordNotificationTime, setDailyWordNotificationTime,
} = useUserStore()
  const router = useRouter()

  // Parse current time to get hour and minute
  const [hour, minute] = dailyWordNotificationTime.split(':').map(Number)
  const [hourInput, setHourInput] = useState(hour.toString())
  const [minuteInput, setMinuteInput] = useState(minute.toString().padStart(2, '0'))

  const handleHourChange = (text: string) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '')
    
    // Prevent hours above 23
    const hour = parseInt(numericText) || 0
    if (hour > 23) return
    
    setHourInput(numericText)
    const minute = parseInt(minuteInput) || 0
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    setDailyWordNotificationTime(timeString)
  }

  const handleMinuteChange = (text: string) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '')
    
    // Prevent minutes above 59
    const minute = parseInt(numericText) || 0
    if (minute > 59) return
    
    setMinuteInput(numericText)
    const hour = parseInt(hourInput) || 0
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    setDailyWordNotificationTime(timeString)
  }

  const handleEnableNotifications = async () => {
    try {
      const hasPermission = await notificationService.requestPermissions()
      if (hasPermission) {
        setNotificationsEnabled(true)
        // Do NOT schedule notifications here
        Alert.alert(
          'Notifications Enabled', 
          `You'll receive daily word reminders at ${dailyWordNotificationTime}`
        )
      } else {
        Alert.alert(
          'Permission Denied', 
          'Please enable notifications in your device settings to receive daily word reminders.'
        )
      }
    } catch (error) {
      console.error('Error enabling notifications:', error)
      Alert.alert('Error', 'Failed to enable notifications. Please try again.')
    }
  }

  const validateTime = async () => {
    const hour = parseInt(hourInput)
    const minute = parseInt(minuteInput)
    
    if (isNaN(hour) || hour < 0 || hour > 23) {
      Alert.alert('Invalid Hour', 'Hour must be between 0 and 23')
      return
    }
    
    if (isNaN(minute) || minute < 0 || minute > 59) {
      Alert.alert('Invalid Minute', 'Minute must be between 0 and 59')
      return
    }
    // Do NOT schedule notifications here
    // If validation passes, navigate manually
    router.navigate('/(onboarding)/ProfileSetup')
  }
  
  return (
    <OnboardingPage
      progress={0.6}
      title="Enable Notifications"
      subTitle="Know when new words are available"
      nextPage="/(onboarding)/ProfileSetup"
      style={styles.container}
      customOnPress={validateTime}
    >
      <View style={styles.content}>
        {!notificationsEnabled ? (
          <>
            <CustomIcon name="notifications" style={{marginBottom: "3%"}} size={125} primary/>
            <CustomText primary fontSize="large" bold textAlign="center">Enable Notifications</CustomText>
            <CustomText textAlign="center" opacity={0.5}>Know when your daily words are ready</CustomText>
            <CustomText 
              textAlign="center" bold
              primary fontSize="small" style={{marginTop: "3%"}}
              onPress={handleEnableNotifications}>
              Tap here to enable 
            </CustomText>
          </>
        ) : (
          <>
            <CustomText textAlign="center" bold fontSize="large">When do you want new words?</CustomText>
            <CustomText textAlign="center" opacity={0.7} style={{marginBottom: "5%"}}>
              Reminder notifications will be sent at this time
            </CustomText>
            
            {/* Time Input */}
            <View style={styles.inputContainer}>
              <CustomText bold style={{marginBottom: "3%"}}>Notification Time</CustomText>
              <View style={styles.timeInputRow}>
                <View style={styles.inputWrapper}>
                  <CustomText fontSize="small" opacity={0.7}>Hour (0-23)</CustomText>
                  <CustomInput
                    value={hourInput}
                    onChangeText={handleHourChange}
                    placeholder="9"
                    style={styles.timeInput}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
                <CustomText fontSize="large" bold style={{marginHorizontal: "5%"}}>:</CustomText>
                <View style={styles.inputWrapper}>
                  <CustomText fontSize="small" opacity={0.7}>Minute (0-59)</CustomText>
                  <CustomInput
                    value={minuteInput}
                    onChangeText={handleMinuteChange}
                    placeholder="00"
                    style={styles.timeInput}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
              </View>
              <CustomText fontSize="small" opacity={0.7} style={{marginTop: "2%"}}>
                Format: HH:MM (24-hour format)
              </CustomText>
            </View>

            <CustomText fontSize="small" textAlign="center" style={{marginTop: "5%"}}>
              You can change this later in Settings
            </CustomText>
          </>
        )}
      </View>
    </OnboardingPage>
  )
}

export default NotificationsSetup

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: "10%",
  },
  inputContainer: {
    width: "100%",
    alignItems: "center",
  },
  timeInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  inputWrapper: {
    alignItems: "center",
  },
  timeInput: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    width: 60,
    height: 60,
  },
})

