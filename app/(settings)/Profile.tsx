import ColorPickerModal from "@/components/ColorPickerModal";
import CustomButton from "@/components/CustomButton";
import CustomIcon from "@/components/CustomIcon";
import CustomInput from "@/components/CustomInput";
import CustomText from "@/components/CustomText";
import LoadingSpinner from "@/components/LoadingSpinner";
import Page from "@/components/Page";
import useUserStore, { allWordTopics, resetUserStore } from "@/stores/userStore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@react-navigation/native';
import { Avatar, Chip } from '@rneui/base';
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

const Profile = () => {
  const { 
    userName, 
    avatarColor, 
    dailyWordGoal, 
    wordTopics,
    joinDate,
    setUserName,
    setAvatarColor,
    setDailyWordGoal,
    setWordTopics,
  } = useUserStore()
  
  const { colors } = useTheme()
  
  const [isEditing, setIsEditing] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [tempUserName, setTempUserName] = useState(userName)
  const [tempAvatarColor, setTempAvatarColor] = useState(avatarColor)
  const [tempDailyWordGoal, setTempDailyWordGoal] = useState(dailyWordGoal.toString())
  const [tempWordTopics, setTempWordTopics] = useState(wordTopics)
  
  // Secure deletion states
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('')
  const [usernameConfirmation, setUsernameConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Track if there are unsaved changes
  const hasUnsavedChanges = 
    tempUserName !== userName ||
    tempAvatarColor !== avatarColor ||
    tempDailyWordGoal !== dailyWordGoal.toString() ||
    JSON.stringify(tempWordTopics) !== JSON.stringify(wordTopics)

  const handleSave = () => {
    if (tempUserName.trim().length === 0) {
      Alert.alert('Error', 'Display name cannot be empty')
      return
    }
    
    const goal = parseInt(tempDailyWordGoal)
    if (isNaN(goal) || goal < 1 || goal > 10) {
      Alert.alert('Error', 'Daily word goal must be between 1 and 10')
      return
    }
    
    setUserName(tempUserName.trim())
    setAvatarColor(tempAvatarColor)
    setDailyWordGoal(goal)
    setWordTopics(tempWordTopics)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTempUserName(userName)
    setTempAvatarColor(avatarColor)
    setTempDailyWordGoal(dailyWordGoal.toString())
    setTempWordTopics(wordTopics)
    setIsEditing(false)
  }

  // Secure deletion functions
  const initiateDeleteProfile = () => {
    Alert.alert(
      'Delete Profile',
      'Are you sure you want to delete your profile? This will permanently erase all your data, learning progress, and custom lists. The default "Learned" list will be preserved but emptied. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          style: 'destructive',
          onPress: () => setShowDeleteConfirmation(true)
        }
      ]
    )
  }

  const confirmDeleteProfile = () => {
    if (deleteConfirmationText.trim() !== 'DELETE') {
      Alert.alert('Error', 'Please type "DELETE" exactly to confirm')
      return
    }
    
    // Add null/undefined checks for userName
    if (!userName || !usernameConfirmation.trim() || usernameConfirmation.trim() !== userName.trim()) {
      Alert.alert('Error', 'Username does not match. Please enter your exact username.')
      return
    }

    // Final confirmation with different wording
    Alert.alert(
      'Final Confirmation',
      'This is your last chance to cancel. Your profile and all data will be permanently deleted and cannot be recovered. The default "Learned" list will be preserved but emptied. Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes, Delete Everything', 
          style: 'destructive',
          onPress: performDeleteProfile
        }
      ]
    )
  }

  const performDeleteProfile = async () => {
    setIsDeleting(true)
    
    try {
      console.log('Starting profile deletion process...')
      
      // Step 1: Cancel notifications first (safest operation)
      console.log('Step 1: Cancelling notifications...')
      try {
        const notificationService = await import('@/utils/notificationService')
        await notificationService.default.cancelAllNotifications()
        console.log('Notifications cancelled successfully')
      } catch (notifError) {
        console.log('Notification cancellation failed, but continuing:', notifError)
      }
      
      // Step 2: Reset user store first (this is safe)
      console.log('Step 2: Resetting user store...')
      try {
        resetUserStore()
        console.log('User store reset successfully')
      } catch (storeError) {
        console.log('User store reset failed, but continuing:', storeError)
      }
      
      // Step 3: Clear AsyncStorage (this can be problematic on iOS)
      console.log('Step 3: Clearing AsyncStorage...')
      try {
        // Clear specific keys instead of all storage
        const keys = await AsyncStorage.getAllKeys()
        if (keys.length > 0) {
          await AsyncStorage.multiRemove(keys)
          console.log('AsyncStorage cleared successfully')
        }
      } catch (storageError) {
        console.log('AsyncStorage clear failed, but continuing:', storageError)
      }
      
      // Step 4: Clear database (this is the most likely crash point)
      console.log('Step 4: Clearing database...')
      try {
        if (Platform.OS === 'ios') {
          // Use iOS-safe approach
          const { clearUserDataIOSSafe } = await import('@/database/wordCache')
          await clearUserDataIOSSafe()
          console.log('Database cleared successfully (iOS-safe)')
        } else {
          // Use regular approach for Android
          const { clearUserData } = await import('@/database/wordCache')
          await clearUserData()
          console.log('Database cleared successfully (Android)')
        }
      } catch (dbError) {
        console.log('Database clear failed, but continuing:', dbError)
      }
      
      // Step 5: Navigate to onboarding
      console.log('Step 5: Navigating to onboarding...')
      
      // Use a longer delay and try multiple navigation approaches
      setTimeout(() => {
        try {
          console.log('Attempting navigation with router.replace...')
          router.replace('/(onboarding)')
        } catch (navError1) {
          console.log('router.replace failed, trying router.push...', navError1)
          try {
            router.push('/(onboarding)')
          } catch (navError2) {
            console.log('router.push failed, trying router.navigate...', navError2)
            try {
              router.navigate('/(onboarding)')
            } catch (navError3) {
              console.log('All navigation methods failed:', navError3)
              // Last resort: show an alert and let user manually navigate
              Alert.alert(
                'Profile Deleted',
                'Your profile has been deleted successfully. Please restart the app to continue.',
                [{ text: 'OK' }]
              )
            }
          }
        }
      }, 1000) // Increased delay to 1 second
      
    } catch (error) {
      console.error('Critical error during profile deletion:', error)
      Alert.alert(
        'Deletion Error', 
        'There was an error deleting your profile. Please try again or restart the app.',
        [{ text: 'OK' }]
      )
    } finally {
      setIsDeleting(false)
    }
  }

  const cancelDeleteProfile = () => {
    setShowDeleteConfirmation(false)
    setDeleteConfirmationText('')
    setUsernameConfirmation('')
  }

  const toggleTopic = (topic: string) => {
    if (isEditing) {
      setTempWordTopics(prev =>
        prev.includes(topic)
          ? prev.filter((t) => t !== topic)
          : [...prev, topic]
      )
    }
  }

  const formatJoinDate = (dateString: string) => {
    if (!dateString) return 'Not available'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
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
          <CustomIcon name="chevron-left"  onPress={() => router.back()}  />
          <CustomText bold  fontSize='large'>Profile</CustomText>
          <View/> 
        </View>

        {/* Avatar Section */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <CustomText textAlign="center"  bold style={{ marginBottom: 15, textAlign: 'center' }}>
            Profile Picture
          </CustomText>
          <View style={styles.avatarContainer}>
            <TouchableOpacity 
              onPress={() => isEditing && setShowColorPicker(true)}
              disabled={!isEditing}
            >
              <Avatar 
                size={100} 
                rounded 
                title={tempUserName.charAt(0).toUpperCase() || "A"}
                containerStyle={{ 
                  alignSelf: "center", 
                  backgroundColor: tempAvatarColor,
                  opacity: isEditing ? 1 : 0.8
                }} 
              />
            </TouchableOpacity>
            {isEditing && (
              <CustomText fontSize='small' style={{ marginTop: 10, opacity: 0.7 }}>
                Tap to change color
              </CustomText>
            )}
          </View>
        </View>

        {/* Display Name Section */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <CustomText  bold style={{ marginBottom: 15 }}>
            Display Name
          </CustomText>
          {isEditing ? (
            <CustomInput
              value={tempUserName}
              onChangeText={setTempUserName}
              placeholder="Enter display name"
              maxLength={20}
            />
          ) : (
            <CustomText fontSize='normal' style={{ opacity: 0.8 }}>
              {userName || 'Not set'}
            </CustomText>
          )}
        </View>

        {/* Daily Word Goal Section */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <CustomText  bold style={{ marginBottom: 15 }}>
            Daily Word Goal
          </CustomText>
          {isEditing ? (
            <CustomInput
              value={tempDailyWordGoal}
              onChangeText={setTempDailyWordGoal}
              placeholder="Enter daily goal (1-10)"
              keyboardType="number-pad"
              maxLength={1}
            />
          ) : (
            <CustomText fontSize='normal' style={{ opacity: 0.8 }}>
              {dailyWordGoal} words per day
            </CustomText>
          )}
        </View>

        {/* Topics Section */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <CustomText  bold style={{ marginBottom: 15 }}>
            Learning Topics
          </CustomText>
          <View style={styles.topicsContainer}>
            {allWordTopics.map((topic) => (
              <Chip
                key={topic}
                title={topic.charAt(0).toUpperCase() + topic.slice(1)}
                type={tempWordTopics.includes(topic) ? 'solid' : 'outline'}
                onPress={() => toggleTopic(topic)}
                disabled={!isEditing}
                containerStyle={{ marginVertical: 5, marginRight:10 }}
                buttonStyle={{
                  backgroundColor: tempWordTopics.includes(topic)
                    ? colors.primary
                    : 'transparent',
                  borderColor: colors.primary,
                  borderWidth: 1,
                }}
                titleStyle={{
                  color: tempWordTopics.includes(topic)
                    ? colors.background
                    : colors.primary,
                  fontFamily: 'DMSans-Regular',
                }}
              />
            ))}
          </View>
          {!isEditing && (
            <CustomText fontSize='small' style={{ marginTop: 10, opacity: 0.7 }}>
              Tap "Edit Profile" to change topics
            </CustomText>
          )}
        </View>

        {/* Join Date Section */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <CustomText  bold style={{ marginBottom: 15 }}>
            Account Information
          </CustomText>
          <View style={styles.infoRow}>
            <CustomText fontSize='normal' bold>Member since:</CustomText>
            <CustomText fontSize='normal' style={{ opacity: 0.8 }}>
              {formatJoinDate(joinDate)}
            </CustomText>
          </View>
        </View>

        {/* Delete Profile Section */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <CustomText  bold style={{ marginBottom: 15, color: '#FF4444' }}>
            Danger Zone
          </CustomText>
          <CustomText fontSize='normal' style={{ marginBottom: 20, opacity: 0.8 }}>
            This action will permanently delete your profile and all learning progress. Custom lists will be deleted, but the default "Learned" list will be preserved and emptied. This cannot be undone.
          </CustomText>
          <CustomButton
            title="Delete Profile"
            onPress={initiateDeleteProfile}
            style={{ 
              width: '100%', 
              padding: 15, 
              borderRadius: 8, 
              marginBottom: 10, 
              backgroundColor: '#FF4444' 
            }}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {isEditing ? (
            <View style={styles.editButtons}>
              <CustomButton
                title="Save"
                onPress={handleSave}
                style={styles.button}
              />
              <CustomButton
                title="Cancel"
                onPress={handleCancel}
                style={styles.button}
              />
            </View>
          ) : (
            <CustomButton
              title="Edit Profile"
              onPress={() => setIsEditing(true)}
              style={styles.button}
            />
          )}
        </View>

        {/* Save Changes Button - Shows when there are unsaved changes */}
        {!isEditing && hasUnsavedChanges && (
          <View style={styles.buttonContainer}>
            <CustomButton
              title="Save Changes"
              onPress={handleSave}
              style={{ 
                width: '100%', 
                padding: 15, 
                borderRadius: 8, 
                backgroundColor: colors.primary 
              }}
            />
          </View>
        )}

        {/* Color Picker Modal */}
        <ColorPickerModal
          visible={showColorPicker}
          onClose={() => setShowColorPicker(false)}
          onColorSelect={setTempAvatarColor}
          initialColor={tempAvatarColor}
        />
      </ScrollView>

      {/* Secure Deletion Confirmation Modal - Outside ScrollView */}
      {showDeleteConfirmation && (
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Header with Icon */}
            <View style={styles.modalHeader}>
              <CustomIcon name="warning" size={32} style={{ marginBottom: 10 }} primary />
              <CustomText fontSize='XL' bold style={{ color: '#FF4444', textAlign: 'center' }}>
                Confirm Deletion
              </CustomText>
            </View>
            
            <CustomText fontSize='normal' style={{ marginBottom: 25, textAlign: 'center', opacity: 0.8 }}>
              This action will permanently delete your profile and all data. Please complete the verification steps below.
            </CustomText>

            {/* Step 1 */}
            <View style={styles.confirmationStep}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <CustomText fontSize="small" bold style={{ color: colors.background }}>1</CustomText>
                </View>
                <CustomText fontSize='normal' bold style={{ marginLeft: 12 }}>
                  Type "DELETE" to confirm
                </CustomText>
              </View>
              <CustomInput
                value={deleteConfirmationText}
                onChangeText={setDeleteConfirmationText}
                placeholder="Type DELETE"
                style={{
                  ...styles.confirmationInput,
                  borderColor: colors.border,
                  backgroundColor: colors.background
                }}
                maxLength={10}
                textAlign="center"
              />
            </View>

            {/* Step 2 */}
            <View style={styles.confirmationStep}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <CustomText fontSize="small" bold style={{ color: colors.background }}>2</CustomText>
                </View>
                <CustomText fontSize='normal' bold style={{ marginLeft: 12 }}>
                  Enter your username
                </CustomText>
              </View>
              <CustomText fontSize='small' style={{ marginBottom: 8, opacity: 0.7, marginLeft: 44 }}>
                Username: <CustomText bold>{userName}</CustomText>
              </CustomText>
              <CustomInput
                value={usernameConfirmation}
                onChangeText={setUsernameConfirmation}
                placeholder="Enter your username"
                style={{
                  ...styles.confirmationInput,
                  borderColor: colors.border,
                  backgroundColor: colors.background
                }}
                maxLength={20}
                textAlign="center"
              />
            </View>

            {/* Help text */}
            {(deleteConfirmationText !== 'DELETE' || !userName || usernameConfirmation.trim() !== userName.trim()) && (
              <View style={[styles.helpText, { borderTopColor: colors.border }]}>
                <CustomIcon name="info" size={16} primary style={{ marginRight: 8 }} />
                <CustomText fontSize='small' style={{ opacity: 0.7, flex: 1 }}>
                  {deleteConfirmationText !== 'DELETE' && 'Please type "DELETE" exactly'}
                  {deleteConfirmationText === 'DELETE' && (!userName || usernameConfirmation.trim() !== userName.trim()) && 'Please enter your username correctly'}
                </CustomText>
              </View>
            )}

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <CustomButton
                title="Cancel"
                onPress={cancelDeleteProfile}
                style={{
                  ...styles.modalButton,
                  backgroundColor: colors.border
                }}
              />
              <CustomButton
                title={isDeleting ? "Deleting..." : "Confirm Deletion"}
                onPress={confirmDeleteProfile}
                disabled={isDeleting || deleteConfirmationText.trim() !== 'DELETE' || !userName || usernameConfirmation.trim() !== userName.trim()}
                style={{
                  ...styles.modalButton,
                  backgroundColor: (deleteConfirmationText.trim() === 'DELETE' && userName && usernameConfirmation.trim() === userName.trim()) ? '#FF4444' : '#CCCCCC',
                  opacity: (deleteConfirmationText.trim() === 'DELETE' && userName && usernameConfirmation.trim() === userName.trim()) ? 1 : 0.6
                }}
              />
              {isDeleting && (
                <View style={{ alignItems: 'center', marginTop: 15 }}>
                  <LoadingSpinner 
                    text="Deleting profile..."
                    variant="inline"
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      )}
    </Page>
  )
}

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
  avatarContainer: {
    alignItems: 'center',
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    width: '48%',
  },
  deleteButton: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
  },
  modalContent: {
    width: '85%',
    maxWidth: 400,
    padding: 25,
    borderRadius: 16,
    borderWidth: 1,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  confirmationStep: {
    marginBottom: 20,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  confirmationInput: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 15,
  },
  modalButton: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
  },
  helpText: {
    marginTop: 10,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
  },
})

export default Profile