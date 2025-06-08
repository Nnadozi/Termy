
import CustomButton from '@/components/CustomButton';
import CustomText from '@/components/CustomText';
import Page from '@/components/Page';
import { useThemeStore } from '@/stores/themeStore';
import React from 'react';

const Settings = () => {
  const {mode, setThemeMode} = useThemeStore();
  return (
    <Page>
      <CustomText bold fontSize='XL'>Settings</CustomText>
      <CustomText>
      Theme, Language, Notifications, feedback / support, PP/TOS,
      rate/review, version, onboarding
      </CustomText>
      <CustomText >Set Theme: </CustomText>
      <CustomButton title='System' onPress={() => setThemeMode('system')}/>
      <CustomButton title='Light' onPress={() => setThemeMode('light')}/>
      <CustomButton title='Dark' onPress={() => setThemeMode('dark')}/>
    </Page>
  )
}

export default Settings