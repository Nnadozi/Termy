import CustomButton from "@/components/CustomButton";
import CustomText from "@/components/CustomText";
import Page from "@/components/Page";
import useUserStore from "@/stores/userStore";
import { Redirect, router } from "expo-router";
import { Image, StyleSheet } from "react-native";

const Welcome = () => {
  const { isOnboardingComplete, userName } = useUserStore()
  if (isOnboardingComplete && userName) {
    return <Redirect href="/(main)/Daily" />
  }
  return (
    <Page>
      <Image resizeMode="contain" source={require("../../assets/images/icon.png")} style={styles.image} />
      <CustomText fontSize="large" bold style={{marginTop:10}}>Welcome to Termy</CustomText>
      <CustomText fontSize="normal">Master your English vocabulary.</CustomText>
      <CustomButton width={"90%"} marginVertical={10} title="Get Started" onPress={() => router.navigate("/(onboarding)/Intro")} />
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

