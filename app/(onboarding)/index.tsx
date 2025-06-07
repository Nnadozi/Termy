import CustomButton from "@/components/CustomButton";
import CustomText from "@/components/CustomText";
import Page from "@/components/Page";
import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet } from "react-native";

const Welcome = () => {
  return (
    <Page>
      <Image resizeMode="contain" source={require("../../assets/images/icon.png")} style={styles.image} />
      <CustomText fontSize="large" bold style={{marginTop:"3%"}}>Welcome to Termy</CustomText>
      <CustomText fontSize="normal">Master real vocabulary. Daily.</CustomText>
      <CustomButton marginVertical="3%" title="Get Started" onPress={() => router.navigate("/(onboarding)/Intro")} />
    </Page>
  );
}

export default Welcome;

const styles = StyleSheet.create({
  image: {
    width:150,
    height:150,
    borderRadius: 10,
  }
})

/**
 * 
 * Purpose: Quick intro and brand hook.

Content:

App name/logo

1-sentence hook: “Master real vocabulary. Daily.”

“Get Started” button
 */