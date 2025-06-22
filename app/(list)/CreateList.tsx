import CustomButton from "@/components/CustomButton"
import CustomIcon from "@/components/CustomIcon"
import CustomInput from "@/components/CustomInput"
import CustomText from "@/components/CustomText"
import Page from "@/components/Page"
import WordSelectorModal from "@/components/WordSelectorModal"
import { addWordsToList, createList } from "@/database/wordCache"
import { Word } from "@/types/word"
import { router } from "expo-router"
import { useState } from "react"
import { StyleSheet, View } from "react-native"

const CreateList = () => {
    const [listName, setListName] = useState("")
    const [listDescription, setListDescription] = useState("")
    const [selectedWords, setSelectedWords] = useState<Word[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [showWordSelector, setShowWordSelector] = useState(false)

    const handleWordsSelected = (words: Word[]) => {
        setSelectedWords(prev => [...prev, ...words])
    }

    const handleCreateList = async () => {
        try{
            setIsLoading(true)
            await createList(listName, listDescription)
            
            // Add selected words to the new list
            if (selectedWords.length > 0) {
                await addWordsToList(listName, selectedWords)
            }
            
            router.replace(`/(list)/${listName}`)
        }catch(error){
            console.error(error)
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
            
            <View style={styles.addWordsSection}>
                <CustomText style={{marginTop: "3%"}} fontSize="small" bold primary>+ Add words</CustomText>
                <CustomText style={{marginBottom: "3%"}} fontSize="small" primary>
                    Add words you already learned - or your own ({selectedWords.length} selected)
                </CustomText>
                <CustomButton
                    title="Select Words"
                    onPress={() => setShowWordSelector(true)}
                    style={{marginBottom: "3%"}}
                />
                
                {/* Show selected words */}
                {selectedWords.length > 0 && (
                    <View style={styles.selectedWordsContainer}>
                        <CustomText fontSize="small" bold style={{marginBottom: 10}}>
                            Selected Words:
                        </CustomText>
                        {selectedWords.map((word, index) => (
                            <View key={word.id} style={styles.selectedWordItem}>
                                <CustomText fontSize="small" style={{flex: 1}}>
                                    {word.word} - {word.definition}
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
        marginTop: 10,
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd"
    },
    selectedWordItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginBottom: 5,
        backgroundColor: "#f5f5f5",
        borderRadius: 5
    }
})