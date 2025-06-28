import CustomIcon from '@/components/CustomIcon';
import OnboardingPage from '@/components/OnboardingPage';
import { clearCachedWords } from '@/database/wordCache';
import useUserStore from '@/stores/userStore';
import notificationService from "@/utils/notificationService";
import { useEffect } from 'react';

const Finish = () => {
  const { completeOnboarding, notificationsEnabled, dailyWordNotificationTime } = useUserStore();

  useEffect(() => {
    // Ensure onboarding is marked as complete
    completeOnboarding();
    
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

    // After onboarding is complete, schedule notifications if enabled
    const scheduleNotifications = async () => {
      if (notificationsEnabled) {
        await notificationService.scheduleDailyWordNotification(dailyWordNotificationTime);
        await notificationService.scheduleStreakReminderNotification();
      }
    };
    scheduleNotifications();
  }, [completeOnboarding, notificationsEnabled, dailyWordNotificationTime]);

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