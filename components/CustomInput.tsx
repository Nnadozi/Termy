import { useTheme } from '@react-navigation/native';
import React from 'react';
import { DimensionValue, StyleSheet, TextInput, TextStyle } from 'react-native';

interface CustomInputProps {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    style?: TextStyle;
    width?: DimensionValue;
    maxLength?: number;
}

const CustomInput = ({placeholder, value, onChangeText, style, width, maxLength}:CustomInputProps) => {
  const {colors} = useTheme();
  return (
    <TextInput
    placeholder={placeholder}
    value={value}
    onChangeText={onChangeText}
    style={[styles.input, style, 
      { width: width || '100%' },
      {color: colors.text},
      {borderColor: colors.border}
    ]}
    placeholderTextColor={colors.text}
    maxLength={maxLength}
    cursorColor={colors.text}
    />
  )
}

export default CustomInput

const styles = StyleSheet.create({
    input:{
        borderWidth: 1,
        padding:"4%",
        paddingLeft:"3%",
        paddingRight:"10%",
        borderRadius: 10,
        marginVertical:"1%",
    }
})