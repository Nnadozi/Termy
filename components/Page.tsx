import { useTheme } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface PageProps { 
  children:React.ReactNode
  style?: ViewStyle,
  applyInsets?: boolean
}

const Page = ({style, children, applyInsets = true}:PageProps) => {
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
  return (
    applyInsets ? (
      <SafeAreaView style={[styles.con, style, {
        paddingTop: insets.top * 0.25,
        paddingBottom: insets.bottom * 0.25,
        paddingLeft: insets.top * 0.5 ,
        paddingRight: insets.top * 0.5,
        backgroundColor: colors.background,
      }]}>
        {children}
      </SafeAreaView>
    ) : (
      <View style={[styles.con, style, {
        backgroundColor: colors.background,
      }]}>
        {children}
      </View>
    )
  )
}

export default Page

const styles = StyleSheet.create({
    con:{
        flex:1,
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:"white"
    }
})