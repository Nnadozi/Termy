import { QuizQuestion as QuizQuestionType } from '@/types/quiz'
import { useTheme } from '@react-navigation/native'
import { CheckBox } from '@rneui/base'
import React, { useEffect, useState } from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <CustomText fontSize="small" style={styles.progressText}>
          Question {questionNumber} of {totalQuestions}
        </CustomText>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View 
            style={[
              styles.progressFill, 
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
        <CustomText fontSize="large" bold style={styles.questionText}>
          {question.question}
        </CustomText>
        
        {question.type === 'fill_blank' && question.context && (
          <CustomText fontSize="normal" style={styles.contextText}>
            {hasAnswered ? question.context : question.context.replace(question.correctAnswer, '_____')}
          </CustomText>
        )}
      </View>

      {/* Answer options */}
      <View style={styles.optionsContainer}>
        {question.type === 'multiple_choice' && question.options ? (
          question.options.map((option, index) => (
            <CheckBox
              key={index}
              title={`${String.fromCharCode(65 + index)}) ${option}`}
              checked={selectedAnswer === option}
              onPress={() => handleAnswerSelect(option)}
              disabled={hasAnswered}
              containerStyle={[
                styles.checkboxContainer,
                getOptionStyle(option)
              ]}
              textStyle={[
                styles.checkboxText,
                { color: getOptionTextColor(option) }
              ]}
              checkedColor={hasAnswered ? 'white' : colors.background}
              uncheckedColor={colors.primary}
              size={24}
            />
          ))
        ) : (
          <View style={styles.fillBlankContainer}>
            <CustomText fontSize="normal" style={styles.fillBlankText}>
              Type your answer:
            </CustomText>
            <CustomInput
              placeholder="Enter your answer..."
              value={typedAnswer}
              onChangeText={(text) => {
                console.log('Typing:', text)
                setTypedAnswer(text)
              }}
              style={styles.textInput}
              onSubmitEditing={handleTypedAnswer}
              returnKeyType="done"
            />
            <CustomButton
              title="Submit Answer"
              onPress={handleTypedAnswer}
              disabled={hasAnswered || !typedAnswer.trim()}
              style={styles.submitButton}
            />
          </View>
        )}
      </View>

      {/* Feedback */}
      {hasAnswered && (
        <View style={styles.feedbackContainer}>
          <CustomText 
            fontSize="large" 
            bold 
            style={{
              ...styles.feedbackText,
              color: isCorrect ? '#4CAF50' : '#F44336'
            }}
          >
            {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
          </CustomText>
          <CustomText fontSize="normal" style={styles.correctAnswerText}>
            Correct answer: {question.correctAnswer}
          </CustomText>
          {!isCorrect && typedAnswer && (
            <CustomText fontSize="normal" style={styles.yourAnswerText}>
              Your answer: {typedAnswer}
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
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    textAlign: 'center',
    marginBottom: 10,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  questionText: {
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 28,
  },
  contextText: {
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  checkboxContainer: {
    marginVertical: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  checkboxText: {
    fontSize: 16,
    textAlign: 'left',
    fontFamily: 'DMSans-Regular',
  },
  optionButton: {
    marginVertical: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  fillBlankContainer: {
    alignItems: 'center',
  },
  fillBlankText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  textInput: {
    width: '100%',
    marginBottom: 15,
    textAlign: 'center',
  },
  submitButton: {
    width: '60%',
  },
  feedbackContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  feedbackText: {
    marginBottom: 10,
  },
  correctAnswerText: {
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 5,
  },
  yourAnswerText: {
    textAlign: 'center',
    opacity: 0.6,
    fontStyle: 'italic',
  },
  continueButton: {
    width: '100%',
    marginTop: 20,
  },
})

export default QuizQuestion 