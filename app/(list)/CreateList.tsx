import CustomText from "@/components/CustomText"
import Page from "@/components/Page"
import { Link } from "expo-router"
import React from "react"

const CreateList = () => {
    return (
        <Page>
            <CustomText>Create List</CustomText>
            <Link href={{
                pathname: "/(list)/[id]",
                params: { id: "test-list" }
            }}>Go</Link>
        </Page>
    )
}

export default CreateList