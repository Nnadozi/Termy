import ColorPickerModal from '@/components/ColorPickerModal'
import CustomInput from '@/components/CustomInput'
import CustomText from '@/components/CustomText'
import OnboardingPage from '@/components/OnboardingPage'
import { Avatar } from '@rneui/base'
import leoProfanity from 'leo-profanity'
import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

const ProfileSetup = () => {
  const [username, setUsername] = useState("")
  const [avatarColor, setAvatarColor] = useState("#FF0000")
  const [firstLetter, setFirstLetter] = useState("A")
  const [showColorPicker, setShowColorPicker] = useState(false)

  const handleColorSelect = (color: string) => {
    setAvatarColor(color)
  }

  const isValidUsername = (str: string) => {
    const allowedCharsRegex = /^[a-zA-Z0-9 ]*$/; 
    const hasOnlyAllowedChars = allowedCharsRegex.test(str);
    const hasNoEmoji = !/\p{Emoji}/u.test(str); 
    const hasNoProfanity = !leoProfanity.check(str);
    return str.length > 0 && hasOnlyAllowedChars && hasNoEmoji && hasNoProfanity;
  };


  return (
    <OnboardingPage
      progress={0.75}
      title="Create a Profile"
      subTitle="Set your username and avatar"
      nextPage="/(onboarding)/Finish"
      style={styles.mainCon}
      disableNext={!isValidUsername(username)}
    >
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={() => setShowColorPicker(true)}>
          <Avatar 
            size={150} 
            rounded 
            title={firstLetter}
            containerStyle={{alignSelf:"center", backgroundColor: avatarColor}} 
          />
        </TouchableOpacity>
        <CustomText style={{marginTop:"3%"}}>Tap to change color</CustomText>
      </View>
      
      <CustomText textAlign='center' bold>What should we call you?</CustomText>
      <CustomInput
        placeholder="Enter your username"
        onChangeText={(text) => {
          setUsername(text)
          setFirstLetter(text.charAt(0).toUpperCase())
        }}
        value={username}
        maxLength={15}
      />
      <View style = {{gap:10, marginTop:"1%"}}>
        <CustomText> • No special characters </CustomText>
        <CustomText> • No emojus </CustomText>
        <CustomText> • No profanity </CustomText>
      </View>
      
      <ColorPickerModal
        visible={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        onColorSelect={handleColorSelect}
        initialColor={avatarColor}
      />
    </OnboardingPage>
  )
}

export default ProfileSetup

const styles = StyleSheet.create({
  mainCon: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginTop: "10%",
  },
  avatarContainer: {
    alignItems: "center",
    width: "100%",
    marginBottom: "5%",
  },

})
