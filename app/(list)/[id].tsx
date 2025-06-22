import CustomIcon from "@/components/CustomIcon"
import CustomInput from "@/components/CustomInput"
import CustomText from "@/components/CustomText"
import DailyWordCard from "@/components/DailyWordCard"
import Page from "@/components/Page"
import { getList } from "@/database/wordCache"
import { List } from "@/types/list"
import { router, useLocalSearchParams } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { StyleSheet, View } from "react-native"
import PagerView from "react-native-pager-view"

const ListScreen = () => {
    const {id} = useLocalSearchParams()
    const [list, setList] = useState<List | null>(null)
    const pagerRef = useRef<PagerView>(null)
    const [search, setSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(0)
    
    const fetchList = async () => {
        const list = await getList(id as string)
        if (list) {
            setList(list)
        }
    }

    useEffect(() => {
        fetchList()
    }, [id])

    const filteredWords = list?.words.filter((word) => word.word.toLowerCase().includes(search.toLowerCase()))
    
    const scrollToNext = () => {
        if (filteredWords && currentPage < filteredWords.length - 1) {
            pagerRef.current?.setPage(currentPage + 1)
        }
    }
    
    const scrollToPrevious = () => {
        if (filteredWords && currentPage > 0) {
            pagerRef.current?.setPage(currentPage - 1)
        }
    }
    
    return (
        <Page>
            <View style={styles.topRow}>
                <CustomIcon name="chevron-left"  color="black" onPress={() => router.back()}     />
                <View style={styles.topRowText}>
                    <CustomText fontSize="large" bold>{list?.name}</CustomText>
                    {list?.description && <CustomText fontSize="small" textAlign="center">{list?.description}</CustomText>}
                </View>
                {list?.name !== "Learned" && (
                    <CustomIcon name="add-to-list" type="entypo" size={24} />
                )}
                {list?.name === "Learned" && <View/>}
            </View>
           
            {filteredWords && filteredWords.length > 0 ? (
            <PagerView 
                ref={pagerRef} 
                initialPage={0} 
                orientation='vertical' 
                style={{ flex: 1, width:"100%" ,justifyContent:"center"}}
                onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
            >
                {filteredWords.map((word, index) => (
                    <DailyWordCard  
                        noText 
                        key={word.id} 
                        word={word} 
                        index={index} 
                        total={filteredWords.length} 
                        scrollToNext={scrollToNext}
                        scrollToPrevious={scrollToPrevious}
                        showScrollButtons={true}
                    />
                ))}
            </PagerView>
            ) : (
                <View style={{flex:1, justifyContent:"center", alignItems:"center"}}>
                    <CustomText textAlign="center" opacity={0.5}>
                        {search ? `No words found matching "${search}"` : 
                        list?.name === "Learned" ? "No words in this list yet - learn some!" :
                        "No words in this list yet - add some!"}
                    </CustomText>
                </View>
            )}
            {list && (
                <CustomInput placeholder="Search" value={search} onChangeText={setSearch} style={{marginVertical:"3%"}} />  
            )}
        </Page>
    )
}
export default ListScreen


const styles = StyleSheet.create({
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
    },
    topRowText: {
        alignItems: "center",
        justifyContent: "center",
    },
})