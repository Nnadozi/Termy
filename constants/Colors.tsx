import { DarkTheme, DefaultTheme } from '@react-navigation/native';

export const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF6A00',      
    background: 'rgb(245, 247, 250)',
    card: 'rgb(255, 255, 255)',
    text: 'rgb(40, 44, 52)',
    border: 'rgb(200, 205, 210)',
    notification: 'rgb(255, 120, 80)'
  },
};

export const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#FF6A00',
    background: 'rgb(18, 22, 28)',
    card: 'rgb(28, 32, 38)',
    text: 'rgb(229, 229, 231)',
    border: 'rgb(39, 45, 51)',
    notification: 'rgb(255, 100, 70)'
  },
};