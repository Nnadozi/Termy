import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const allWordTopics = [
  "Science", "Mathematics", "History", "Literature", 
  "Psychology", "Philosophy", "Economics","Business", "Technology",
  "Medicine", "Law","Art", "Music", "Sports","Travel", 
  "Health", "Geography", "General"
]

interface UserState {
  userName: string
  avatarColor: string
  isOnboardingComplete: boolean
  dailyWordGoal: number
  notificationsEnabled: boolean
  wordTopics: string[]
  totalQuizzesTaken: number
  totalWordsLearned: number
  currentStreak: number
  longestStreak: number
  averageQuizScore: number
  lastQuizDate: string
  dailyWordsCompletedToday: boolean
  joinDate: string
}

interface UserActions {
  setUserName: (name: string) => void
  setAvatarColor: (color: string) => void
  setDailyWordGoal: (goal: number) => void
  setNotificationsEnabled: (enabled: boolean) => void
  completeOnboarding: () => void
  setWordTopics: (topics: string[]) => void
  updateQuizStats: (quizScore: number, wordsLearned: number) => void
  resetDailyCompletion: () => void
  setJoinDate: (date: string) => void
  resetUserStore: () => void
}

type UserStore = UserState & UserActions

const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      userName: '',
      avatarColor: ' #FF6A00', 
      isOnboardingComplete: false,
      dailyWordGoal: 3,
      notificationsEnabled: false,
      wordTopics: ["General"],
      totalQuizzesTaken: 0,
      totalWordsLearned: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageQuizScore: 0,
      lastQuizDate: '',
      dailyWordsCompletedToday: false,
      joinDate: '',
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
        const today = new Date().toISOString().split('T')[0]
        set({ isOnboardingComplete: true, joinDate: today })
      },
      setWordTopics: (topics: string[]) => {
        console.log('UserStore: Setting wordTopics to:', topics)
        set({ wordTopics: topics })
      },
      updateQuizStats: (quizScore: number, wordsLearned: number) => {
        const state = get()
        const today = new Date().toISOString().split('T')[0]
        const lastQuizDate = state.lastQuizDate
        
        // Calculate new average score
        const totalScore = state.averageQuizScore * state.totalQuizzesTaken + quizScore
        const newTotalQuizzes = state.totalQuizzesTaken + 1
        const newAverageScore = totalScore / newTotalQuizzes
        
        // Calculate streak
        let newStreak = state.currentStreak
        let newLongestStreak = state.longestStreak
        
        if (lastQuizDate === today) {
          // Already completed today, don't update streak
        } else if (lastQuizDate === '' || isConsecutiveDay(lastQuizDate, today)) {
          // Consecutive day, increment streak
          newStreak = state.currentStreak + 1
          newLongestStreak = Math.max(state.longestStreak, newStreak)
        } else {
          // Break in streak, reset to 1
          newStreak = 1
        }
        
        console.log('UserStore: Updating quiz stats:', {
          quizScore,
          wordsLearned,
          newStreak,
          newLongestStreak,
          newAverageScore
        })
        
        set({
          totalQuizzesTaken: newTotalQuizzes,
          totalWordsLearned: state.totalWordsLearned + wordsLearned,
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          averageQuizScore: newAverageScore,
          lastQuizDate: today,
          dailyWordsCompletedToday: true
        })
      },
      resetDailyCompletion: () => {
        console.log('UserStore: Resetting daily completion')
        set({ dailyWordsCompletedToday: false })
      },
      setJoinDate: (date: string) => {
        console.log('UserStore: Setting joinDate to:', date)
        set({ joinDate: date })
      },
      resetUserStore: () => {
        console.log('UserStore: Resetting all user data')
        set({
          userName: '',
          avatarColor: '#FF6A00',
          isOnboardingComplete: false,
          dailyWordGoal: 3,
          notificationsEnabled: false,
          wordTopics: ['General'],
          totalQuizzesTaken: 0,
          totalWordsLearned: 0,
          currentStreak: 0,
          longestStreak: 0,
          averageQuizScore: 0,
          lastQuizDate: '',
          dailyWordsCompletedToday: false,
          joinDate: ''
        })
      }
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

// Helper function to check if two dates are consecutive days
const isConsecutiveDay = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays === 1
}

export default useUserStore

// Export resetUserStore for external use
export const resetUserStore = () => {
  const store = useUserStore.getState()
  store.resetUserStore()
}