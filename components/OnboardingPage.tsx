import { router } from 'expo-router'
import React from 'react'
import { Dimensions, StyleSheet, View, ViewStyle } from 'react-native'
import ConfettiCannon from 'react-native-confetti-cannon'
import * as Progress from 'react-native-progress'
import CustomButton from './CustomButton'
import CustomIcon from './CustomIcon'
import CustomText from './CustomText'
import Page from './Page'

interface OnboardingPageProps {
    children:React.ReactNode
    progress:number
    title:string;
    subTitle:string;
    nextPage: any
    style?: ViewStyle
    disableNext?: boolean
}

const OnboardingPage = ({children, progress, title, subTitle, nextPage, style, disableNext}:OnboardingPageProps) => {
  return (
    <Page >
        <View style={styles.topPortion}>
            <View style = {styles.topRow}>
                <CustomIcon name='chevron-left' onPress={() => router.back()} />
                <Progress.Bar 
                color='black' progress={progress} 
                width={Dimensions.get('window').width - 70} 
                height={Dimensions.get('window').height * 0.015}
                borderRadius={100}
                />
            </View>
            <CustomText bold textAlign='center' fontSize='XL'>{title}</CustomText>
            <CustomText textAlign='center'>{subTitle}</CustomText>
        </View>
        <View style={[styles.middlePortion, style]}>
            {children}
        </View>
        <View style={styles.bottomPortion}>
            <CustomButton disabled={disableNext} title={progress == 1 ? 'Lets Go' : 'Next'} onPress={() => router.navigate(nextPage)} />
        </View>
        {progress == 1 && (
        <ConfettiCannon
            count={150}
            origin={{x: 0, y: 0}}
            fadeOut={true}
            fallSpeed={3000}
        />
        )}
    </Page>
  ) 
}

export default OnboardingPage

const styles = StyleSheet.create({
    topRow:{
        flexDirection:"row",
        justifyContent:"center",
        alignItems:"center",
        width:"100%",
       // borderWidth:1,
    },
    topPortion:{
        justifyContent:"center",
        alignItems:"center",
        width:"100%",
        //borderWidth:1,
    },
    middlePortion:{
        flex:1,
        justifyContent:"center",
        alignItems:"center",
        width:"100%",
        //borderWidth:1,
    },
    bottomPortion:{
        flexDirection:"row",
        width:"100%",
        justifyContent:"center",
        alignItems:"center",
        //borderWidth:1,
    }
})