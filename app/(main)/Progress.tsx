import CustomButton from '@/components/CustomButton'
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
    if (score >= 90) return '#4CAF50'
    if (score >= 80) return '#FF9800'
    if (score >= 70) return '#FF5722'
    return '#F44336'
  }

  return (
    <Page style={{justifyContent:"flex-start", alignItems:"flex-start"}}>
      <ScrollView 
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Avatar */}
        <View style={{width:"100%", marginBottom:"5%", alignItems: "center"}}>
          <Avatar 
            size={80} 
            rounded 
            title={userName.charAt(0).toUpperCase() || "A"}
            containerStyle={{ 
              alignSelf: "center", 
              backgroundColor: avatarColor,
              marginBottom: 15
            }} 
          />
          <CustomText fontSize='XL' bold>Progress</CustomText>
          <CustomText fontSize='normal' style={{ opacity: 0.7 }}>
            Your learning journey, {userName}
          </CustomText>
        </View>

        {/* Streak Section */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <CustomText fontSize='large' bold style={{ marginBottom: 15 }}>
            🔥 Learning Streak
          </CustomText>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <CustomText fontSize='XL' bold style={{ color: colors.primary }}>
                {currentStreak}
              </CustomText>
              <CustomText fontSize='small' style={{ opacity: 0.7 }}>
                Current Streak
              </CustomText>
            </View>
            <View style={styles.statItem}>
              <CustomText fontSize='XL' bold style={{ color: colors.primary }}>
                {longestStreak}
              </CustomText>
              <CustomText fontSize='small' style={{ opacity: 0.7 }}>
                Longest Streak
              </CustomText>
            </View>
          </View>
          <CustomText fontSize='normal' style={{ textAlign: 'center', marginTop: 10 }}>
            {getStreakEmoji(currentStreak)} Keep it up!
          </CustomText>
        </View>

        {/* Quiz Statistics */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <CustomText fontSize='large' bold style={{ marginBottom: 15 }}>
            📊 Quiz Performance
          </CustomText>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <CustomText fontSize='XL' bold style={{ color: colors.primary }}>
                {totalQuizzesTaken}
              </CustomText>
              <CustomText fontSize='small' style={{ opacity: 0.7 }}>
                Quizzes Taken
              </CustomText>
            </View>
            <View style={styles.statItem}>
              <CustomText fontSize='XL' bold style={{ color: getScoreColor(averageQuizScore) }}>
                {formatScore(averageQuizScore)}%
              </CustomText>
              <CustomText fontSize='small' style={{ opacity: 0.7 }}>
                Average Score
              </CustomText>
            </View>
          </View>
        </View>

        {/* Words Learned */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <CustomText fontSize='large' bold style={{ marginBottom: 15 }}>
            📚 Vocabulary Mastery
          </CustomText>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <CustomText fontSize='XL' bold style={{ color: colors.primary }}>
                {totalWordsLearned}
              </CustomText>
              <CustomText fontSize='small' style={{ opacity: 0.7 }}>
                Words Learned
              </CustomText>
            </View>
            <View style={styles.statItem}>
              <CustomText fontSize='XL' bold style={{ color: colors.primary }}>
                {dailyWordGoal}
              </CustomText>
              <CustomText fontSize='small' style={{ opacity: 0.7 }}>
                Daily Goal
              </CustomText>
            </View>
          </View>
          <CustomText fontSize='normal' style={{ textAlign: 'center', marginTop: 10 }}>
            🎯 You're building an impressive vocabulary!
          </CustomText>
        </View>

        {/* Learning Preferences */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <CustomText fontSize='large' bold style={{ marginBottom: 15 }}>
            ⚙️ Learning Preferences
          </CustomText>
          <View style={styles.preferenceRow}>
            <CustomText fontSize='normal' bold>Topics:</CustomText>
            <CustomText fontSize='normal' style={{ opacity: 0.8 }}>
              {wordTopics.join(', ')}
            </CustomText>
          </View>
          <View style={styles.preferenceRow}>
            <CustomText fontSize='normal' bold>Daily Goal:</CustomText>
            <CustomText fontSize='normal' style={{ opacity: 0.8 }}>
              {dailyWordGoal} words per day
            </CustomText>
          </View>
          <CustomButton title='Change Preferences' onPress={() => router.push('/(settings)/Profile')} />
        </View>

        {/* Motivation */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <CustomText fontSize='large' bold style={{ marginBottom: 15 }}>
            💪 Keep Going!
          </CustomText>
          <CustomText fontSize='normal' style={{ textAlign: 'center', lineHeight: 24 }}>
            {currentStreak > 0 
              ? `You're on a ${currentStreak}-day streak! Don't break the chain.`
              : "Start your learning journey today and build an amazing streak!"
            }
          </CustomText>
          <CustomText fontSize='normal' style={{ textAlign: 'center', marginTop: 10, opacity: 0.7 }}>
            Every word learned is a step toward mastery.
          </CustomText>
        </View>
      </ScrollView>
    </Page>
  )
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  achievementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
})

export default Progress

