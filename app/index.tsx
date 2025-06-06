import CustomText from "@/components/CustomText";
import { View } from "react-native";
export default function Index() {
  return (
    <View className="flex-1 justify-center items-center">
      <CustomText fontSize="XL">Hi this is text</CustomText>
      <CustomText fontSize="large">Hi this is text</CustomText>
      <CustomText fontSize="normal">Hi this is text</CustomText>
      <CustomText fontSize="small">Hi this is text</CustomText>
    </View>
  );
}
