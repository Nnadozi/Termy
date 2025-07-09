import useUserStore from "@/stores/userStore"
import notificationService from "@/utils/notificationService"
import { useTheme } from "@react-navigation/native"
import { router } from "expo-router"
import { Alert, Modal, Pressable, StyleSheet, Switch, View } from "react-native"
import CustomButton from "./CustomButton"
import CustomIcon from "./CustomIcon"
import CustomText from "./CustomText"

interface NotificationsModalProps {
    visible: boolean
    onRequestClose: () => void
}

const NotificationsModal = ({visible, onRequestClose}: NotificationsModalProps) => {
    const { colors } = useTheme();
    const { notificationsEnabled, setNotificationsEnabled, dailyWordNotificationTime } = useUserStore();

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
        <Modal animationType='fade' transparent visible={visible} onRequestClose={onRequestClose}>
            <Pressable onPress={onRequestClose} style={styles.backdrop}>    
                <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                    <View style={styles.header}>
                        <CustomIcon name="chevron-left" size={30} onPress={() => router.back()} />
                        <CustomText bold textAlign="center">Notifications</CustomText>
                        <View />
                    </View>
                    
                    <View style={styles.section}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingText}>
                                <CustomText bold>Daily Word Reminders</CustomText>
                                <CustomText fontSize="small" opacity={0.7}>
                                    Get notified when new words are available
                                </CustomText>
                                {notificationsEnabled && (
                                    <CustomText fontSize="small" primary style={{marginTop: "2%"}}>
                                        Currently set for {formatTimeForDisplay(dailyWordNotificationTime)}
                                    </CustomText>
                                )}
                            </View>
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={handleToggleNotifications}
                                trackColor={{ false: colors.border, true: colors.primary }}
                                thumbColor={colors.background}
                            />
                        </View>
                    </View>

                    {notificationsEnabled && (
                        <View style={styles.section}>
                            <CustomButton 
                                title="Send Test Notification" 
                                onPress={handleTestNotification}
                                style={styles.testButton}
                            />
                        </View>
                    )}

                    <CustomButton title="Close" onPress={onRequestClose} style={styles.closeButton} />
                </View>
            </Pressable>
        </Modal>
    )
}

export default NotificationsModal

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        borderRadius: 10,
        padding: "5%",
        width: "85%",
        maxWidth: 400,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    section: {
        marginBottom: "5%",
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    settingText: {
        flex: 1,
        marginRight: "5%",
    },
    testButton: {
        width: "100%",
    },
    closeButton: {
        width: "100%",
        marginTop: "2%",
    }
})