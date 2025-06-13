import CustomButton from '@/components/CustomButton'
import CustomText from '@/components/CustomText'
import DailyWordCard from '@/components/DailyWordCard'
import Page from '@/components/Page'
import { cacheDailyWords, getCachedDailyWords, hasCachedWordsForToday } from '@/database/wordCache'
import { getDailyWords } from '@/database/wordService'
import useUserStore from '@/stores/userStore'
import { Word } from '@/types/word'
import { useTheme } from '@react-navigation/native'
import { router } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import PagerView from 'react-native-pager-view'

const Daily = () => {
  const { userName, wordTopics,dailyWordGoal } = useUserStore()
  const [dailyVocab, setDailyVocab] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const {colors} = useTheme()
  const pagerRef = useRef<PagerView>(null)
  
  useEffect(() => {
    const loadWords = async () => {
      try {
        setLoading(true) 
        const hasCachedWords = await hasCachedWordsForToday()
        if (hasCachedWords) {
          const cachedWords = await getCachedDailyWords()
          setDailyVocab(cachedWords)
        } else {
          const words = await getDailyWords(wordTopics, dailyWordGoal)
          console.log(words)
          setDailyVocab(words)
          await cacheDailyWords(words)
        }
      } catch (error) {
        console.error('Error loading words:', error) 
      } finally {
        setLoading(false)
      }
    }
    if (wordTopics && wordTopics.length > 0) {
      loadWords()
    }
  }, [wordTopics, dailyWordGoal])

  return (
    <Page style={{ justifyContent: "flex-start", alignItems: "flex-start" }}>
      <View style={{ width: "100%", marginBottom: "3%" }}>
        <CustomText textAlign='center' fontSize='XL' bold>Hi, {userName}</CustomText>
        <CustomText textAlign='center' primary bold>Here's your daily vocabulary</CustomText>
      </View>
        {loading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center",width:"100%" }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <CustomText textAlign='center'>Loading your words...</CustomText>
          </View>
        ) : dailyVocab.length > 0 ? (
          <PagerView ref={pagerRef} initialPage={0} orientation='vertical' style={{ flex: 1, width:"100%" }}>
            {dailyVocab.map((word, index) => (
                <DailyWordCard index={index} total={dailyVocab.length} key={index} word={word} scrollToNext={() => {
                  pagerRef.current?.setPage(index + 1)
                }} />
            ))}
            <View style={{ flex: 1, width:"100%", justifyContent:"center", alignItems:"center" }}>
              <CustomText fontSize='large' bold>Time for a Quiz</CustomText>
              <CustomText>You've learned all your words for today!</CustomText>
              <CustomButton marginVertical={"5%"} width={"80%"} title='Start Quiz' 
              onPress={() => router.push({pathname:"/Quiz", params:{words:JSON.stringify(dailyVocab)}})} 
              />
              <CustomText fontSize='small' bold primary onPress={() => pagerRef.current?.setPage(0)}>Keep practicing</CustomText>
            </View>
          </PagerView>
        
        ) : (
          <CustomText>No words found for your selected topics: {wordTopics.join(', ')}</CustomText>
        )}
    </Page>
  )
}

export default Daily

const styles = StyleSheet.create({})

//butons: share, like, pronounce