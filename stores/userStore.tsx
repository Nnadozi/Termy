import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const allWordTopics = [
  "SAT", "ACT","Science", "Mathematics", "History", "Literature", 
  "Psychology", "Philosophy", "Economics","Business", "Technology",
  "Medicine", "Law","Art", "Music", "Sports","Travel", 
  "Health & Fitness","General"
]

interface UserState {
  userName: string
  avatarColor: string
  isOnboardingComplete: boolean
  dailyWordGoal: number
  notificationsEnabled: boolean
  wordTopics: string[]
}

interface UserActions {
  setUserName: (name: string) => void
  setAvatarColor: (color: string) => void
  setDailyWordGoal: (goal: number) => void
  setNotificationsEnabled: (enabled: boolean) => void
  completeOnboarding: () => void
  setWordTopics: (topics: string[]) => void
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
      wordTopics: [],
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
      setWordTopics: (topics: string[]) => {
        console.log('UserStore: Setting wordTopics to:', topics)
        set({ wordTopics: topics })
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

export default useUserStore