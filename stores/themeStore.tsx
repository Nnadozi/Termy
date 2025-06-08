import { CustomDarkTheme, CustomLightTheme } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ThemeStore {
 mode: 'light' | 'dark' | 'system';
 colors: typeof CustomLightTheme | typeof CustomDarkTheme; 
 isDark: boolean;
 setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
}

export const useThemeStore = create<ThemeStore>()(
 persist(
   (set) => ({
     mode: 'system',
     colors: Appearance.getColorScheme() === 'dark' ? CustomDarkTheme : CustomLightTheme, 
     isDark: Appearance.getColorScheme() === 'dark',
     setThemeMode: (mode) => {
       const effectiveTheme = mode === 'system' ? Appearance.getColorScheme() : mode;
       set({ 
         mode, 
         colors: effectiveTheme === 'dark' ? CustomDarkTheme : CustomLightTheme, 
         isDark: effectiveTheme === 'dark' 
       });
     },
   }),
   {
     name: 'theme-storage',
     storage: createJSONStorage(() => AsyncStorage), 
   }
 )
);