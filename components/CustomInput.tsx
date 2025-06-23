import { useTheme } from '@react-navigation/native';
import { DimensionValue, KeyboardTypeOptions, StyleSheet, TextInput, TextStyle } from 'react-native';

interface CustomInputProps {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    style?: TextStyle;
    width?: DimensionValue;
    maxLength?: number;
    keyboardType?: KeyboardTypeOptions;
    multiline?: boolean;
    onSubmitEditing?: () => void;
    returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
    editable?: boolean;
    textAlign?: 'left' | 'right' | 'center';
}

const CustomInput = ({placeholder, value, onChangeText, style, width, maxLength, keyboardType, multiline, onSubmitEditing, returnKeyType, editable, textAlign}:CustomInputProps) => {
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
    placeholderTextColor={"darkgray"}
    maxLength={maxLength}
    cursorColor={colors.text}
    keyboardType={keyboardType}
    multiline={multiline}
    textAlignVertical={multiline ? "top" : textAlign as "auto" | "center" | "top" | "bottom"}
    onSubmitEditing={onSubmitEditing}
    returnKeyType={returnKeyType}
    editable={editable}
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