import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import CustomIcon from "./CustomIcon";
import CustomText from "./CustomText";
import LoadingSpinner from './LoadingSpinner';

interface ListPreviewProps {
    title: string
    description: string
    count: number
    customList: boolean
    onDelete?: () => void
    isDeleting?: boolean
}

const ListPreview = ({title, description, count, customList, onDelete, isDeleting}: ListPreviewProps) => {
    const { colors } = useTheme();
    return (
        <TouchableOpacity onPress={() => router.navigate(`/(list)/${title}`)} activeOpacity={0.8} style={[styles.container, {backgroundColor: colors.primary,shadowColor: colors.border }]} >
            <View style={{padding:15}}>
            {customList ? (
                <View style={{flexDirection:"row", alignItems:"center", justifyContent:"space-between",gap:"2%"}}>
                    <CustomText style={{width:"90%"}} numberOfLines={2} opposite  fontSize="large" bold>{title}</CustomText>
                    {isDeleting ? (
                        <LoadingSpinner 
                          size="small" 
                          color={colors.background} 
                          variant="button"
                        />
                      ) : (
                        <CustomIcon 
                          name="trash" 
                          type="feather" 
                          size={20} 
                          opposite
                          onPress={onDelete}
                        />
                      )}
                </View>
            ) : (
                <CustomText opposite fontSize="large" bold>{title}</CustomText>
            )}
            <CustomText opposite >{description}</CustomText>
            </View>
            <View style={[styles.wordRow,{backgroundColor: colors.background,borderColor: colors.primary}]}>
              <CustomIcon primary name="book"  size={12} />
              <CustomText primary  fontSize="small" bold >Words: {count}</CustomText>
            </View>
        </TouchableOpacity>
    )
}

export default ListPreview

const styles = StyleSheet.create({
    container: {
        width: "100%",
        marginVertical:5,
        borderRadius:5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 5,
    },
    wordRow:{
        flexDirection:"row",
        alignItems:"center",
        justifyContent:"flex-start",
        gap:5,
        borderWidth:1,
        borderBottomLeftRadius:5,
        borderBottomRightRadius:5,
        padding:7.5
    }
})