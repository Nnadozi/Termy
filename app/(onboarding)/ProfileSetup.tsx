import ColorPickerModal from '@/components/ColorPickerModal'
import CustomInput from '@/components/CustomInput'
import CustomText from '@/components/CustomText'
import LoadingSpinner from '@/components/LoadingSpinner'
import OnboardingPage from '@/components/OnboardingPage'
import useUserStore from '@/stores/userStore'
import { Avatar } from '@rneui/base'
import { router } from 'expo-router'
import leoProfanity from 'leo-profanity'
import { useState } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'

const ProfileSetup = () => {
  const [username, setUsername] = useState("")
  const [avatarColor, setAvatarColor] = useState("#FF6A00")
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { setUserName, setAvatarColor: setAvatarColorStore, completeOnboarding } = useUserStore()

  const isValidUsername = (str: string) => {
    return str.length > 0 && 
         /^[a-zA-Z0-9]*$/.test(str) && 
         !leoProfanity.check(str);
  }

  const setUpProfile = async () => {
    setIsLoading(true)
    try {
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
    } catch (error) {
      console.error("Error setting up profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <OnboardingPage
      progress={0.8}
      title="Create a Profile"
      subTitle="Set your username and avatar"
      nextPage="/(onboarding)/Finish"
      style={styles.container}
      disableNext={!isValidUsername(username) || isLoading}
      customOnPress={setUpProfile}
    >
      <ScrollView 
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading && (
          <LoadingSpinner 
            text="Setting up your profile..."
            variant="inline"
          />
        )}
        
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={() => setShowColorPicker(true)} disabled={isLoading}>
            <Avatar 
              size={150} 
              rounded 
              title={username.charAt(0).toUpperCase() || "A"}
              containerStyle={{ alignSelf: "center", backgroundColor: avatarColor }} 
            />
          </TouchableOpacity>
          <CustomText textAlign='center' style={{marginTop:10}}>Tap above to change your avatar color</CustomText>
          <CustomText textAlign='center' fontSize='small'>Choose wisely!</CustomText>
        </View>
        
        <CustomInput
          placeholder="Enter your username (ex: Zixon77)"
          onChangeText={setUsername}
          value={username}
          maxLength={20}
          keyboardType="default"
          editable={!isLoading}
        />
        <View style={styles.rulesContainer}>
          <CustomText>• No special characters</CustomText>
          <CustomText>• No emojis</CustomText>
          <CustomText>• No profanity</CustomText>
        </View>
      </ScrollView>
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
    marginBottom: 10,
  },
  rulesContainer: {
    gap: 10,
    marginTop: 10
  }
})

export default ProfileSetup

