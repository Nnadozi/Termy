import { useTheme } from '@react-navigation/native';
import React from 'react';
import { SafeAreaView, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PageProps {
  children:React.ReactNode
  style?: ViewStyle,
}

const Page = ({style, children}:PageProps) => {
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
  return (
    <SafeAreaView style={[styles.con, style, {
      paddingTop: insets.top * 1.3,
      paddingBottom: insets.bottom * 1.3,
      backgroundColor: colors.background,
    }]}>
      {children}
    </SafeAreaView>
  )
}

export default Page

const styles = StyleSheet.create({
    con:{
        flex:1,
        justifyContent:"center",
        alignItems:"center",
        paddingHorizontal:"5%",
        backgroundColor:"white"
    }
})