import CustomButton from '@/components/CustomButton'
import CustomText from '@/components/CustomText'
import Page from '@/components/Page'
import useUserStore from '@/stores/userStore'
import { router } from 'expo-router'
import React from 'react'
import { StyleSheet, View } from 'react-native'

const Daily = () => {
  const {userName} = useUserStore()
  return (
    <Page style={{justifyContent:"flex-start", alignItems:"flex-start"}}>
      <View style={{width:"100%", marginBottom:"3%"}}>
        <CustomText fontSize='XL' bold>Hi, {userName}</CustomText>
        <CustomText primary bold>Here's your daily vocabulary</CustomText>
      </View>
      <CustomText>Test</CustomText>
      <CustomButton title="Onboarding" onPress={() => router.navigate("/(onboarding)/Intro")} />
    </Page>
  )
}

export default Daily

const styles = StyleSheet.create({})
