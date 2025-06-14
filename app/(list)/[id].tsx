import CustomText from "@/components/CustomText"
import Page from "@/components/Page"
import { useLocalSearchParams } from "expo-router"
import React from "react"

const ListScreen = () => {
    const {id} = useLocalSearchParams()
    return (
        <Page>
            <CustomText>ListScreen {id}</CustomText>
        </Page>
    )
}
export default ListScreen