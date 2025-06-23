import CustomIcon from '@/components/CustomIcon';
import OnboardingPage from '@/components/OnboardingPage';
import { clearCachedWords } from '@/database/wordCache';
import useUserStore from '@/stores/userStore';
import { useEffect } from 'react';

const Finish = () => {
  const { completeOnboarding } = useUserStore();

  useEffect(() => {
    // Ensure onboarding is marked as complete
    completeOnboarding();
    
    // Clear any cached words when onboarding completes
    // This ensures the Daily screen will fetch new words with the user's preferences
    const clearCache = async () => {
      try {
        await clearCachedWords();
        console.log('Cleared cached words after onboarding completion');
      } catch (error) {
        console.log('Error clearing cache after onboarding:', error);
      }
    };
    
    clearCache();
  }, [completeOnboarding]);

  return (
    <OnboardingPage
      progress={1}
      title="Onboarding Finished"
      subTitle="You're all set up -  enjoy Termy!"
      nextPage="/(main)/Daily"
    >
      <CustomIcon name='celebration' type='material' size={200}  />
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