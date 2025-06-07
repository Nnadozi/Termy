import CustomIcon from '@/components/CustomIcon';
import OnboardingPage from '@/components/OnboardingPage';
import React from 'react';
const Finish = () => {
  return (
    <OnboardingPage
      progress={1}
      title="Finish"
      subTitle="You're all set up -  enjoy Termy!"
      nextPage="/(main)/Home"
    >
      <CustomIcon name='celebration' type='material' size={200} color='black' />
    </OnboardingPage>
  )
}

export default Finish


/**
 * 
 * First day’s 3 words are unlocked.

Encourage them to learn the words first, then take a quiz.

Add subtle guidance text: “Tap each word to view definition and examples before you quiz!”
 */