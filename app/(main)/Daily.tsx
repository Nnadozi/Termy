import CustomButton from '@/components/CustomButton'
import CustomText from '@/components/CustomText'
import DailyWordCard from '@/components/DailyWordCard'
import Page from '@/components/Page'
import { cacheDailyWords, clearCachedWords, getCachedDailyWords, hasCachedWordsForToday } from '@/database/wordCache'
import { getDailyWords } from '@/database/wordService'
import useUserStore from '@/stores/userStore'
import { Word } from '@/types/word'
import { useTheme } from '@react-navigation/native'
import { router } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import PagerView from 'react-native-pager-view'

const Daily = () => {
  const { userName, wordTopics, dailyWordGoal, dailyWordsCompletedToday, currentStreak, totalWordsLearned } = useUserStore()
  const [dailyVocab, setDailyVocab] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [timeUntilNextDay, setTimeUntilNextDay] = useState('')
  const {colors} = useTheme()
  const pagerRef = useRef<PagerView>(null)
  const lastPreferences = useRef<{topics: string[], goal: number}>({topics: [], goal: 0})
  
  // Calculate time until next day
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0) // Start of next day
      
      const diff = tomorrow.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      setTimeUntilNextDay(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
    }
    
    updateTimer() // Initial call
    const interval = setInterval(updateTimer, 1000) // Update every second
    
    return () => clearInterval(interval)
  }, [])
  
  useEffect(() => {
    const loadWords = async () => {
      try {
        setLoading(true) 
        console.log('Daily: Loading words with preferences:', { wordTopics, dailyWordGoal })
        
        // Check if preferences have changed since last load
        const preferencesChanged = 
          lastPreferences.current.topics.length > 0 && // Only check if we have previous preferences
          (JSON.stringify(lastPreferences.current.topics) !== JSON.stringify(wordTopics) ||
          lastPreferences.current.goal !== dailyWordGoal)
        
        // If preferences changed, clear cache to force fresh fetch
        if (preferencesChanged) {
          console.log('Daily: Preferences changed, clearing cache')
          await clearCachedWords()
        }
        
        // Update last preferences
        lastPreferences.current = { topics: [...wordTopics], goal: dailyWordGoal }
        
        const hasCachedWords = await hasCachedWordsForToday()
        console.log('Daily: Has cached words for today:', hasCachedWords)
        
        if (hasCachedWords) {
          const cachedWords = await getCachedDailyWords()
          console.log('Daily: Using cached words:', cachedWords.length)
          setDailyVocab(cachedWords)
        } else {
          console.log('Daily: No cached words, fetching new ones')
          const words = await getDailyWords(wordTopics, dailyWordGoal)
          console.log('Daily: Fetched new words:', words.length, 'words')
          console.log('Daily: Word categories:', words.map(w => w.category))
          setDailyVocab(words)
          await cacheDailyWords(words)
        }
      } catch (error) {
        console.error('Error loading words:', error) 
      } finally {
        setLoading(false)
      }
    }
    
    if (wordTopics && wordTopics.length > 0 && dailyWordGoal > 0) {
      loadWords()
    } else {
      console.log('Daily: No word topics selected or invalid goal')
      setLoading(false)
    }
  }, [wordTopics, dailyWordGoal])

  const refreshWords = async () => {
    try {
      setLoading(true)
      console.log('Daily: Manually refreshing words')
      await clearCachedWords()
      const words = await getDailyWords(wordTopics, dailyWordGoal)
      console.log('Daily: Refreshed words:', words.length, 'words')
      console.log('Daily: Word categories:', words.map(w => w.category))
      setDailyVocab(words)
      await cacheDailyWords(words)
      lastPreferences.current = { topics: [...wordTopics], goal: dailyWordGoal }
    } catch (error) {
      console.error('Error refreshing words:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Page style={{ justifyContent: "flex-start", alignItems: "flex-start" }}>
      <View style={{ width: "100%", marginBottom: "3%" }}>
        <CustomText textAlign='center' fontSize='XL' bold>Hi, {userName}</CustomText>
        <CustomText textAlign='center' primary bold>Here's your daily vocabulary</CustomText>
        {currentStreak > 0 && (
          <CustomText textAlign='center' fontSize='small' style={{ marginTop: "1%" }}>
            🔥 {currentStreak} day streak 
          </CustomText>
        )}
      </View>
        {loading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center",width:"100%" }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <CustomText style={{marginVertical:"2%"}} textAlign='center'>Loading your words...</CustomText>
          </View>
        ) : dailyWordsCompletedToday ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", width: "100%" }}>
            <CustomText fontSize="large" bold textAlign='center'>
              Daily Words Completed!
            </CustomText>
            <CustomText style={{marginTop:"2%",marginBottom:"3%"}} textAlign='center' fontSize='normal'>
              You've successfully learned all your daily words.
              New words available in:
            </CustomText>
            <View style={{borderColor:colors.primary,backgroundColor:colors.background,padding:"5%",borderRadius:10,borderWidth:3}}>
              <CustomText fontSize="XL" bold primary>
                {timeUntilNextDay}
              </CustomText>
            </View>
            <CustomText bold primary style={{marginTop:"5%"}} onPress={() => router.push('/(list)/Learned')}>View Learned Words →  </CustomText>
          </View>
        ) : dailyVocab.length > 0 ? (
          <PagerView ref={pagerRef} initialPage={0} orientation='vertical' style={{ flex: 1, width:"100%" }}>
            {dailyVocab.map((word, index) => (
                <DailyWordCard index={index} total={dailyVocab.length} key={index} word={word} scrollToNext={() => {
                  pagerRef.current?.setPage(index + 1)
                }} />
            ))}
            <View style={{ flex: 1, width:"100%", justifyContent:"center", alignItems: "center" }}>
              <CustomText fontSize='large' bold>Time for a Quiz!</CustomText>
              <CustomText>You've learned all your words for today!</CustomText>
              <CustomButton marginVertical={"3%"} width={"80%"} title='Start Quiz' 
              onPress={() => router.push({pathname:"/Quiz", params:{words:JSON.stringify(dailyVocab)}})} 
              />
              <CustomButton width={"80%"} title='Keep practicing' onPress={() => pagerRef.current?.setPage(0)} />
            </View>
          </PagerView>
        
        ) : (
          <CustomText>No words found for your selected topics: {wordTopics.join(', ')}</CustomText>
        )}
    </Page>
  )
}

export default Daily


