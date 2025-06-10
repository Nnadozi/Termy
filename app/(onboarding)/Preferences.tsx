import CustomInput from '@/components/CustomInput'
import CustomText from '@/components/CustomText'
import OnboardingPage from '@/components/OnboardingPage'
import { useThemeStore } from '@/stores/themeStore'
import useUserStore from '@/stores/userStore'
import { ButtonGroup } from '@rneui/base'
import React, { useState } from 'react'
import { StyleSheet, Switch, View } from 'react-native'

const Preferences = () => {
  const { 
    dailyWordGoal, 
    setDailyWordGoal, 
    notificationsEnabled, 
    setNotificationsEnabled 
  } = useUserStore()
  
  const [goalValue, setGoalValue] = useState((dailyWordGoal ?? 3).toString())
  const { mode, setThemeMode, colors } = useThemeStore();

  return (
    <OnboardingPage
      progress={0.5}
      title="Set Preferences"
      subTitle="Personalize your experience"
      nextPage="/(onboarding)/ProfileSetup"
      style={styles.container}
    >
      <View style = {{gap:'7.5%'}}>
        <View style={styles.row}> 
          <View>
            <CustomText bold>Daily Word Goal</CustomText>
            <CustomText fontSize="small">We recommend learning 3 words daily  </CustomText>
          </View>
          <CustomInput
           width={"25%"} 
           placeholder="3"
           value={goalValue} 
           onChangeText={(text) => {
             const filteredText = text.replace(/[^0-9]/g, '')
             setGoalValue(filteredText)
             const parsedValue = parseInt(filteredText)
             if (!isNaN(parsedValue) && parsedValue > 0) {
               setDailyWordGoal(parsedValue)
             }
           }} 
           keyboardType="number-pad"
           maxLength={1}
           />
        </View>
        <View style={styles.row}>
          <View>
            <CustomText bold>Theme</CustomText>
            <CustomText fontSize="small">Choose your preferred theme</CustomText>
          </View>
          <ButtonGroup
            buttons={["Light", "Dark"]}
            buttonStyle={{backgroundColor: colors.colors.card}}
            textStyle={{color: colors.colors.text, fontFamily: "DMSans-Regular"}}
            selectedButtonStyle={{backgroundColor: colors.colors.primary}}
            selectedTextStyle={{color: colors.colors.background}}
            selectedIndex={mode === "dark" ? 1 : 0}
            onPress={(index) => setThemeMode(index === 0 ? "light" : "dark")}
            containerStyle={{width: "40%", borderWidth: 1, borderColor: colors.colors.border, marginRight:"0%"}}
          />
        </View>
        <View style={styles.row}>
          <View>
            <CustomText bold>Enable Notifications</CustomText>
            <CustomText fontSize="small">Know when your words are ready</CustomText>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{false: "gray", true: colors.colors.primary}}
            thumbColor={"white"}
          />
        </View>
        <View style={styles.row}>
          <View>
            <CustomText bold>Take Vocabulary Placement Test</CustomText>
            <CustomText fontSize="small">Know what words you need to learn</CustomText>
          </View>
        </View>
      </View>
    </OnboardingPage>
  )
}

export default Preferences

const styles = StyleSheet.create({
  container: {
  justifyContent: "flex-start",
  alignItems: "flex-start",
  marginTop: "5%",
  },
  row:{
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
})