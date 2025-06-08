import { Word } from '@/types/word'
import React from 'react'
import CustomText from './CustomText'
import Page from './Page'

interface SwipeCardProps {
    word: Word
}

const SwipeCard = ({word}:SwipeCardProps) => {
  return (
    <Page>
      <CustomText>{word.word}</CustomText>
      <CustomText>{word.definition}</CustomText>
      <CustomText>{word.example}</CustomText>
      <CustomText>{word.partOfSpeech}</CustomText>
    </Page>
  )
}

export default SwipeCard