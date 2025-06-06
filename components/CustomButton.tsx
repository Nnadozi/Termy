import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import CustomText from './CustomText';

interface CustomButtonProps {
    title: string;
    onPress: () => void;
    style?: ViewStyle;
    disabled?: boolean;
}

const CustomButton = ({title, onPress, style, disabled}:CustomButtonProps) => {
  return (
    <TouchableOpacity disabled={disabled} onPress={onPress} style = {[styles.con, style]}>
      <CustomText>{title}</CustomText>
    </TouchableOpacity> 
  )
}

export default CustomButton

const styles = StyleSheet.create({
    con:{
        justifyContent:"center",
        alignItems:"center",
        paddingVertical:"3%",
    }
})