import AddWordButton from "@/components/AddWordButton"
import CustomIcon from "@/components/CustomIcon"
import CustomInput from "@/components/CustomInput"
import CustomText from "@/components/CustomText"
import DailyWordCard from "@/components/DailyWordCard"
import ErrorDisplay from "@/components/ErrorDisplay"
import LoadingSpinner from "@/components/LoadingSpinner"
import Page from "@/components/Page"
import { addWordsToList, getList } from "@/database/wordCache"
import { List } from "@/types/list"
import { Word } from "@/types/word"
import { router, useLocalSearchParams } from "expo-router"
import { useCallback, useEffect, useRef, useState } from "react"
import { StyleSheet, View } from "react-native"
import PagerView from "react-native-pager-view"

const ListScreen = () => {
    const {id} = useLocalSearchParams()
    const [list, setList] = useState<List | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [addingWords, setAddingWords] = useState(false)
    const pagerRef = useRef<PagerView>(null)
    const [search, setSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(0)
    
    const fetchList = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const list = await getList(id as string)
            if (list) {
                setList(list)
            } else {
                setError('List not found')
            }
        } catch (error) {
            console.error('Error fetching list:', error)
            setError(error instanceof Error ? error.message : 'Failed to load list')
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        fetchList()
    }, [fetchList])

    const handleWordsAdded = async (words: Word[]) => {
        setAddingWords(true)
        try {
            await addWordsToList(id as string, words)
            // Refresh the list to show new words
            await fetchList()
        } catch (error) {
            console.error('Error adding words to list:', error)
        } finally {
            setAddingWords(false)
        }
    }

    const handleWordDeleted = async (wordId: number) => {
        try {
            // Refresh the list to show updated words
            await fetchList()
        } catch (error) {
            console.error('Error refreshing list after deletion:', error)
        }
    }

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
                <CustomIcon name="chevron-left"  onPress={() => router.back()}     />
                <View style={styles.topRowText}>
                    <CustomText  textAlign="center" fontSize="large" bold>{list?.name}</CustomText>
                    {list?.description && <CustomText numberOfLines={2} fontSize="small" textAlign="center">{list?.description}</CustomText>}
                </View>
                {list?.name !== "Learned" && (
                    <AddWordButton
                        onWordsSelected={handleWordsAdded}
                        excludeListName={list?.name}
                        targetListName={list?.name}
                        title={`Add to ${list?.name}`}
                        allowCustomWords={true}
                        iconName="add-to-list"
                        iconType="entypo"
                        iconSize={24}
                        isLoading={addingWords}
                    />
                )}
                {list?.name === "Learned" && <View/>}
            </View>
           
            {loading ? (
                <LoadingSpinner text="Loading list..." />
            ) : error ? (
                <ErrorDisplay
                    title="Failed to Load List"
                    message={error}
                    onRetry={fetchList}
                />
            ) : filteredWords && filteredWords.length > 0 ? (
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
                        listName={list?.name}
                        onWordDeleted={handleWordDeleted}
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
                <CustomInput placeholder="Search" value={search} onChangeText={setSearch} style={{marginVertical:"3%"}} maxLength={50} />  
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
        width: "80%",
    },
})