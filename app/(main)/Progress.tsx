import CustomButton from '@/components/CustomButton'
import CustomIcon from '@/components/CustomIcon'
import CustomText from '@/components/CustomText'
import Page from '@/components/Page'
import useUserStore from '@/stores/userStore'
import { useTheme } from '@react-navigation/native'
import { Avatar } from '@rneui/base'
import { router } from 'expo-router'
import { ScrollView, StyleSheet, View } from 'react-native'

const Progress = () => {
  const { 
    userName,
    avatarColor,
    totalQuizzesTaken,
    totalWordsLearned,
    currentStreak,
    longestStreak,
    averageQuizScore,
    dailyWordGoal,
    wordTopics
  } = useUserStore()
  
  const { colors } = useTheme()

  const formatScore = (score: number) => {
    return Math.round(score).toString()
  }

  const getStreakEmoji = (streak: number) => {
    if (streak >= 7) return '🔥🔥🔥'
    if (streak >= 3) return '🔥🔥'
    if (streak >= 1) return '🔥'
    return '❄️'
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return colors.primary
    if (score >= 80) return colors.primary
    if (score >= 70) return colors.primary
    return colors.primary
  }

  const getScoreGradient = (score: number) => {
    return [colors.primary, colors.primary + 'CC']
  }

  return (
    <Page style={{justifyContent:"flex-start", alignItems:"flex-start"}}>
      <ScrollView 
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Modern Header with Avatar */}
        <View style={[styles.headerGradient, { backgroundColor: colors.background }]}>
          <View style={styles.headerContent}>
            <Avatar 
              size={100} 
              rounded 
              title={userName.charAt(0).toUpperCase() || "A"}
              containerStyle={{  backgroundColor: avatarColor, marginBottom: 10 }} 
            />
            <CustomText fontSize='XL' bold>
              Your Progress
            </CustomText>
            <CustomText fontSize='normal' >
              Keep up the great work, {userName}! 
            </CustomText>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Streak Card */}
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <CustomIcon name="local-fire-department"  primary size={24} style={{ marginBottom: 8 }} />
            <CustomText opacity={0.75} fontSize='XL' bold  style={{ marginBottom: 4 }}>
              {currentStreak}
            </CustomText>
            <CustomText bold fontSize='small' primary style={{ opacity: 0.9 }}>
              Day Streak
            </CustomText>
          </View>

          {/* Words Learned Card */}
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <CustomIcon name="book" size={24} primary style={{ marginBottom: 8 }} />
            <CustomText opacity={0.75} fontSize='XL' bold  style={{ marginBottom: 4 }}>
              {totalWordsLearned}
            </CustomText>
            <CustomText bold fontSize='small' primary >
              Words Learned
            </CustomText>
          </View>

          {/* Quiz Score Card */}
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <CustomIcon name="percent" size={24} primary style={{ marginBottom: 8 }} />
            <CustomText opacity={0.75} fontSize='XL' bold  style={{ marginBottom: 4 }}>
              {formatScore(averageQuizScore)}%
            </CustomText>
            <CustomText bold fontSize='small' primary >
              Average Score
            </CustomText>
          </View>

          {/* Quizzes Taken Card */}
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <CustomIcon name="quiz" size={24} primary style={{ marginBottom: 8 }} />
            <CustomText opacity={0.75} fontSize='XL' bold style={{ marginBottom: 4 }}>
              {totalQuizzesTaken}
            </CustomText>
            <CustomText bold fontSize='small' primary >
              Quizzes Taken
            </CustomText>
          </View>
        </View>

        {/* Achievement Section */}
        <View style={[styles.section, { backgroundColor: colors.card , borderColor: colors.border}]}>  
          <View style={styles.achievementRow}>
            <View style={styles.achievementItem}>
              <CustomIcon name="local-fire-department" size={20} primary />
              <CustomText primary fontSize='normal'  style={{ marginLeft: 8 }}>
                Longest Streak
              </CustomText>
            </View>
            <CustomText  fontSize='normal' >
              {longestStreak} days
            </CustomText>
          </View>

          <View style={styles.achievementRow}>
            <View style={styles.achievementItem}>
              <CustomIcon name="target" type='feather' size={20} primary />
              <CustomText primary fontSize='normal'  style={{ marginLeft: 8 }}>
                Daily Goal
              </CustomText>
            </View>
            <CustomText  fontSize='normal' >
              {dailyWordGoal} words
            </CustomText>
          </View>

          <View style={styles.achievementRow}>
            <View style={styles.achievementItem}>
              <CustomIcon name="category" size={20} primary />
              <CustomText primary fontSize='normal'  style={{ marginLeft: 8 }}>
                Learning Topics
              </CustomText>
            </View>
            <CustomText  fontSize='normal' >
              {wordTopics.length}
            </CustomText>
          </View>
        </View>
      
        {/* Action Button */}
        <CustomButton 
          title='Update Preferences' 
          onPress={() => router.push('/(settings)/Profile')}
        />
      </ScrollView>
    </Page>
  )
}

const styles = StyleSheet.create({
  headerGradient: {
    width: '100%',
    paddingVertical:'5%',
    paddingHorizontal:'3%',
    marginBottom:5,
  },
  headerContent: {
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    padding:'5%',
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 0.5,
  },
  section: {
    padding:"3%",
    borderWidth:1,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation:0.5,
    marginBottom:10,
  },
  achievementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical:10,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})

export default Progress

