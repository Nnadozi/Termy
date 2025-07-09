import CustomInput from '@/components/CustomInput'
import CustomText from '@/components/CustomText'
import OnboardingPage from '@/components/OnboardingPage'
import { useThemeStore } from '@/stores/themeStore'
import useUserStore, { allWordTopics } from '@/stores/userStore'
import { ButtonGroup, Chip } from '@rneui/base'
import { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

const Preferences = () => {
  const { 
    dailyWordGoal, 
    setDailyWordGoal, 
    notificationsEnabled, 
    setNotificationsEnabled,
    wordTopics,
    setWordTopics
  } = useUserStore()
  
  const [goalValue, setGoalValue] = useState((dailyWordGoal ?? 3).toString())
  const { mode, setThemeMode, colors } = useThemeStore();
  const [selectedTopics, setSelectedTopics] = useState<string[]>(wordTopics || ["General"]);
  
  useEffect(() => {
    setSelectedTopics(wordTopics || ["General"]);
  }, [wordTopics]);

  useEffect(() => {
    setWordTopics(selectedTopics);
  }, [selectedTopics, setWordTopics]);

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic]
    );
  };

  return (
    <OnboardingPage
      progress={0.4}
      title="Set Preferences"
      subTitle="Personalize your experience"
      nextPage="/(onboarding)/NotificationsSetup"
      style={styles.container}
    >
      <ScrollView 
        style={{flex:1}}
        contentContainerStyle={{flexGrow:1, paddingBottom:200}}
        showsVerticalScrollIndicator={false}
      >
        <View style={{gap:"3%"}}>
        <View style={styles.row}>
            <View>
              <CustomText bold>Theme</CustomText>
              <CustomText fontSize="small">Choose your style</CustomText>
            </View>
            <ButtonGroup
              buttons={["Light", "Dark"]}
              buttonStyle={{backgroundColor: colors.colors.card}}
              textStyle={{color: colors.colors.text, fontFamily: "DMSans-Regular"}}
              selectedButtonStyle={{backgroundColor: colors.colors.primary}}
              selectedTextStyle={{color: colors.colors.background}}
              selectedIndex={mode === "dark" ? 1 : 0}
              onPress={(index) => setThemeMode(index === 0 ? "light" : "dark")}
              containerStyle={{width: "40%", borderWidth: 1, borderColor: colors.colors.border, marginRight:"0%"}}
            />
          </View>
          <View style={styles.row}> 
            <View>
              <CustomText bold>Daily Word Goal (9 max)</CustomText>
              <CustomText fontSize="small">We recommend learning 3 words daily</CustomText>
            </View>
            <CustomInput
             width={"25%"} 
             placeholder="3"
             value={goalValue} 
             onChangeText={(text) => {
               const filteredText = text.replace(/[^0-9]/g, '')
               setGoalValue(filteredText)
               const parsedValue = parseInt(filteredText)
               if (!isNaN(parsedValue) && parsedValue > 0) {
                 setDailyWordGoal(parsedValue)
               } else if (parsedValue === 0) {
                 // Reset to minimum value if user tries to set 0
                 setGoalValue("1")
                 setDailyWordGoal(1)
               }
             }} 
             keyboardType="number-pad"
             maxLength={1}
             />
          </View>             
          <View>
            <View>
              <CustomText bold>What Topics Interest You?</CustomText>
              <CustomText fontSize="small">We'll use this to personalize your vocabulary</CustomText>
            </View>
            <View style={styles.chipsContainer}>
            {allWordTopics.map((topic) => (
              <Chip
                key={topic}
                title={topic.charAt(0).toUpperCase() + topic.slice(1)}
                type={selectedTopics.includes(topic) ? 'solid' : 'outline'}
                onPress={() => toggleTopic(topic)}
                containerStyle={{ marginVertical: 5, marginRight:10 }}
                buttonStyle={{
                  backgroundColor: selectedTopics.includes(topic)
                    ? colors.colors.primary
                    : 'transparent',
                  borderColor: colors.colors.primary,
                  borderWidth: 1,
                }}
                titleStyle={{
                  color: selectedTopics.includes(topic)
                    ? colors.colors.background
                    : colors.colors.primary,
                  fontFamily: 'DMSans-Regular',
                }}
              />
            ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </OnboardingPage>
  )
}

export default Preferences

const styles = StyleSheet.create({
  container: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginTop: "5%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
})

