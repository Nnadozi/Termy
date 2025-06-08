import { useTheme } from '@react-navigation/native';
import { Button } from '@rneui/base';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

interface CustomButtonProps {
    title: string;
    onPress: () => void;
    style?: ViewStyle;
    disabled?: boolean;
    width?:any
    marginVertical?:any
}

const CustomButton = ({title, onPress, style, disabled, width, marginVertical}:CustomButtonProps) => {
  const {colors} = useTheme();
  return (
    <Button
    title={title}
    onPress={onPress}
    disabled={disabled}
    buttonStyle={[styles.con, style, 
      {width: width ? width : '100%', alignSelf:'center'},
      {marginVertical: marginVertical ? marginVertical : 0},
      {backgroundColor: colors.primary}
    ]}
    titleStyle={{fontFamily:'DMSans-Bold', fontSize:16, color: colors.background}}
    containerStyle={{width: width ? width : '100%'}}
    />
  )
}

export default CustomButton

const styles = StyleSheet.create({
    con:{
        justifyContent:"center",
        alignItems:"center",
        padding:"3.5%",
        borderRadius:100,
        backgroundColor:"black",
    }
})