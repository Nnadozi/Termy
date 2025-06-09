import CustomText from '@/components/CustomText'
import OnboardingPage from '@/components/OnboardingPage'
import React from 'react'
import { StyleSheet } from 'react-native'

const Preferences = () => {
  return (
    <OnboardingPage
      progress={0.5}
      title="Set Preferences"
      subTitle="Personalize your experience"
      nextPage="/(onboarding)/ProfileSetup"
      style={styles.container}
    >
      <CustomText bold>Daily Word Goal:</CustomText>
      <CustomText bold>Enable Notifications</CustomText>
      <CustomText bold>Take Vocabulary Placement Test (CEFR levels?)</CustomText>
      <CustomText bold>Theme</CustomText>
    </OnboardingPage>
  )
}

export default Preferences

const styles = StyleSheet.create({
  container: {
  justifyContent: "flex-start",
  alignItems: "flex-start",
  marginTop: "5%",
  }
})

