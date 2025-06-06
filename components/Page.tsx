import React from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'

interface PageProps {
  children:React.ReactNode
  style?: ViewStyle,
}

const Page = ({style, children}:PageProps) => {
  return (
    <View style = {[styles.con, style]}>
        {children}
    </View>
  )
}

export default Page

const styles = StyleSheet.create({
    con:{
        flex:1,
        justifyContent:"center",
        alignItems:"center",
    }
})