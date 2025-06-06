import React from 'react';
import { Text, TextStyle } from 'react-native';

interface CustomTextProps {
    children:React.ReactNode
    style?:TextStyle
    color?: string;
    fontSize?: 'small' | 'normal' | 'large' | 'XL';  
    bold?: boolean;  
    opacity?: number;
    textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
    numberOfLines?: number;
    onPress?: () => void;
}

const fontSizes = {small: 16, normal: 20, large: 24, XL: 32};

const CustomText = ({children, style, onPress, color, fontSize = 'normal', bold, opacity, textAlign, numberOfLines}:CustomTextProps) => {
  return (
    <Text 
    onPress={onPress} 
    style={[style, 
      {
        color,
        opacity,
        textAlign,
        fontSize: fontSizes[fontSize],
        fontFamily: bold ? 'Lato-Bold' : 'Lato-Regular'
      }
    ]}>
      {children}
    </Text>
  )
}

export default CustomText