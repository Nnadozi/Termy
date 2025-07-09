import CustomButton from "@/components/CustomButton"
import CustomIcon from "@/components/CustomIcon"
import CustomInput from "@/components/CustomInput"
import CustomText from "@/components/CustomText"
import Page from "@/components/Page"
import useUserStore from "@/stores/userStore"
import notificationService from "@/utils/notificationService"
import { useTheme } from "@react-navigation/native"
import { router } from "expo-router"
import { useState } from "react"
import { Alert, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from "react-native"

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

    const handleToggleNotifications = async (enabled: boolean) => {
        try {
            if (enabled) {
                const hasPermission = await notificationService.requestPermissions()
                if (hasPermission) {
                    setNotificationsEnabled(true)
                    await notificationService.scheduleDailyWordNotification(dailyWordNotificationTime)
                    Alert.alert('Notifications Enabled', `You'll receive daily word reminders at ${formatTimeForDisplay(dailyWordNotificationTime)}`)
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

    const handleSaveTime = async () => {
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

        try {
            if (notificationsEnabled) {
                await notificationService.scheduleDailyWordNotification(dailyWordNotificationTime)
                Alert.alert('Time Updated', `Notifications will now be sent at ${formatTimeForDisplay(dailyWordNotificationTime)}`)
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
            {/* Header with back button */}
            <View style={styles.topRow}>
                <CustomIcon name="chevron-left" onPress={() => router.back()} />
                <CustomText bold fontSize='XL'>Notification Settings</CustomText>
                <View/>
            </View>

            <ScrollView 
                style={{ flex: 1, width: '100%' }}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
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
                                    <CustomText fontSize="small" opacity={0.7}>Hour (1-12)</CustomText>
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
                                <View style={styles.ampmContainer}>
                                    <TouchableOpacity 
                                        style={[styles.ampmButton, !isPM && styles.ampmButtonActive]} 
                                        onPress={() => !isPM || handleAMPMToggle()}
                                    >
                                        <CustomText style={!isPM ? styles.ampmTextActive : styles.ampmText}>AM</CustomText>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.ampmButton, isPM && styles.ampmButtonActive]} 
                                        onPress={() => isPM || handleAMPMToggle()}
                                    >
                                        <CustomText style={isPM ? styles.ampmTextActive : styles.ampmText}>PM</CustomText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <CustomText fontSize="small" opacity={0.7} style={{marginTop: "2%", textAlign: "center"}}>
                                Current time: {formatTimeForDisplay(dailyWordNotificationTime)}
                            </CustomText>
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
            </ScrollView>
        </Page>
    )
}

export default NotificationSettings

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: "5%",
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '5%',
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
    ampmContainer: {
        marginLeft: "5%",
        flexDirection: "row",
        gap: 2,
    },
    ampmButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    ampmButtonActive: {
        backgroundColor: '#FF6A00',
        borderColor: '#FF6A00',
    },
    ampmText: {
        fontSize: 14,
        color: '#666',
    },
    ampmTextActive: {
        fontSize: 14,
        color: 'white',
        fontWeight: 'bold',
    },
    saveButton: {
        alignSelf: "center",
        width: "40%",
        marginTop: "3%",
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