import ColorPickerModal from '@/components/ColorPickerModal'
import CustomInput from '@/components/CustomInput'
import CustomText from '@/components/CustomText'
import OnboardingPage from '@/components/OnboardingPage'
import useUserStore from '@/stores/userStore'
import { Avatar } from '@rneui/base'
import { router } from 'expo-router'
import leoProfanity from 'leo-profanity'
import { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

const ProfileSetup = () => {
  const [username, setUsername] = useState("")
  const [avatarColor, setAvatarColor] = useState("#FF6A00")
  const [showColorPicker, setShowColorPicker] = useState(false)
  const { setUserName, setAvatarColor: setAvatarColorStore, completeOnboarding } = useUserStore()

  const isValidUsername = (str: string) => {
    return str.length > 0 && 
         /^[a-zA-Z0-9]*$/.test(str) && 
         !leoProfanity.check(str);
  }

  const setUpProfile = async () => {
    setUserName(username)
    setAvatarColorStore(avatarColor)
    completeOnboarding()
    
    // Clear any cached words to ensure fresh words are fetched with new preferences
    try {
      const { clearCachedWords } = await import('@/database/wordCache')
      await clearCachedWords()
      console.log("Cleared cached words for fresh start")
    } catch (error) {
      console.error("Error clearing cache:", error)
    }
    
    console.log("Profile setup complete")
    router.navigate("/(onboarding)/Finish")
  }

  return (
    <OnboardingPage
      progress={0.75}
      title="Create a Profile"
      subTitle="Set your username and avatar"
      nextPage="/(onboarding)/Finish"
      style={styles.container}
      disableNext={!isValidUsername(username)}
      customOnPress={setUpProfile}
    >
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={() => setShowColorPicker(true)}>
          <Avatar 
            size={150} 
            rounded 
            title={username.charAt(0).toUpperCase() || "A"}
            containerStyle={{ alignSelf: "center", backgroundColor: avatarColor }} 
          />
        </TouchableOpacity>
        <CustomText style={styles.tapText}>Tap to change color</CustomText>
      </View>
      
      <CustomText textAlign='center' bold>What should we call you?</CustomText>
      <CustomInput
        placeholder="Enter your username (ex: Zixon77)"
        onChangeText={setUsername}
        value={username}
        maxLength={20}
        keyboardType="default"
      />
      <View style={styles.rulesContainer}>
        <CustomText>• No special characters</CustomText>
        <CustomText>• No emojis</CustomText>
        <CustomText>• No profanity</CustomText>
      </View>
      <ColorPickerModal
        visible={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        onColorSelect={setAvatarColor}
        initialColor={avatarColor}
      />
    </OnboardingPage>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginTop: "5%",
  },
  avatarContainer: {
    alignItems: "center",
    width: "100%",
    marginBottom: "5%",
  },
  tapText: {
    marginTop: "3%"
  },
  rulesContainer: {
    gap: 10,
    marginTop: "1%"
  }
})

export default ProfileSetup

