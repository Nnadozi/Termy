import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface UserState {
  userName: string
  avatarColor: string
  isOnboardingComplete: boolean
}

interface UserActions {
  setUserName: (name: string) => void
  setAvatarColor: (color: string) => void
  completeOnboarding: () => void
}

type UserStore = UserState & UserActions

const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      userName: '',
      avatarColor: ' #FF6A00', 
      isOnboardingComplete: false,
      setUserName: (name: string) => {
        console.log('UserStore: Setting userName to:', name)
        set({ userName: name })
      },
      setAvatarColor: (color: string) => {
        console.log('UserStore: Setting avatarColor to:', color)
        set({ avatarColor: color })
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