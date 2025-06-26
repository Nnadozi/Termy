import CustomButton from "@/components/CustomButton"
import CustomIcon from "@/components/CustomIcon"
import CustomInput from "@/components/CustomInput"
import CustomText from "@/components/CustomText"
import ErrorDisplay from "@/components/ErrorDisplay"
import Page from "@/components/Page"
import WordSelectorModal from "@/components/WordSelectorModal"
import { addWordsToList, createList } from "@/database/wordCache"
import { Word } from "@/types/word"
import { useTheme } from "@react-navigation/native"
import { router } from "expo-router"
import { useState } from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"

const CreateList = () => {
    const [listName, setListName] = useState("")
    const [listDescription, setListDescription] = useState("")
    const [selectedWords, setSelectedWords] = useState<Word[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showWordSelector, setShowWordSelector] = useState(false)
    const { colors } = useTheme()
    const handleWordsSelected = (words: Word[]) => {
        setSelectedWords(prev => [...prev, ...words])
    }

    const handleCreateList = async () => {
        try{
            setIsLoading(true)
            setError(null)
            await createList(listName, listDescription)
            
            // Add selected words to the new list
            if (selectedWords.length > 0) {
                await addWordsToList(listName, selectedWords)
            }
            
            router.replace(`/(list)/${listName}`)
        }catch(error){
            console.error('Error creating list:', error)
            setError(error instanceof Error ? error.message : 'Failed to create list')
        }finally{
            setIsLoading(false)
        }
    }

    const removeWord = (wordId: number) => {
        setSelectedWords(prev => prev.filter(w => w.id !== wordId))
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
                maxLength={30}
            />
            <CustomInput
                placeholder="List Description"
                value={listDescription}
                onChangeText={setListDescription}
                multiline={true}
                style={{height: "20%"}}
                maxLength={85}
            />
            
            <View style={styles.addWordsSection}>
                <TouchableOpacity onPress={() => setShowWordSelector(true)}>
                    <CustomText style={{marginTop: "3%"}} fontSize="small" bold primary>+ Add words ({selectedWords.length} selected)</CustomText>
                    <CustomText style={{marginBottom: "2%"}} fontSize="small" primary>
                        Add words you already learned - or create your own!
                    </CustomText>
                </TouchableOpacity>
          
                {/* Show selected words */}
                {selectedWords.length > 0 && (
                    <View style={[styles.selectedWordsContainer,{borderColor: colors.border}]}>
                        <CustomText fontSize="small" bold style={{marginBottom: 10}}>
                            Selected Words:
                        </CustomText>
                        {selectedWords.map((word, index) => (
                            <View key={word.id} style={[styles.selectedWordItem,{backgroundColor: colors.primary}]}>
                                <CustomText fontSize="small" style={{flex: 1}}>
                                    {word.word}
                                </CustomText>
                                <CustomIcon
                                    name="close"
                                    size={16}
                                    onPress={() => removeWord(word.id)}
                                />
                            </View>
                        ))}
                    </View>
                )}
            </View>
            
            <CustomButton
                title="Create List" 
                onPress={handleCreateList} 
                isLoading={isLoading}
                disabled={!listName.trim()}
             />
             
             {error && (
                 <ErrorDisplay
                     title="Failed to Create List"
                     message={error}
                     onRetry={handleCreateList}
                     style={{ marginTop: 20 }}
                 />
             )}
             
             <WordSelectorModal
                visible={showWordSelector}
                onClose={() => setShowWordSelector(false)}
                onWordsSelected={handleWordsSelected}
                targetListName={listName}
                title="Add Words to List"
                allowCustomWords={true}
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
    },
    addWordsSection: {
        width: "100%",
        marginBottom: "3%"
    },
    selectedWordsContainer: {
        marginTop: "2%",
        padding: "3%",
        borderRadius: 10,
        borderWidth: 1,
    },
    selectedWordItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding:"3%",
        marginBottom: "2%",
        borderRadius: 5
    }
})