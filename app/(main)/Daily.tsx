import CustomButton from '@/components/CustomButton'
import CustomText from '@/components/CustomText'
import DailyWordCard from '@/components/DailyWordCard'
import ErrorDisplay from '@/components/ErrorDisplay'
import LoadingSpinner from '@/components/LoadingSpinner'
import Page from '@/components/Page'
import { cacheDailyWords, clearCachedWords, getCachedDailyWords, hasCachedWordsForToday } from '@/database/wordCache'
import { getDailyWords } from '@/database/wordService'
import useUserStore from '@/stores/userStore'
import { Word } from '@/types/word'
import { withInternetCheck } from '@/utils/networkUtils'
import { useTheme } from '@react-navigation/native'
import { router } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import PagerView from 'react-native-pager-view'


const Daily = () => {
  const { userName, wordTopics, dailyWordGoal, dailyWordsCompletedToday, currentStreak, totalWordsLearned, dailyWordNotificationTime } = useUserStore()
  const [dailyVocab, setDailyVocab] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeUntilNextDay, setTimeUntilNextDay] = useState('')
  const {colors} = useTheme()
  const pagerRef = useRef<PagerView>(null)
  const lastPreferences = useRef<{topics: string[], goal: number}>({topics: [], goal: 0})
  
  // Calculate time until next day
  useEffect(() => {

    const updateTimer = () => {
      const now = new Date();
      const [hour, minute] = dailyWordNotificationTime.split(':').map(Number);

      // Next notification time
      let nextNotification = new Date(now);
      nextNotification.setHours(hour, minute, 0, 0);

      // If the time has already passed today, set for tomorrow
      if (nextNotification <= now) {
        nextNotification.setDate(nextNotification.getDate() + 1);
      }

      const diff = nextNotification.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeUntilNextDay(
        `${hours.toString().padStart(2, '0')}:` +
        `${minutes.toString().padStart(2, '0')}:` +
        `${seconds.toString().padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [dailyWordNotificationTime]);
  
  useEffect(() => {
    const loadWords = async () => {
      try {
        setLoading(true) 
        setError(null)
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
          // Check internet connectivity before fetching from Supabase
          await withInternetCheck(async () => {
            const words = await getDailyWords(wordTopics, dailyWordGoal)
            console.log('Daily: Fetched new words:', words.length, 'words')
            console.log('Daily: Word categories:', words.map(w => w.category))
            setDailyVocab(words)
            await cacheDailyWords(words)
          });
        }
      } catch (error) {
        console.error('Error loading words:', error) 
        setError(error instanceof Error ? error.message : 'Failed to load daily words')
      } finally {
        setLoading(false)
      }
    }
    
    if (wordTopics && wordTopics.length > 0 && dailyWordGoal > 0) {
      loadWords()
    } else {
      console.log('Daily: No word topics selected or invalid goal')
      setError('Please set your learning preferences in Settings')
      setLoading(false)
    }
  }, [wordTopics, dailyWordGoal])

  const refreshWords = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Daily: Manually refreshing words')
      await clearCachedWords()
      // Check internet connectivity before fetching from Supabase
      await withInternetCheck(async () => {
        const words = await getDailyWords(wordTopics, dailyWordGoal)
        console.log('Daily: Refreshed words:', words.length, 'words')
        console.log('Daily: Word categories:', words.map(w => w.category))
        setDailyVocab(words)
        await cacheDailyWords(words)
        lastPreferences.current = { topics: [...wordTopics], goal: dailyWordGoal }
      });
    } catch (error) {
      console.error('Error refreshing words:', error)
      setError(error instanceof Error ? error.message : 'Failed to refresh words')
    } finally {
      setLoading(false)
    }
  }

  const retryLoadWords = () => {
    // Reset and retry loading
    setDailyVocab([])
    setError(null)
    setLoading(true)
    // This will trigger the useEffect to reload
  }

  if (loading) {
    return (
      <Page>
        <LoadingSpinner text="Loading daily words..." />
      </Page>
    )
  }

  return (
    <Page style={{ justifyContent: "flex-start", alignItems: "flex-start" }}>
      <View style={{ width: "100%", marginBottom: "3%" }}>
        <CustomText textAlign='center' fontSize='XL' bold>Hi, {userName}</CustomText>
        <CustomText textAlign='center' primary >Here's your daily vocabulary</CustomText>
        {currentStreak > 0 && (
          <CustomText textAlign='center' fontSize='small' style={{ marginTop: "1%" }}>
            🔥 {currentStreak} day streak 
          </CustomText>
        )}
      </View>
      
      {error ? (
        <ErrorDisplay
          title="Failed to Load Words"
          message={error}
          onRetry={retryLoadWords}
        />
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
            <CustomButton marginVertical={10} width={"80%"} title='Start Quiz' 
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


