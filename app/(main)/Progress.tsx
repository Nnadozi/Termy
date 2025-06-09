import CustomText from '@/components/CustomText'
import Page from '@/components/Page'
import React from 'react'
import { View } from 'react-native'

const Progress = () => {
  return (
    <Page style={{justifyContent:"flex-start", alignItems:"flex-start"}}>
      <View style={{width:"100%", marginBottom:"3%"}}>
        <CustomText fontSize='XL' bold>Progress</CustomText>
      </View>
      <CustomText>Words learned, quizzes taken, streaks, etc.</CustomText>
      <CustomText>Badges, Achievements, user rank/level.</CustomText>
    </Page>
  )
}

export default Progress

