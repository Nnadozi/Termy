import CustomButton from "@/components/CustomButton";
import CustomText from "@/components/CustomText";
import Page from "@/components/Page";
import useUserStore from "@/stores/userStore";
import { Redirect, router } from "expo-router";
import React from "react";
import { Image, StyleSheet } from "react-native";

const Welcome = () => {
  const { isOnboardingComplete } = useUserStore()
  if (isOnboardingComplete) {
    return <Redirect href="/(main)/Daily" />
  }
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

