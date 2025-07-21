import CustomIcon from "@/components/CustomIcon"
import CustomText from "@/components/CustomText"
import OnboardingPage from "@/components/OnboardingPage"
import useUserStore from "@/stores/userStore"
import notificationService from "@/utils/notificationService"
import DateTimePicker from '@react-native-community/datetimepicker'
import { useTheme } from "@react-navigation/native"
import { useRouter } from "expo-router"
import { useState } from "react"
import { Alert, Platform, StyleSheet, TouchableOpacity, View } from "react-native"

const NotificationsSetup = () => {
  const {colors} = useTheme()
  const {
    notificationsEnabled, setNotificationsEnabled,
    dailyWordNotificationTime, setDailyWordNotificationTime,
} = useUserStore()
  const router = useRouter()

  // Parse current time to create a Date object
  const [hour, minute] = dailyWordNotificationTime.split(':').map(Number)
  const [selectedTime, setSelectedTime] = useState(() => {
    const date = new Date()
    date.setHours(hour, minute, 0, 0)
    return date
  })
  const [showTimePicker, setShowTimePicker] = useState(false)

  const handleTimeChange = (event: any, date?: Date) => {
    setShowTimePicker(Platform.OS === 'ios')
    if (date) {
      setSelectedTime(date)
      const timeString = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
      setDailyWordNotificationTime(timeString)
    }
  }

  const formatTimeForDisplay = (timeString: string) => {
    const [hour, minute] = timeString.split(':').map(Number)
    const hour12 = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`
  }

  const handleEnableNotifications = async () => {
    try {
      const hasPermission = await notificationService.requestPermissions()
      if (hasPermission) {
        setNotificationsEnabled(true)
        // Don't schedule notifications immediately during onboarding
        // They will be scheduled when onboarding completes
        Alert.alert('Notifications Enabled', `You'll receive daily word reminders at ${formatTimeForDisplay(dailyWordNotificationTime)}!`)
      } else {
        Alert.alert('Permission Denied', 'Please enable notifications in your device settings.')
      }
    } catch (error) {
      console.error('Error enabling notifications:', error)
      Alert.alert('Error', 'Failed to enable notifications.')
    }
  }

  const handleContinue = async () => {
    // Notifications are optional - users can continue without enabling them
    try {
      // Don't schedule notifications here - they will be scheduled when onboarding completes
      // Navigate to ProfileSetup instead of Finish
      router.push('/(onboarding)/ProfileSetup')
    } catch (error) {
      console.error('Error during navigation:', error)
      Alert.alert('Error', 'Failed to continue. Please try again.')
    }
  }

  return (
    <OnboardingPage
      progress={0.6}
      title="Notification Setup"
      subTitle="Get reminded to learn your daily words (optional)"
      nextPage="/(onboarding)/ProfileSetup"
      customOnPress={handleContinue}
      disableNext={false}
    >
        <View style={styles.content}>
          {!notificationsEnabled ? (
            <>
              <CustomIcon name="notifications" style={{marginBottom: "3%"}} size={125} primary/>
              <CustomText primary fontSize="large" bold textAlign="center">Enable Notifications</CustomText>
              <CustomText textAlign="center" gray>You can skip this and enable notifications later in Settings</CustomText>
              <CustomText 
                textAlign="center" bold
                primary fontSize="small" style={{marginTop: "3%"}}
                onPress={handleEnableNotifications}>
                Tap here to enable 
              </CustomText>
            </>
          ) : (
            <>           
              {/* Time Picker */}
              <View style={styles.timePickerContainer}>
              
                
                <TouchableOpacity 
                  style={{
                    ...styles.timePickerButton,
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                  }}
                  onPress={() => setShowTimePicker(true)}
                >
                  <CustomText fontSize="large" bold style={{color: colors.text}}>
                    {formatTimeForDisplay(dailyWordNotificationTime)}
                  </CustomText>
                  <CustomText fontSize="small" opacity={0.7} style={{marginTop: "2%"}}>
                    Tap to change time
                  </CustomText>
                </TouchableOpacity>

                {showTimePicker && (
                  <DateTimePicker
                    value={selectedTime}
                    mode="time"
                    is24Hour={false}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                    style={styles.timePicker}
                  />
                )}

                <CustomText primary style={styles.currentTime}>
                  Notification set for: <CustomText bold primary>{formatTimeForDisplay(dailyWordNotificationTime)}</CustomText>
                </CustomText>
              </View>

              <CustomText fontSize="small" textAlign="center" style={{marginTop: "2%"}}>
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
    alignSelf: "center",
  },
  timePickerContainer: {
    width: "100%",
    alignItems: "center",
  },
  timePickerLabel: {
    marginBottom: 10,
    textAlign: "center",
  },
  timePickerButton: {
    padding:30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 150,
  },
  timePicker: {
    marginTop: "5%",
  },
  currentTime: {
    marginTop: "5%",
    textAlign: "center",
  },
})

