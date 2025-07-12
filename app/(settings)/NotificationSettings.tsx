import CustomButton from "@/components/CustomButton"
import CustomIcon from "@/components/CustomIcon"
import CustomText from "@/components/CustomText"
import Page from "@/components/Page"
import useUserStore from "@/stores/userStore"
import notificationService from "@/utils/notificationService"
import DateTimePicker from '@react-native-community/datetimepicker'
import { useTheme } from "@react-navigation/native"
import { router } from "expo-router"
import { useState } from "react"
import { Alert, Platform, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from "react-native"

const NotificationSettings = () => {
    const { colors } = useTheme()
    const {
        notificationsEnabled,
        setNotificationsEnabled,
        dailyWordNotificationTime,
        setDailyWordNotificationTime,
    } = useUserStore()

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

    const handleToggleNotifications = async (enabled: boolean) => {
        try {
            if (enabled) {
                const hasPermission = await notificationService.requestPermissions()
                if (hasPermission) {
                    setNotificationsEnabled(true)
                    await notificationService.scheduleDailyWordNotification(dailyWordNotificationTime)
                    Alert.alert('Notifications Enabled', `You'll receive daily word reminders at ${formatTimeForDisplay(dailyWordNotificationTime)}!`)
                } else {
                    Alert.alert('Permission Denied', 'Please enable notifications in your device settings.')
                    return
                }
            } else {
                setNotificationsEnabled(false)
                Alert.alert('Notifications Disabled', 'You will no longer receive daily word reminders.')
            }
        } catch (error) {
            console.error('Error toggling notifications:', error)
            Alert.alert('Error', 'Failed to update notification settings.')
        }
    }

    const handleSaveTime = async () => {
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
        <Page style={{ justifyContent: "flex-start", alignItems: "flex-start" }}>
            <ScrollView
                style={{ flex: 1, width: '100%' }}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.topRow}>
                    <CustomIcon name="chevron-left" onPress={() => router.back()} />
                    <CustomText  fontSize='large' bold >Notifications</CustomText>
                    <View/>
                </View>

                {/* Main Toggle Section */}
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.toggleContainer}>
                        <View style={styles.toggleInfo}>
                            <CustomIcon name="notifications" size={24} primary />
                            <View style={styles.toggleText}>
                                <CustomText bold>Enable Notifications</CustomText>
                                <CustomText fontSize="small" opacity={0.7}>
                                    Get notified when your daily words are ready
                                </CustomText>
                            </View>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={handleToggleNotifications}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor={notificationsEnabled ? colors.background : colors.text}
                        />
                    </View>
                </View>

                {/* Time Settings Section */}
                {notificationsEnabled && (
                    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.timeContainer}>
                            <View style={styles.timeInfo}>
                                <CustomIcon name="timer" size={24} primary />
                                <View style={styles.timeText}>
                                    <CustomText bold>Daily Reminder Time</CustomText>
                                    <CustomText fontSize="small" opacity={0.7}>
                                        Set when you want to receive daily reminders
                                    </CustomText>
                                </View>
                            </View>
                            
                            <TouchableOpacity 
                                style={[styles.timePickerButton, { borderColor: colors.border, backgroundColor: colors.background }]}
                                onPress={() => setShowTimePicker(true)}
                            >
                                <CustomText fontSize="large" bold style={{color: colors.text}}>
                                    {formatTimeForDisplay(dailyWordNotificationTime)}
                                </CustomText>
                                <CustomText fontSize="small" opacity={0.7} style={{marginTop: 4}}>
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

                            <CustomButton
                                title="Save Time"
                                onPress={handleSaveTime}
                                style={styles.saveButton}
                            />
                        </View>
                    </View>
                )}

                {/* Test Notification Section */}
                {notificationsEnabled && (
                    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.testContainer}>
                            <View style={styles.testInfo}>
                                <CustomIcon name="send" size={24} primary />
                                <View style={styles.testText}>
                                    <CustomText bold>Send Test Notification</CustomText>
                                    <CustomText fontSize="small" opacity={0.7}>
                                        Verify your notification settings are working
                                    </CustomText>
                                </View>
                            </View>
                            <CustomButton
                                title="Send Test"
                                onPress={handleTestNotification}
                                style={styles.testButton}
                            />
                        </View>
                    </View>
                )}

                {/* Info Section */}
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <CustomText  bold style={{ marginBottom: 15 }}>
                        About Notifications
                    </CustomText>
                    <View style={styles.infoContainer}>
                        <CustomIcon name="info" size={20} primary />
                        <View style={styles.infoText}>
                            <CustomText fontSize="small">
                                Notifications help you maintain your learning streak by reminding you when new words are available. 
                                You can change these settings at any time.
                            </CustomText>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </Page>
    )
}

export default NotificationSettings

const styles = StyleSheet.create({
    topRow: {
        width: "100%",
        marginBottom: "3%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    section: {
        width: '100%',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 15,
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    toggleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    toggleText: {
        marginLeft: 12,
        flex: 1,
    },
    timeContainer: {
        alignItems: 'flex-start',
    },
    timeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    timeText: {
        marginLeft: 12,
        flex: 1,
    },
    timePickerButton: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 150,
        alignSelf: 'center',
        marginBottom: 15,
    },
    timePicker: {
        marginTop: 10,
    },
    saveButton: {
        alignSelf: "center",
        width: "40%",
    },
    testContainer: {
        alignItems: 'flex-start',
    },
    testInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    testText: {
        marginLeft: 12,
        flex: 1,
    },
    testButton: {
        alignSelf: 'center',
        width: "40%",
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    infoText: {
        flex: 1,
        marginLeft: 12,
        lineHeight: 20,
    },
})