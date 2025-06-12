
import { Word } from '@/types/word'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import CustomText from './CustomText'

interface SwipeCardProps {
    word: Word
}

const SwipeCard = ({word}:SwipeCardProps) => { 
  return (
    <View style={styles.card}>
      <CustomText>{word.word}</CustomText>
      <CustomText>{word.definition}</CustomText>
      <CustomText>{word.example_usage}</CustomText>
      <CustomText>{word.part_of_speech}</CustomText>
      <CustomText>{word.category}</CustomText>
    </View>
  )
}

export default SwipeCard

const styles = StyleSheet.create({
  card: {
    flex:1,
    backgroundColor:"white",
    borderRadius:10,
    padding:10,
    margin:10,
    justifyContent:"center",
    alignItems:"center"
  }
})