import ColorPickerModal from "@/components/ColorPickerModal";
import CustomButton from "@/components/CustomButton";
import CustomIcon from "@/components/CustomIcon";
import CustomInput from "@/components/CustomInput";
import CustomText from "@/components/CustomText";
import Page from "@/components/Page";
import useUserStore, { allWordTopics } from "@/stores/userStore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@react-navigation/native';
import { Avatar, Chip } from '@rneui/base';
import { router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

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
          <CustomText bold fontSize='XL'>Profile</CustomText>
          <View/> 
        </View>

        {/* Avatar Section */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <CustomText fontSize='large' bold style={{ marginBottom: 15, textAlign: 'center' }}>
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
          <CustomText fontSize='large' bold style={{ marginBottom: 15 }}>
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
          <CustomText fontSize='large' bold style={{ marginBottom: 15 }}>
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
          <CustomText fontSize='large' bold style={{ marginBottom: 15 }}>
            Learning Topics
          </CustomText>
          <View style={styles.topicsContainer}>
            {allWordTopics.map((topic) => (
              <Chip
                key={topic}
                title={topic}
                type={tempWordTopics.includes(topic) ? 'solid' : 'outline'}
                onPress={() => toggleTopic(topic)}
                disabled={!isEditing}
                containerStyle={{ marginVertical: "2%", marginRight:"3%" }}
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
          <CustomText fontSize='large' bold style={{ marginBottom: 15 }}>
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
          <CustomText fontSize='large' bold style={{ marginBottom: 15, color: '#FF4444' }}>
            Danger Zone
          </CustomText>
          <CustomText fontSize='normal' style={{ marginBottom: 20, opacity: 0.8 }}>
            This action will permanently delete your profile and all learning progress. This cannot be undone.
          </CustomText>
          <CustomButton
            title="Delete Profile"
            onPress={() => {
              Alert.alert(
                'Delete Profile',
                'Are you sure you want to delete your profile? This will permanently erase all your data and learning progress. This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        // Clear AsyncStorage completely
                        await AsyncStorage.clear()
                        
                        // Clear wordCache
                        const { clearAllData } = await import('@/database/wordCache')
                        await clearAllData()
                        
                        // Reset userStore to initial state
                        const { resetUserStore } = await import('@/stores/userStore')
                        resetUserStore()
                        
                        // Navigate to onboarding
                        router.replace('/(onboarding)')
                      } catch (error) {
                        console.error('Error deleting profile:', error)
                        Alert.alert('Error', 'Failed to delete profile. Please try again.')
                      }
                    }
                  }
                ]
              )
            }}
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

        {/* Color Picker Modal */}
        <ColorPickerModal
          visible={showColorPicker}
          onClose={() => setShowColorPicker(false)}
          onColorSelect={setTempAvatarColor}
          initialColor={tempAvatarColor}
        />
      </ScrollView>
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
})

export default Profile