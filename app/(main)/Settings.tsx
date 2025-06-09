import AppearanceModal from '@/components/AppearanceModal';
import CustomIcon from '@/components/CustomIcon';
import CustomText from '@/components/CustomText';
import LanguageModal from '@/components/LanguageModal';
import Page from '@/components/Page';
import { useTheme } from '@react-navigation/native';
import Constants from 'expo-constants';
import React, { useState } from 'react';
import { Linking, StyleSheet, TouchableOpacity, View } from 'react-native';

const Settings = () => {
  const [appearanceModalVisible, setAppearanceModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const { colors } = useTheme();
  const options = [
    { key: "user", value: "Profile", type: "antdesign", onPress: () => {} },
    { key: "notifications", value: "Notifications", type: "ionicon", onPress: () => {} },
    { key: "palette", value: "Appearance", type: "ionicons", onPress: () => setAppearanceModalVisible(true) },
    { key: "language", value: "Language", type: "ionicon", onPress: () => setLanguageModalVisible(true) },
    { key: "email", value: "Feedback & Support", type: "fontiso", onPress: () => {Linking.openURL("mailto:chikaosro@gmail.com")} },
    { key: "star", value: "Rate", type: "ionicons", onPress: () => { Linking.openURL("https://play.google.com/store/apps/details?id=com.vocab.app") } },
    { key: "shield", value: "Privacy Policy", type: "feather", onPress: () => { Linking.openURL("https://play.google.com/store/apps/details?id=com.vocab.app") } },
    { key: "information-circle", value: "Version", type: "ionicon", onPress: () => {} },
  ];
  const showOption = (option: { key: string; value: string; type: any; onPress: () => void }, index: number) => {
    return (
      <TouchableOpacity onPress={option.onPress} key={index} style={[
          styles.optionContainer,
          { borderBottomColor: colors.border } 
        ]}>
        {option.value === "Version" ?( 
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: "2%" }}> 
            <View style={{ flexDirection: "row", alignItems: "center", gap: "5%" }}>
              <CustomIcon type={option.type} size={20} name={option.key} />
              <CustomText>{option.value}</CustomText>
            </View>
            <CustomText color="gray">{Constants.expoConfig?.version}</CustomText>
          </View>
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center", gap: "2%" }}> 
          <CustomIcon type={option.type} size={20} name={option.key} />
          <CustomText>{option.value}</CustomText>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Page style={{ justifyContent: "flex-start", alignItems: "flex-start" }}>
      <View style={{ width: "100%", marginBottom: "3%" }}>
        <CustomText bold fontSize='XL'>Settings</CustomText>
      </View>
      {options.map((option, index) => showOption(option, index))}
      <AppearanceModal visible={appearanceModalVisible} onRequestClose={() => setAppearanceModalVisible(false)} />
      <LanguageModal visible={languageModalVisible} onRequestClose={() => setLanguageModalVisible(false)} />
    </Page>
  );
};

export default Settings;

const styles = StyleSheet.create({
  optionContainer: {
    width: "100%",
    borderBottomWidth: 0.25,
    paddingVertical: "5%"
  },
});