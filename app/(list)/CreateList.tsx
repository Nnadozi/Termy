import CustomButton from "@/components/CustomButton"
import CustomIcon from "@/components/CustomIcon"
import CustomInput from "@/components/CustomInput"
import CustomText from "@/components/CustomText"
import Page from "@/components/Page"
import { createList } from "@/database/wordCache"
import { router } from "expo-router"
import { useState } from "react"
import { StyleSheet, View } from "react-native"

const CreateList = () => {
    const [listName, setListName] = useState("")
    const [listDescription, setListDescription] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleCreateList = async () => {
        try{
            setIsLoading(true)
            await createList(listName, listDescription)
            router.replace(`/(list)/${listName}`)
        }catch(error){
            console.error(error)
        }finally{
            setIsLoading(false)
        }
    }

    return (
        <Page style={styles.container}>
            <View style={styles.topRow}>
                <CustomIcon name="chevron-left" size={30} onPress={() => router.back()} />
                <CustomText bold textAlign="center">Create List</CustomText>
                <View/>
            </View>
            <CustomInput
                placeholder="List Name"
                value={listName}
                onChangeText={setListName}
                maxLength={50}
            />
            <CustomInput
                placeholder="List Description"
                value={listDescription}
                onChangeText={setListDescription}
                multiline={true}
                style={{height: "20%"}}
                maxLength={500}
            />
            <CustomText style={{marginTop: "3%"}} fontSize="small" bold primary>+ Add words</CustomText>
            <CustomText style={{marginBottom: "3%"}} fontSize="small" primary>Add words you already learned - or your own</CustomText>
            <CustomButton
                title="Create List" 
                onPress={handleCreateList} 
                isLoading={isLoading}
             />
        </Page>
    )
}

export default CreateList

const styles = StyleSheet.create({
    container: {
        justifyContent: "flex-start",
        alignItems: "flex-start",
    },
    topRow:{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        marginBottom: "2%"
    }
})