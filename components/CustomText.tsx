import { useTheme } from '@react-navigation/native';
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
    primary?: boolean;
}

const fontSizes = {small: 12, normal: 17, large: 25, XL: 30};

const CustomText = ({children, style, onPress, color, fontSize = 'normal', bold, opacity, textAlign,primary, numberOfLines}:CustomTextProps) => {
  const {colors} = useTheme();
  return (
    <Text 
    numberOfLines={numberOfLines}
    onPress={onPress} 
    style={[style, 
      {
        color: color ? color : primary ? colors.primary : colors.text,
        opacity,
        textAlign,
        fontSize: fontSizes[fontSize],
        fontFamily: bold ? 'DMSans-Bold' : 'DMSans-Regular'
      }
    ]}>
      {children}
    </Text>
  )
}

export default CustomText