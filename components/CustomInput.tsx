import React from 'react';
import { StyleSheet, TextInput, TextStyle } from 'react-native';

interface CustomInputProps {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    style?: TextStyle;
}

const CustomInput = ({placeholder, value, onChangeText, style}:CustomInputProps) => {
  return (
    <TextInput
    placeholder={placeholder}
    value={value}
    onChangeText={onChangeText}
    style={[styles.input, style]}
    />
  )
}

export default CustomInput

const styles = StyleSheet.create({
    input:{
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
    }
})