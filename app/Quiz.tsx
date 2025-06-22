import CustomText from '@/components/CustomText'
import Page from '@/components/Page'
import { useLocalSearchParams } from 'expo-router'

const Quiz = () => {
  const {words} = useLocalSearchParams()
  const wordsArray = JSON.parse(words as string)

  return (
    <Page>
      <CustomText>Quiz</CustomText>
      <CustomText>Words:</CustomText>
      {wordsArray.map((word:any) => (
        <CustomText key={word.id}>{word.word}</CustomText>
      ))}
      <CustomText>{process.env.EXPO_PUBLIC_OPENAI_KEY}</CustomText>
    </Page>
  )
}

export default Quiz

/**
- 2-3 questions per word
- multiple choice, fill in the blank
- 80% to pass -> words become learned
- can retake right away
*/