import CustomIcon from "@/components/CustomIcon"
import CustomInput from "@/components/CustomInput"
import CustomText from "@/components/CustomText"
import OnboardingPage from "@/components/OnboardingPage"
import useUserStore from "@/stores/userStore"
import notificationService from "@/utils/notificationService"
import { useTheme } from "@react-navigation/native"
import { useRouter } from "expo-router"
import { useState } from "react"
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native"

const NotificationsSetup = () => {
  const {colors} = useTheme()
  const {
    notificationsEnabled, setNotificationsEnabled,
    dailyWordNotificationTime, setDailyWordNotificationTime,
} = useUserStore()
  const router = useRouter()

  // Parse current time to get hour and minute
  const [hour, minute] = dailyWordNotificationTime.split(':').map(Number)
  const [hourInput, setHourInput] = useState(hour > 12 ? (hour - 12).toString() : (hour === 0 ? '12' : hour.toString()))
  const [minuteInput, setMinuteInput] = useState(minute.toString().padStart(2, '0'))
  const [isPM, setIsPM] = useState(hour >= 12)

  const handleHourChange = (text: string) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '')
    
    // Prevent hours above 12
    const hour = parseInt(numericText) || 0
    if (hour > 12) return
    
    setHourInput(numericText)
    updateTimeString(numericText, minuteInput, isPM)
  }

  const handleMinuteChange = (text: string) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '')
    
    // Prevent minutes above 59
    const minute = parseInt(numericText) || 0
    if (minute > 59) return
    
    setMinuteInput(numericText)
    updateTimeString(hourInput, numericText, isPM)
  }

  const handleAMPMToggle = () => {
    setIsPM(!isPM)
    updateTimeString(hourInput, minuteInput, !isPM)
  }

  const updateTimeString = (hour: string, minute: string, pm: boolean) => {
    let hourNum = parseInt(hour) || 0
    const minuteNum = parseInt(minute) || 0
    
    // Convert to 24-hour format for storage
    if (pm && hourNum !== 12) {
      hourNum += 12
    } else if (!pm && hourNum === 12) {
      hourNum = 0
    }
    
    const timeString = `${hourNum.toString().padStart(2, '0')}:${minuteNum.toString().padStart(2, '0')}`
    setDailyWordNotificationTime(timeString)
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
        // Do NOT schedule notifications here
        Alert.alert(
          'Notifications Enabled', 
          `You'll receive daily word reminders at ${formatTimeForDisplay(dailyWordNotificationTime)}`
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
    
    if (isNaN(hour) || hour < 1 || hour > 12) {
      Alert.alert('Invalid Hour', 'Hour must be between 1 and 12')
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
              {/* Time Input */}
              <View style={styles.inputContainer}>
               <View style={styles.timeInputRow}>
                  <View style={styles.inputWrapper}>
                    <CustomText bold style={styles.inputLabel}>Hour</CustomText>
                    <CustomInput
                      value={hourInput}
                      onChangeText={handleHourChange}
                      placeholder="9"
                      style={{
                        ...styles.timeInput,
                        borderColor: colors.border,
                        backgroundColor: colors.card,
                      }}
                      keyboardType="numeric"
                      maxLength={2}
               
                    />
                  </View>
                  
                  <CustomText fontSize="large" bold style={{
                    ...styles.separator,
                    color: colors.text
                  }}>:</CustomText>
                  
                  <View style={styles.inputWrapper}>
                    <CustomText bold style={styles.inputLabel}>Minute</CustomText>
                    <CustomInput
                      value={minuteInput}
                      onChangeText={handleMinuteChange}
                      placeholder="00"
                      style={{
                        ...styles.timeInput,
                        borderColor: colors.border,
                        backgroundColor: colors.card
                      }}
                      keyboardType="numeric"
                      maxLength={2}
                     
                    />
                  </View>
                </View>

                <View style={styles.ampmContainer}>
                  <TouchableOpacity 
                    style={{
                      ...styles.ampmButton,
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                      ...(!isPM && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary
                      })
                    }} 
                    onPress={() => !isPM || handleAMPMToggle()}
                  >
                    <CustomText style={{
                      color: !isPM ? colors.background : colors.text
                    }}>AM</CustomText>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={{
                      ...styles.ampmButton,
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                      ...(isPM && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary
                      })
                    }} 
                    onPress={() => isPM || handleAMPMToggle()}
                  >
                    <CustomText style={{
                      color: isPM ? colors.background : colors.text
                    }}>PM</CustomText>
                  </TouchableOpacity>
                </View>

                <CustomText opacity={0.7} style={styles.currentTime}>
                  Set for: <CustomText bold>{formatTimeForDisplay(dailyWordNotificationTime)}</CustomText>
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
  inputContainer: {
    width: "100%",
    alignItems: "center",
  },
  timeInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "5%",
  },
  inputWrapper: {
    alignItems: "center",
  },
  inputLabel: {
    marginBottom: "8%",
    textAlign: "center",
  },
  timeInput: {
    textAlign: "center",
    fontSize: 20,
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
  },
  separator: {
    marginHorizontal: "8%",
    textAlign: "center",
  },
  ampmContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  ampmButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  currentTime: {
    marginTop: "5%",
    textAlign: "center",
  },
})

