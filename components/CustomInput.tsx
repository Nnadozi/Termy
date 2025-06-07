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
  return (
    <TextInput
    placeholder={placeholder}
    value={value}
    onChangeText={onChangeText}
    style={[styles.input, style, { width: width || '100%' }]}
    placeholderTextColor="darkgray"
    maxLength={maxLength}

    />
  )
}

export default CustomInput

const styles = StyleSheet.create({
    input:{
        borderWidth: 1,
        borderColor: 'darkgray',
        padding:"4%",
        paddingLeft:"3%",
        paddingRight:"10%",
        borderRadius: 10,
        marginVertical:"1%"
    }
})