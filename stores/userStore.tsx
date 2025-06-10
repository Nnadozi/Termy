import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface UserState {
  userName: string
  avatarColor: string
  isOnboardingComplete: boolean
  dailyWordGoal: number
  notificationsEnabled: boolean
}

interface UserActions {
  setUserName: (name: string) => void
  setAvatarColor: (color: string) => void
  setDailyWordGoal: (goal: number) => void
  setNotificationsEnabled: (enabled: boolean) => void
  completeOnboarding: () => void
}

type UserStore = UserState & UserActions

const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      userName: '',
      avatarColor: ' #FF6A00', 
      isOnboardingComplete: false,
      dailyWordGoal: 3,
      notificationsEnabled: false,
      setUserName: (name: string) => {
        console.log('UserStore: Setting userName to:', name)
        set({ userName: name })
      },
      setAvatarColor: (color: string) => {
        console.log('UserStore: Setting avatarColor to:', color)
        set({ avatarColor: color })
      },
      setDailyWordGoal: (goal: number) => {
        console.log('UserStore: Setting dailyWordGoal to:', goal)
        set({ dailyWordGoal: goal })
      },
      setNotificationsEnabled: (enabled: boolean) => {
        console.log('UserStore: Setting notificationsEnabled to:', enabled)
        set({ notificationsEnabled: enabled })
      },
      completeOnboarding: () => {
        console.log('UserStore: Completing onboarding')
        set({ isOnboardingComplete: true })
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

export default useUserStore