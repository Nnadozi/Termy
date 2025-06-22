import CustomButton from '@/components/CustomButton'
import CustomText from '@/components/CustomText'
import Page from '@/components/Page'
import QuizQuestion from '@/components/QuizQuestion'
import { addWordsToList } from '@/database/wordCache'
import useUserStore from '@/stores/userStore'
import { QuizQuestion as QuizQuestionType } from '@/types/quiz'
import { showToast } from '@/utils/ShowToast'
import { useTheme } from '@react-navigation/native'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, ScrollView, View } from 'react-native'

const Quiz = () => {
  const {words} = useLocalSearchParams()
  const wordsArray = JSON.parse(words as string)
  const [questions, setQuestions] = useState<QuizQuestionType[]>([])
  const [loading, setLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const hasGenerated = useRef(false)
  const {colors} = useTheme()
  const { userName, updateQuizStats, dailyWordsCompletedToday } = useUserStore()

  const generateQuizQuestions = async (words: any[]) => {
    try {
      const prompt = `Generate quiz questions for vocabulary learning. For each word, create EXACTLY 3 questions (mix of multiple choice and fill-in-the-blank).

Words to create questions for:
${words.map(word => `- ${word.word} (${word.part_of_speech}): ${word.definition}. Example: "${word.example_usage}"`).join('\n')}

Requirements:
1. Create EXACTLY 3 questions per word (total: ${words.length * 3} questions)
2. Mix question types: multiple choice and fill-in-the-blank
3. Multiple choice should have 4 options (A, B, C, D) with one correct answer
4. Fill-in-the-blank should use the word in context
5. Make distractors plausible but clearly wrong
6. Use the provided definition and example usage
7. Questions should test understanding, not just memorization
8. The questions should be in random order. Mix it up!
9. DO NOT create part of speech questions

IMPORTANT: Return ONLY valid JSON in this exact format, no additional text:
{
  "questions": [
    {
      "word": "word_here",
      "question": "What does [word] mean?",
      "type": "multiple_choice",
      "correctAnswer": "correct_definition",
      "options": ["option_a", "option_b", "option_c", "option_d"]
    },
    {
      "word": "word_here", 
      "question": "Complete the sentence: The [blank] of the situation was clear to everyone.",
      "type": "fill_blank",
      "correctAnswer": "word_here",
      "context": "The [blank] of the situation was clear to everyone."
    },
    {
      "word": "word_here",
      "question": "Which sentence uses [word] correctly?",
      "type": "multiple_choice",
      "correctAnswer": "The correct sentence using the word",
      "options": ["correct_sentence", "wrong_sentence_1", "wrong_sentence_2", "wrong_sentence_3"]
    }
  ]
}`

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a vocabulary quiz generator. Generate engaging and educational quiz questions that test understanding of word meanings and usage. ALWAYS return valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      })

      const data = await response.json()
      const content = data.choices[0].message.content
      
      // Try to parse the content directly first
      let parsedQuestions
      try {
        parsedQuestions = JSON.parse(content)
      } catch (parseError) {
        // If direct parsing fails, try to extract JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          try {
            parsedQuestions = JSON.parse(jsonMatch[0])
          } catch (extractError) {
            console.error('Failed to parse extracted JSON:', extractError)
            throw new Error('Invalid JSON response from AI')
          }
        } else {
          throw new Error('No JSON found in AI response')
        }
      }
      
      if (parsedQuestions && parsedQuestions.questions) {
        setQuestions(parsedQuestions.questions)
      } else {
        throw new Error('Invalid question format from AI')
      }
    } catch (error) {
      console.error('Error generating questions:', error)
      // Fallback: create basic questions if AI fails
      const fallbackQuestions: QuizQuestionType[] = words.flatMap(word => [
        {
          word: word.word,
          question: `What does "${word.word}" mean?`,
          type: 'multiple_choice',
          correctAnswer: word.definition,
          options: [word.definition, 'Something else', 'Another option', 'Wrong answer']
        },
        {
          word: word.word,
          question: `Complete: ${word.example_usage.replace(word.word, '_____')}`,
          type: 'fill_blank',
          correctAnswer: word.word,
          context: word.example_usage
        }
      ])
      setQuestions(fallbackQuestions)
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

  const handleQuizCompletion = async () => {
    const percentage = Math.round((score / questions.length) * 100)
    const passed = percentage >= 80
    
    if (passed && !dailyWordsCompletedToday) {
      try {
        // Add daily words to Learned list
        await addWordsToList('Learned', wordsArray)
        
        // Update user stats
        updateQuizStats(percentage, wordsArray.length)
        
        showToast(`🎉 Congratulations ${userName}! All daily words have been learned!`, 'success')
        
        // Navigate back to Daily screen
        setTimeout(() => {
          router.replace('/(main)/Daily')
        }, 2000)
      } catch (error) {
        console.error('Error adding words to Learned list:', error)
        showToast('Error saving learned words', 'error')
      }
    } else if (passed && dailyWordsCompletedToday) {
      showToast('You\'ve already completed today\'s words!', 'info')
      setTimeout(() => {
        router.replace('/(main)/Daily')
      }, 2000)
    }
  }

  const retakeQuiz = () => {
    setCurrentQuestionIndex(0)
    setScore(0)
    setQuizCompleted(false)
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
    }
  }, [quizCompleted])

  if (loading) {
    return (
      <Page>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator style={{marginVertical:"3%"}} size="large" color={colors.primary} />
          <CustomText fontSize='large' bold>Creating questions...</CustomText>
          <CustomText fontSize='normal'>It's time to test your knowledge!</CustomText>
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
          <CustomText fontSize="XL" bold>Quiz Complete!</CustomText>
          <CustomText fontSize="large" style={{ marginVertical: 20 }}>
            Score: {score}/{questions.length} ({percentage}%)
          </CustomText>
          <CustomText fontSize="large" bold style={{ color: passed ? '#4CAF50' : '#F44336', marginBottom: 20 }}>
            {passed ? '🎉 You Passed!' : '❌ Try Again'}
          </CustomText>
          <CustomText fontSize="normal" style={{ textAlign: 'center', marginBottom: 30 }}>
            {passed 
              ? dailyWordsCompletedToday 
                ? 'You\'ve already completed today\'s words! Returning to Daily screen...'
                : 'Great job! You\'ve successfully learned these words. Returning to Daily screen...'
              : 'You need 80% to pass. Keep practicing!'
            }
          </CustomText>
          {!passed && (
            <View style={{ gap:10}}>
              <CustomButton
                title="Retake Quiz"
                onPress={retakeQuiz}
                style={{ width: '60%' }}
              />
              <CustomButton
                title="Keep practicing"
                onPress={() => router.replace('/(main)/Daily')}
                style={{ width: '60%' }}
              />
            </View>
          )}
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

