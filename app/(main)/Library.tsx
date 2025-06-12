  import CustomButton from '@/components/CustomButton'
import CustomText from '@/components/CustomText'
import Page from '@/components/Page'
import { router } from 'expo-router'
import React from 'react'
import { View } from 'react-native'

const Library = () => {
  return (
    <Page style={{justifyContent:"flex-start", alignItems:"flex-start"}}>
       <View style={{width:"100%", marginBottom:"3%"}}>
        <CustomText fontSize='XL' bold>Library</CustomText>
      </View>
      <CustomButton title="Onboarding" onPress={() => router.navigate("/(onboarding)/Intro")} />
    </Page>
  )
}

export default Library

/**
 * Learned Words - successfully completed vocabulary
 * Review Needed - failed quiz words requiring attention
 * Favorites/Starred List - user-saved words
 * Custom Lists (future premium feature, Ex: SAT, GRE, etc.)
 */