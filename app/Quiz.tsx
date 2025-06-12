import CustomText from '@/components/CustomText'
import Page from '@/components/Page'
import { useLocalSearchParams } from 'expo-router'
import React from 'react'

const Quiz = () => {
  const {words} = useLocalSearchParams()
  const wordsArray = JSON.parse(words as string)
  return (
    <Page>
      <CustomText>Quiz</CustomText>
      <CustomText>Words:</CustomText>
      {wordsArray.map((word:any) => (
        <CustomText key={word.id}>{word.word}</CustomText>
      ))}
    </Page>
  )
}

export default Quiz