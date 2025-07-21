import CustomButton from '@/components/CustomButton'
import CustomIcon from '@/components/CustomIcon'
import CustomInput from '@/components/CustomInput'
import CustomText from '@/components/CustomText'
import Page from '@/components/Page'
import { useTheme } from '@react-navigation/native'
import Constants from 'expo-constants'
import { router } from 'expo-router'
import { useState } from 'react'
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native'

const Feedback = () => {
  const { colors } = useTheme()
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      Alert.alert('Error', 'Please enter your feedback before submitting.')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Use server-side approach since EmailJS doesn't work in React Native
      const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
      
      const response = await fetch(`${supabaseUrl}/functions/v1/submit-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
          feedback: feedback.trim(),
          platform: Platform.OS,
          appVersion: Constants.expoConfig?.version || '1.0.0',
          userAgent: Platform.OS === 'ios' ? 'iOS' : 'Android'
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Feedback submission error:', errorText)
        throw new Error(`Failed to submit feedback: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      Alert.alert(
        'Thank You!',
        'Your feedback has been submitted. We appreciate your input!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      )
    } catch (error) {
      console.error('Error submitting feedback:', error)
      Alert.alert('Error', 'Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Page style={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
      <View style={{ width: '100%', marginBottom: '3%' }}>
      <View style={styles.topRow}>
                    <CustomIcon name="chevron-left" onPress={() => router.back()} />
                    <CustomText  fontSize='large' bold >Feedback</CustomText>
                    <View/>
                </View>
     
      </View>

      <ScrollView 
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <CustomText bold style={{  }}>
            What would you like to tell us?
          </CustomText>
          <CustomText fontSize='small' style={{ opacity: 0.7,marginBottom:5 }}>
          Help us improve Termy by sharing your thoughts
        </CustomText>
          <CustomInput
            placeholder="Share your feedback, report a bug, or suggest a feature..."
            value={feedback}
            onChangeText={setFeedback}
            multiline
            numberOfLines={8}
            style={{
              minHeight: 120,
              padding: 15,
              borderRadius: 8,
              borderWidth: 1,
              fontFamily: 'DMSans-Regular',
              backgroundColor: colors.background,
              borderColor: colors.border,
              color: colors.text
            }}
            maxLength={1000}
          />
          
          <CustomText fontSize="small" style={{ marginTop: 5, opacity: 0.6 }}>
            {feedback.length}/1000 characters
          </CustomText>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <CustomText bold style={{ marginBottom: 15 }}>
            Common Topics
          </CustomText>
          
          <View style={styles.topicContainer}>
            <CustomText fontSize="small" bold style={{ marginBottom: 5 }}>
              🐛 Bug Report
            </CustomText>
            <CustomText fontSize="small" gray>
              Something not working as expected? Let us know!
            </CustomText>
          </View>
          
          <View style={styles.topicContainer}>
            <CustomText fontSize="small" bold style={{ marginBottom: 5 }}>
              💡 Feature Request
            </CustomText>
            <CustomText fontSize="small" gray>
              Have an idea for a new feature? Let us hear it!
            </CustomText>
          </View>
          
          <View style={styles.topicContainer}>
            <CustomText fontSize="small" bold style={{ marginBottom: 5 }}>
              ⭐ General Feedback
            </CustomText>
            <CustomText fontSize="small" gray>
              Share your experience and help us improve Termy
            </CustomText>
          </View>
        </View>

        <CustomButton
          title={isSubmitting ? "Submitting..." : "Submit Feedback"}
          onPress={handleSubmit}
          disabled={isSubmitting || !feedback.trim()}
          style={{ marginTop: 20 }}
        />
      </ScrollView>
    </Page>
  )
}

export default Feedback

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 0,
  },
  section: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 15,
  },
  feedbackInput: {
    minHeight: 120,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    fontFamily: 'DMSans-Regular',
  },
  topicContainer: {
    marginBottom: 15,
  },
}) 