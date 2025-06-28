import CustomButton from "@/components/CustomButton"
import CustomIcon from "@/components/CustomIcon"
import CustomInput from "@/components/CustomInput"
import CustomText from "@/components/CustomText"
import Page from "@/components/Page"
import useUserStore from "@/stores/userStore"
import notificationService from "@/utils/notificationService"
import { useTheme } from "@react-navigation/native"
import { useState } from "react"
import { Alert, StyleSheet, Switch, View } from "react-native"

const NotificationSettings = () => {
    const { colors } = useTheme()
    const {
        notificationsEnabled,
        setNotificationsEnabled,
        dailyWordNotificationTime,
        setDailyWordNotificationTime,
    } = useUserStore()

    // Parse current time to get hour and minute
    const [hour, minute] = dailyWordNotificationTime.split(':').map(Number)
    const [hourInput, setHourInput] = useState(hour.toString())
    const [minuteInput, setMinuteInput] = useState(minute.toString().padStart(2, '0'))

    const handleToggleNotifications = async (enabled: boolean) => {
        try {
            if (enabled) {
                const hasPermission = await notificationService.requestPermissions()
                if (hasPermission) {
                    setNotificationsEnabled(true)
                    await notificationService.scheduleDailyWordNotification(dailyWordNotificationTime)
                    Alert.alert('Notifications Enabled', `You'll receive daily word reminders at ${dailyWordNotificationTime}`)
                } else {
                    Alert.alert('Permission Denied', 'Please enable notifications in your device settings.')
                    return
                }
            } else {
                setNotificationsEnabled(false)
                await notificationService.cancelAllNotifications()
                Alert.alert('Notifications Disabled', 'You will no longer receive daily word reminders.')
            }
        } catch (error) {
            console.error('Error toggling notifications:', error)
            Alert.alert('Error', 'Failed to update notification settings.')
        }
    }

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

    const handleSaveTime = async () => {
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

        try {
            if (notificationsEnabled) {
                await notificationService.scheduleDailyWordNotification(dailyWordNotificationTime)
                Alert.alert('Time Updated', `Notifications will now be sent at ${dailyWordNotificationTime}`)
            }
        } catch (error) {
            console.error('Error updating notification time:', error)
            Alert.alert('Error', 'Failed to update notification time.')
        }
    }

    const handleTestNotification = async () => {
        try {
            await notificationService.sendImmediateNotification({
                type: 'daily_words',
                title: '📚 Test Notification',
                body: 'This is a test notification from Termy!',
            })
            Alert.alert('Test Sent', 'Check your notifications to see the test message.')
        } catch (error) {
            console.error('Error sending test notification:', error)
            Alert.alert('Error', 'Failed to send test notification.')
        }
    }

    return (
        <Page style={styles.container}>
            <View style={styles.header}>
                <CustomText bold fontSize="XL">Notification Settings</CustomText>
                <CustomText opacity={0.7} style={{marginTop: "2%"}}>
                    Manage your daily word reminders
                </CustomText>
            </View>

            {/* Enable/Disable Notifications */}
            <View style={[styles.section, { borderBottomColor: colors.border }]}>
                <View style={styles.sectionHeader}>
                    <CustomIcon name="notifications" size={24} primary />
                    <View style={styles.sectionText}>
                        <CustomText bold>Daily Word Notifications</CustomText>
                        <CustomText fontSize="small" opacity={0.7}>
                            Receive reminders when new words are available
                        </CustomText>
                    </View>
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={handleToggleNotifications}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={colors.background}
                    />
                </View>
            </View>

            {/* Notification Time */}
            {notificationsEnabled && (
                <View style={[styles.section, { borderBottomColor: colors.border }]}>
                    <View style={styles.sectionHeader}>
                        <CustomIcon name="time" size={24} primary />
                        <View style={styles.sectionText}>
                            <CustomText bold>Notification Time</CustomText>
                            <CustomText fontSize="small" opacity={0.7}>
                                Set when you want to receive daily reminders
                            </CustomText>
                        </View>
                    </View>
                    
                    <View style={styles.timeInputContainer}>
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
                        <CustomButton 
                            title="Save Time" 
                            onPress={handleSaveTime}
                            style={styles.saveButton}
                        />
                    </View>
                </View>
            )}

            {/* Test Notification */}
            {notificationsEnabled && (
                <View style={[styles.section, { borderBottomColor: colors.border }]}>
                    <View style={styles.sectionHeader}>
                        <CustomIcon name="send" size={24} primary />
                        <View style={styles.sectionText}>
                            <CustomText bold>Test Notifications</CustomText>
                            <CustomText fontSize="small" opacity={0.7}>
                                Send a test notification to verify settings
                            </CustomText>
                        </View>
                    </View>
                    <CustomButton 
                        title="Send Test Notification" 
                        onPress={handleTestNotification}
                        style={styles.testButton}
                    />
                </View>
            )}

            {/* Info Section */}
            <View style={styles.infoSection}>
                <CustomIcon name="information-circle" size={20} style={{opacity: 0.7}} />
                <CustomText fontSize="small" opacity={0.7} style={styles.infoText}>
                    Notifications help you maintain your learning streak by reminding you to practice daily words.
                </CustomText>
            </View>
        </Page>
    )
}

export default NotificationSettings

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: "5%",
    },
    header: {
        marginBottom: "8%",
    },
    section: {
        paddingVertical: "4%",
        borderBottomWidth: 1,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: "3%",
    },
    sectionText: {
        flex: 1,
        marginLeft: "3%",
    },
    timeInputContainer: {
        marginTop: "3%",
    },
    timeInputRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "4%",
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
        marginTop: "2%",
    },
    saveButton: {
        alignSelf: "center",
        width: "40%",
    },
    testButton: {
        marginTop: "3%",
        width: "100%",
    },
    infoSection: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginTop: "8%",
        padding: "4%",
        backgroundColor: "rgba(255, 106, 0, 0.1)",
        borderRadius: 10,
    },
    infoText: {
        flex: 1,
        marginLeft: "3%",
        lineHeight: 20,
    },
})