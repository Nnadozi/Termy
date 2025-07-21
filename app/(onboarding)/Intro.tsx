import CustomIcon from '@/components/CustomIcon'
import CustomText from '@/components/CustomText'
import OnboardingPage from '@/components/OnboardingPage'
import { useTheme } from '@react-navigation/native'
import { useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import PagerView from 'react-native-pager-view'

const Intro = () => {
  const { colors } = useTheme()
  const [currentPage, setCurrentPage] = useState(0)
  const pagerRef = useRef<PagerView>(null)

  const scrollToPage = (page: number) => {
    pagerRef.current?.setPage(page)
  }

  const scrollToNext = () => {
    if (currentPage < 2) {
      scrollToPage(currentPage + 1)
    }
  }

  const scrollToPrevious = () => {
    if (currentPage > 0) {
      scrollToPage(currentPage - 1)
    }
  }

  return (
    <OnboardingPage
      progress={0.2}
      title="Quick Introduction"
      subTitle="Here's how Termy works..."
      nextPage="/(onboarding)/Preferences"
    >
      <PagerView 
        initialPage={0} 
        style={styles.con} 
        orientation="horizontal" 
        ref={pagerRef}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        <View key="1" style={styles.page}>
          <CustomIcon style={{marginBottom: "3%"}} name="book-reader" type='font-awesome-5' size={125} primary/>
          <CustomText primary fontSize="large" bold textAlign="center">Learn New Words Daily</CustomText>
          <CustomText textAlign="center" opacity={0.5}>
            Get personalized vocabulary tailored to your interests.
          </CustomText>
        </View>
        
        <View key="2" style={styles.page}>
          <CustomIcon style={{marginBottom: "3%"}} name="quiz" type='material' size={125} primary/>
          <CustomText primary fontSize="large" bold textAlign="center">Show What You Know</CustomText>
          <CustomText textAlign="center" opacity={0.5}>
            Test your understanding with smart quizzes that adapt to your progress.
          </CustomText>
        </View>
        
        <View key="3" style={styles.page}>
          <CustomIcon style={{marginBottom: "3%"}} name="line-chart" type='font-awesome' size={125} primary/>
          <CustomText primary fontSize="large" bold textAlign="center">Repeat, and Improve</CustomText>
          <CustomText textAlign="center" opacity={0.5}>
            Track your progress and maintain your learning momentum with daily streaks.
          </CustomText>
        </View>
      </PagerView>

      {/* Pagination Dots and Navigation */}
      <View style={styles.paginationContainer}>
        {currentPage > 0 && (
          <CustomIcon
            name="chevron-left"
            type="entypo"
            size={25}
            primary
            onPress={scrollToPrevious}
          />
        )}
        
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((index) => (
            <View
              key={index}
              style={[
                {width: 10, height: 10, borderRadius: 100 },
                { backgroundColor: currentPage === index ? colors.primary : colors.border }
              ]}
            />
          ))}
        </View>

        {currentPage < 2 && (
          <CustomIcon
            name="chevron-right"
            type="entypo"
            size={25}
            primary
            onPress={scrollToNext}
          />
        )}
      </View>
    </OnboardingPage>
  )
}

const styles = StyleSheet.create({
  con:{
    flex: 1,
    width: "100%",
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: "5%",
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: "3%",
    gap: 10,
  },
})

export default Intro

