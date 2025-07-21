import AppearanceModal from '@/components/AppearanceModal';
import CustomIcon from '@/components/CustomIcon';
import CustomText from '@/components/CustomText';
import Page from '@/components/Page';
import { useTheme } from '@react-navigation/native';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const Settings = () => {
  const [appearanceModalVisible, setAppearanceModalVisible] = useState(false);
  const { colors } = useTheme();

  const options = [
    { key: "user", value: "Profile", type: "antdesign", onPress: () => {router.push("/(settings)/Profile")} },
    { key: "palette", value: "Appearance", type: "ionicons", onPress: () => setAppearanceModalVisible(true) },
    { key: "notifications", value: "Notifications", type: "ionicon", onPress: () => router.push("/(settings)/NotificationSettings") },
    { key: "message-circle", value: "Feedback & Support", type: "feather", onPress: () => router.push("/(settings)/Feedback") },
    //{ key: "star", value: "Rate", type: "ionicons", onPress: () => { Linking.openURL("https://play.google.com/store/apps/details?id=com.nnadozi.termy&showAllReviews=true&hl=en-US&ah=iNJ77HDtA-O4MUoQipJkv3eDTP8&pli=1") } },
    { key: "shield", value: "Privacy Policy", type: "feather", onPress: () => { Linking.openURL("https://www.termsfeed.com/live/bfc3acad-1c4a-476e-8e39-6f0becf8e3ad") } },
    { key: "information-circle", value: "Version", type: "ionicon", onPress: () => {} },
  ];


  const showOption = (option: { key: string; value: string; type: any; onPress: () => void }, index: number) => {
    return (
      <TouchableOpacity onPress={option.onPress} key={index} style={[
          styles.optionContainer,
          { borderBottomColor: colors.border } 
        ]}>
        {option.value === "Version" ?( 
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: "3%" }}> 
            <View style={{ flexDirection: "row", alignItems: "center", gap: "5%" }}>
              <CustomIcon type={option.type} size={20} name={option.key} />
              <CustomText>{option.value}</CustomText>
            </View>
            <CustomText color="gray">{Constants.expoConfig?.version}</CustomText>
          </View>
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}> 
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
      <ScrollView 
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {options.map((option, index) => showOption(option, index))}
      </ScrollView>
      <AppearanceModal visible={appearanceModalVisible} onRequestClose={() => setAppearanceModalVisible(false)} />
    </Page>
  );
};

export default Settings;

const styles = StyleSheet.create({
  optionContainer: {
    width: "100%",
    borderBottomWidth: 0.25,
    paddingVertical: 20
  },
});