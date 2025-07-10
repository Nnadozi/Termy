import CustomIcon from '@/components/CustomIcon';
import OnboardingPage from '@/components/OnboardingPage';
import { clearCachedWords } from '@/database/wordCache';
import { useEffect } from 'react';

const Finish = () => {
  useEffect(() => {
    // Onboarding is already completed in ProfileSetup - no need to call completeOnboarding here
    
    // Clear any cached words when onboarding completes
    const clearCache = async () => {
      try {
        await clearCachedWords();
        console.log('Cleared cached words after onboarding completion');
      } catch (error) {
        console.log('Error clearing cache after onboarding:', error);
      }
    };
    clearCache();

    // Notifications are already handled in completeOnboarding() from ProfileSetup - no need to schedule here
  }, []);

  return (
    <OnboardingPage
      progress={1}
      title="Onboarding Finished"
      subTitle="You're all set up -  enjoy Termy!"
      nextPage="/(main)/Daily"
    >
      <CustomIcon name='celebration' type='material' size={150}  />
    </OnboardingPage>
  )
}

export default Finish


/**
 * 
 * First day's 3 words are unlocked.

Encourage them to learn the words first, then take a quiz.

Add subtle guidance text: "Tap each word to view definition and examples before you quiz!"
 */