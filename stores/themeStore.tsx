import { CustomDarkTheme, CustomLightTheme } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import useUserStore from './userStore';

interface ThemeStore {
 mode: 'light' | 'dark' | 'system';
 colors: typeof CustomLightTheme | typeof CustomDarkTheme; 
 isDark: boolean;
 setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
 updatePrimaryColor: (color: string) => void;
}

// Helper function to get theme colors with dynamic primary color
const getThemeColors = (isDark: boolean, primaryColor: string) => {
  const baseTheme = isDark ? CustomDarkTheme : CustomLightTheme;
  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: primaryColor,
    },
  };
};

export const useThemeStore = create<ThemeStore>()(
 persist(
   (set, get) => ({
     mode: 'system',
     colors: (() => {
       const isDark = Appearance.getColorScheme() === 'dark';
       const avatarColor = useUserStore.getState().avatarColor;
       return getThemeColors(isDark, avatarColor);
     })(),
     isDark: Appearance.getColorScheme() === 'dark',
     setThemeMode: (mode) => {
       const effectiveTheme = mode === 'system' ? Appearance.getColorScheme() : mode;
       const isDark = effectiveTheme === 'dark';
       const avatarColor = useUserStore.getState().avatarColor;
       set({ 
         mode, 
         colors: getThemeColors(isDark, avatarColor), 
         isDark 
       });
     },
     updatePrimaryColor: (color: string) => {
       const state = get();
       set({ colors: getThemeColors(state.isDark, color) });
     },
   }),
   {
     name: 'theme-storage',
     storage: createJSONStorage(() => AsyncStorage), 
   }
 )
);

// Subscribe to avatar color changes and update theme
useUserStore.subscribe((state) => {
  const avatarColor = state.avatarColor;
  useThemeStore.getState().updatePrimaryColor(avatarColor);
});