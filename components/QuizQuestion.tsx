import { QuizQuestion as QuizQuestionType } from '@/types/quiz'
import { useTheme } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native'
import CustomButton from './CustomButton'
import CustomInput from './CustomInput'
import CustomText from './CustomText'

interface QuizQuestionProps {
  question: QuizQuestionType
  questionNumber: number
  totalQuestions: number
  onAnswer: (isCorrect: boolean) => void
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer
}) => {
  const { colors } = useTheme()
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [typedAnswer, setTypedAnswer] = useState('')
  const [hasAnswered, setHasAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  console.log('QuizQuestion render:', { hasAnswered, typedAnswer, questionNumber })

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer(null)
    setTypedAnswer('')
    setHasAnswered(false)
    setIsCorrect(false)
    console.log('State reset for new question')
  }, [questionNumber])

  const handleAnswerSelect = (answer: string) => {
    if (hasAnswered) return // Prevent multiple answers
    
    setSelectedAnswer(answer)
    const correct = answer === question.correctAnswer
    setIsCorrect(correct)
    setHasAnswered(true)
    
    // Don't auto-advance - let user click continue button
  }

  const handleTypedAnswer = () => {
    console.log('handleTypedAnswer called:', { hasAnswered, typedAnswer })
    if (hasAnswered || !typedAnswer.trim()) return // Prevent empty answers
    
    const correct = typedAnswer.trim().toLowerCase() === question.correctAnswer.toLowerCase()
    setIsCorrect(correct)
    setHasAnswered(true)
    
    // Don't auto-advance - let user click continue button
  }

  const handleContinue = () => {
    onAnswer(isCorrect)
  }

  const getOptionStyle = (option: string): ViewStyle => {
    if (!hasAnswered) {
      return {
        backgroundColor: selectedAnswer === option ? colors.primary : colors.card,
        borderColor: selectedAnswer === option ? colors.primary : colors.border,
      }
    }
    
    if (option === question.correctAnswer) {
      return {
        backgroundColor: '#4CAF50', // Green for correct
        borderColor: '#4CAF50',
      }
    }
    
    if (selectedAnswer === option && option !== question.correctAnswer) {
      return {
        backgroundColor: '#F44336', // Red for incorrect
        borderColor: '#F44336',
      }
    }
    
    return {
      backgroundColor: colors.card,
      borderColor: colors.border,
    }
  }

  const getOptionTextColor = (option: string) => {
    if (!hasAnswered) {
      return selectedAnswer === option ? colors.background : colors.text
    }
    
    if (option === question.correctAnswer || (selectedAnswer === option && option !== question.correctAnswer)) {
      return 'white'
    }
    
    return colors.text
  }

  return (
    <View style={{borderWidth:0,padding:"5%"}}>
      {/* Progress indicator */}
      <View style={{borderWidth:0}}>
        <CustomText primary fontSize="small">
          Question <CustomText fontSize="small" primary bold>{questionNumber}</CustomText> of <CustomText fontSize="small" primary bold>{totalQuestions}</CustomText>
        </CustomText>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View 
            style={[
              {height: '100%',borderRadius: 10}, 
              { 
                backgroundColor: colors.primary,
                width: `${(questionNumber / totalQuestions) * 100}%`
              }
            ]} 
          />
        </View>
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        {question.type !== 'fill_blank' && (
          <CustomText fontSize="large" bold>
            {question.question}
          </CustomText>
        )}
        {question.type === 'fill_blank' && question.context && (
          <CustomText fontSize="large" bold >
            {hasAnswered ? question.context : question.context.replace(question.correctAnswer, '_____')}
          </CustomText>
        )}
      </View>

      {/* Answer options */}
      <View style={styles.optionsContainer}>
        {question.type === 'multiple_choice' && question.options ? (
          question.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                getOptionStyle(option)
              ]}
              onPress={() => handleAnswerSelect(option)}
              disabled={hasAnswered}
            >
              <CustomText 
                fontSize="normal" 
                textAlign="center"
                style={{
                  color: getOptionTextColor(option)
                }}
              >
                {option}
              </CustomText>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.fillBlankContainer}>
            <CustomText fontSize="normal"  textAlign="center" style={{marginBottom:"3%"}}>
              Fill in the blank:
            </CustomText>
            <CustomInput
              placeholder="Enter your answer..."
              value={typedAnswer}
              onChangeText={(text) => {
                console.log('Typing:', text)
                setTypedAnswer(text)
              }}
              style={{textAlign:"center",marginBottom:"4%"}}
              onSubmitEditing={handleTypedAnswer}
              returnKeyType="done"
              editable={!hasAnswered}
            />
            {!hasAnswered && (
              <CustomButton
                title="Submit Answer"
                onPress={handleTypedAnswer}
                disabled={hasAnswered || !typedAnswer.trim()}
                style={styles.submitButton}
              />
            )}
          </View>
        )}
      </View>

      {/* Feedback */}
      {hasAnswered && (
        <View style={{alignItems:"center"}}>
          <CustomText
            fontSize="large" 
            bold 
            style={{ color: isCorrect ? '#4CAF50' : '#F44336'}}
          >
            {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
          </CustomText>
          {!isCorrect && typedAnswer && (
            <CustomText fontSize="normal" textAlign="center" >
              Correct answer: {question.correctAnswer}
            </CustomText>
          )}
        </View>
      )}

      {/* Continue button */}
      {hasAnswered && (
        <CustomButton
          title="Continue"
          onPress={handleContinue}
          style={styles.continueButton}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  progressBar: {
    height: 7.5,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: "2.5%",
  },
  questionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    //borderWidth:1,
    marginVertical:"10%",
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    marginVertical: "2%",
    padding: "5%",
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  fillBlankContainer: {
    alignItems: 'center',
  },  
  submitButton: {
    width: '60%',
  },
  correctAnswerText: {
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 5,
  },
  continueButton: {
    width: '100%',
    marginTop: 20,
  },
})

export default QuizQuestion 