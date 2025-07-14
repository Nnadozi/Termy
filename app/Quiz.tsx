import CustomButton from '@/components/CustomButton'
import CustomIcon from '@/components/CustomIcon'
import CustomText from '@/components/CustomText'
import Page from '@/components/Page'
import QuizQuestion from '@/components/QuizQuestion'
import { addWordsToList } from '@/database/wordCache'
import { useThemeStore } from '@/stores/themeStore'
import useUserStore from '@/stores/userStore'
import { QuizQuestion as QuizQuestionType } from '@/types/quiz'
import { withInternetCheck } from '@/utils/networkUtils'
import notificationService from '@/utils/notificationService'
import { showToast } from '@/utils/ShowToast'
import Constants from 'expo-constants'
import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Animated, Image, Platform, ScrollView, View } from 'react-native'
import ConfettiCannon from 'react-native-confetti-cannon'

const Quiz = () => {
  const {words} = useLocalSearchParams()
  const wordsArray = JSON.parse(words as string)
  const [questions, setQuestions] = useState<QuizQuestionType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const hasGenerated = useRef(false)
  const { isDark } = useThemeStore()
  const { updateQuizStats, dailyWordsCompletedToday } = useUserStore()
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  const generateQuizQuestions = async (words: any[]) => {
    try {
      setError(null)
      setLoading(true)
      
      // Check internet connectivity before making API call
      await withInternetCheck(async () => {
        // Get environment variables with fallbacks
        const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
        
        // Call the Supabase edge function instead of OpenAI directly
        const response = await fetch(`${supabaseUrl}/functions/v1/generate-quiz`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`
          },
          body: JSON.stringify({ words })
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Edge function error:', errorText)
          throw new Error(`Quiz generation failed: ${response.status}`)
        }

        const data = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }
        
        if (data.questions && Array.isArray(data.questions)) {
          setQuestions(data.questions)
        } else {
          throw new Error('Invalid response format from quiz service')
        }
      });
    } catch (error) {
      console.error('Error generating questions:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate quiz questions')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(score + 1)
    }
    
    // Move to next question or complete quiz
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      setQuizCompleted(true)
    }
  }

  const handleQuizCompletion = useCallback(async () => {
    const percentage = Math.round((score / questions.length) * 100)
    const passed = percentage >= 80
    
    if (passed && !dailyWordsCompletedToday) {
      try {
        // Add daily words to Learned list
        await addWordsToList('Learned', wordsArray)
        
        // Update user stats
        updateQuizStats(percentage, wordsArray.length)
        
        // Notify the notification service that daily words are completed
        await notificationService.onDailyWordsCompleted()
        
        showToast(`🎉 All daily words have been learned!`)
      } catch (error) {
        console.error('Error adding words to Learned list:', error)
        showToast('Error saving learned words', 'error')
      }
    } else if (passed && dailyWordsCompletedToday) {
      showToast('Daily words already completed', 'info')
    }
  }, [score, questions.length, dailyWordsCompletedToday, wordsArray, updateQuizStats])

  const retryQuizGeneration = () => {
    hasGenerated.current = false
    generateQuizQuestions(wordsArray)
  }

  useEffect(() => {
    if (wordsArray && wordsArray.length > 0 && !hasGenerated.current) {
      hasGenerated.current = true
      generateQuizQuestions(wordsArray)
    }
  }, [wordsArray])

  useEffect(() => {
    if (quizCompleted) {
      handleQuizCompletion()
      
      // Trigger the fade-in animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [quizCompleted, fadeAnim, scaleAnim, slideAnim, handleQuizCompletion])

  if (loading) {
    return (
      <Page>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {Platform.OS === 'ios' ? (
            <ActivityIndicator 
              size="large" 
              color={isDark ? '#FF6A00' : '#FF6A00'} 
              style={{ marginBottom: 20 }}
            />
          ) : (
            <Image 
              source={isDark 
                ? require('@/assets/images/spinner-dark.gif')
                : require('@/assets/images/spinner-light.gif')
              }
              style={{ width: 150, height: 150 }}
              resizeMode="contain"
            />
          )}
          <CustomText fontSize='large' bold>Creating questions...</CustomText>
          <CustomText fontSize='normal' style={{opacity: 0.7 }}>
            It&apos;s time to test your knowledge!
          </CustomText>
        </View>
      </Page>
    )
  }

  if (error) {
    return (
      <Page>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <CustomIcon 
            name="alert-circle" 
            type="feather" 
            size={60} 
            color="#FF4444" 
            style={{ marginBottom: 20 }}
          />
          <CustomText fontSize="large" bold textAlign="center" style={{ marginBottom: 10 }}>
            Quiz Generation Failed
          </CustomText>
          <CustomText 
            fontSize="normal" 
            textAlign="center" 
            style={{ marginBottom: 20, opacity: 0.8, lineHeight: 22 }}
          >
            {error}
          </CustomText>
          <CustomButton
            title="Go Back"
            onPress={() => router.replace('/(main)/Daily')}
            style={{ marginBottom: 10 }}
          />
          <CustomButton
            title="Try Again"
            onPress={retryQuizGeneration}
          />
        </View>
      </Page>
    )
  }

  if (quizCompleted) {
    const percentage = Math.round((score / questions.length) * 100)
    const passed = percentage >= 80
    
    return (
      <Page>
        <ScrollView 
          style={{ flex: 1, width: '100%' }}
          contentContainerStyle={{ paddingBottom: 20, justifyContent: 'center', alignItems: 'center', flex: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {passed && (
            <ConfettiCannon
              count={150}
              origin={{x: 0, y: 0}}
              fadeOut={true}
              fallSpeed={3000}
            />
          )}
          
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ],
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <CustomIcon type='entypo' name={passed ? 'emoji-happy' : 'emoji-sad'} size={100} style={{marginBottom:"2%"}} />
            <CustomText fontSize="XL" bold>Quiz Complete</CustomText>
            <CustomText color={passed ? '#4CAF50' : '#F44336'} style={{marginVertical:"1%"}}>
              Score: {score}/{questions.length} <CustomText color={passed ? '#4CAF50' : '#F44336'} bold>({percentage}%)</CustomText> 
            </CustomText>
            <CustomText fontSize="normal"  textAlign="center" style={{ marginBottom:"3%" }}>
              {passed 
                ? 'Great job! You&apos;ve successfully learned these words.'
                : 'You need 80% to pass. Keep practicing!'
              }
            </CustomText>
            {passed ? (
              <CustomButton
                title="Sweet!"
                onPress={() => router.replace('/(main)/Daily')}
              />
            ) : (
                <CustomButton
                  title="Keep practicing"
                  onPress={() => router.replace('/(main)/Daily')}
                />
            )}
          </Animated.View>
        </ScrollView>
      </Page>
    )
  }

  return (
    <Page>
      {questions.length > 0 && (
        <QuizQuestion
          question={questions[currentQuestionIndex]}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          onAnswer={handleAnswer}
        />
      )}
    </Page>
  )
}

export default Quiz

