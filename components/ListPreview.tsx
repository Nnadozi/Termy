import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import CustomIcon from "./CustomIcon";
import CustomText from "./CustomText";

interface ListPreviewProps {
    title: string
    description: string
    count: number
}

const ListPreview = ({title, description, count}: ListPreviewProps) => {
    const { colors } = useTheme();
    return (
        <TouchableOpacity onPress={() => router.navigate(`/(list)/${title}`)} activeOpacity={0.8} style={[styles.container, {backgroundColor: colors.card, borderColor: colors.border   }]} >
            <CustomText  fontSize="large" bold>{title}</CustomText>
            <View style={styles.wordRow}>
              <CustomIcon primary name="book"  size={12} />
              <CustomText primary fontSize="small" bold >Words: {count}</CustomText>
            </View>
            <CustomText >{description}</CustomText>
        </TouchableOpacity>
    )
}

export default ListPreview

const styles = StyleSheet.create({
    container: {
        width: "100%",
        padding:"5%",
        marginVertical:"2%",
        borderRadius:10,
        elevation:5,
        shadowColor: "gray",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        borderWidth: 1,
    },
    wordRow:{
        flexDirection:"row",
        alignItems:"center",
        justifyContent:"flex-start",
        gap:"2%"
    }
})