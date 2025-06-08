import CustomText from '@/components/CustomText'
import OnboardingPage from '@/components/OnboardingPage'
import React from 'react'

const Intro = () => {
  return (
    <OnboardingPage
      progress={0.25}
      title="Quick Introduction"
      subTitle="A new way to learn vocabulary."
      nextPage="/(onboarding)/Preferences"
    >
      <CustomText >
        Termy is a new way to learn and practice your vocabulary.
      </CustomText>
    </OnboardingPage>

  )
}

export default Intro

/**
 * 
 * 3 quick slides highlighting core features:

Slide 1: “Learn 3 new words daily” → With an image or animation of word cards.

Slide 2: “Take AI-generated quizzes” → Show sample question types.

Slide 3: “Build your streak. Grow your mastery.” → Display streak UI or dashboard mock.

Each slide has a “Skip” option.
 */