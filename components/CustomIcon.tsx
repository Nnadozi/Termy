import { Icon } from '@rneui/base';
import React from 'react';
import { StyleSheet, TextStyle } from 'react-native';

interface CustomIconProps {
  name: string;
  type?: 'antdesign' | 'entypo' | 'evilicon' | 'feather' | 'font-awesome' | 'font-awesome-5' | 'fontisto' | 'foundation' | 'ionicon' | 'material' | 'material-community' | 'octicon' | 'simple-line-icon' | 'zocial';
  size?: number;
  color?: string;
  style?: TextStyle;
  onPress?: () => void;
}

const CustomIcon = ({ color = "black", size = 30, name, type, onPress, style }: CustomIconProps) => {
  return (
    <Icon
      color={color}
      name={name}
      type={type}
      size={size} 
      onPress={onPress}
      style={style}
    />
  );
};

export default CustomIcon;
const styles = StyleSheet.create({});
