import CustomText from '@/components/CustomText'
import OnboardingPage from '@/components/OnboardingPage'
import React from 'react'

const Preferences = () => {
  return (
    <OnboardingPage
      progress={0.5}
      title="Setup Preferences"
      subTitle="Personalize your experience"
      nextPage="/(onboarding)/ProfileSetup"
    >
      <CustomText>
        Preferences
      </CustomText>
    </OnboardingPage>
  )
}

export default Preferences

/**
 * 
 * Keep it simple. 2–3 steps max.

Step 1: Daily Goal

Default to 3 words/day

Allow selection: 3, 5, 10 (if premium, restrict upper limit with upsell prompt)

Step 2: Quiz Difficulty

Option to choose: Easy / Normal / Hard (or skip)

Step 3: Notification Opt-in

Friendly prompt: “Want a gentle nudge to learn every day?”
 */