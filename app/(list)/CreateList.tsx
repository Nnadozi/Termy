import CustomButton from "@/components/CustomButton"
import CustomIcon from "@/components/CustomIcon"
import CustomInput from "@/components/CustomInput"
import CustomText from "@/components/CustomText"
import ErrorDisplay from "@/components/ErrorDisplay"
import Page from "@/components/Page"
import WordSelectorModal from "@/components/WordSelectorModal"
import { addWordsToList, createList, getAllLists } from "@/database/wordCache"
import useUserStore from "@/stores/userStore"
import { Word } from "@/types/word"
import { useTheme } from "@react-navigation/native"
import { router } from "expo-router"
import { useEffect, useState } from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import Purchases from 'react-native-purchases'
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui'

const CreateList = () => {
    const [listName, setListName] = useState("")
    const [listDescription, setListDescription] = useState("")
    const [selectedWords, setSelectedWords] = useState<Word[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showWordSelector, setShowWordSelector] = useState(false)
    const [userLists, setUserLists] = useState<any[]>([])
    const [hasActiveSubscription, setHasActiveSubscription] = useState(false)
    const { colors } = useTheme()
    const { isPremium, setPremium } = useUserStore()

     // Check user's current lists and subscription status on component mount
    useEffect(() => {
        const checkUserData = async () => {
            try {
                const lists = await getAllLists()
                setUserLists(lists)
                
                // Check actual subscription status from RevenueCat
                const customerInfo = await Purchases.getCustomerInfo()
                const premiumEntitlement = customerInfo.entitlements.active["premium"]
                const isActuallyPremium = typeof premiumEntitlement !== "undefined"
                
                setHasActiveSubscription(isActuallyPremium)
                
                // Update user store if there's a mismatch
                if (isActuallyPremium !== isPremium) {
                    setPremium(isActuallyPremium)
                }
            } catch (error) {
                console.error('Error fetching user data:', error)
            }
        }
        checkUserData()
    }, [])

    const handleWordsSelected = (words: Word[]) => {
        setSelectedWords(prev => [...prev, ...words])
    }

    const handleCreateList = async () => {
        // Check if user has reached the limit (2 custom lists for non-premium users)
        const customListsCount = userLists.filter(list => list.name !== 'Learned').length
        
        // Use actual subscription status instead of user store
        if (!hasActiveSubscription && customListsCount >= 2) {
            const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();
            switch (paywallResult) {
                case PAYWALL_RESULT.NOT_PRESENTED:
                case PAYWALL_RESULT.ERROR:
                case PAYWALL_RESULT.CANCELLED:
                    return false;
                case PAYWALL_RESULT.PURCHASED:
                case PAYWALL_RESULT.RESTORED:
                    // Update premium status after successful purchase
                    setHasActiveSubscription(true);
                    setPremium(true);
                    break;
                default:
                    return false;
            }
        }

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

    const getButtonTitle = () => {
        const customListsCount = userLists.filter(list => list.name !== 'Learned').length
        
        if (!hasActiveSubscription && customListsCount >= 2) {
            return "Upgrade to Create"
        }
        return "Create List"
    }

    const isButtonDisabled = () => {
        return !listName.trim()
    }

    const getLimitWarningText = () => {
        const customListsCount = userLists.filter(list => list.name !== 'Learned').length
        
        if (!hasActiveSubscription && customListsCount >= 2) {
            if (customListsCount > 2) {
                return `You have ${customListsCount} custom lists. Your subscription has expired. Upgrade to Premium to create more lists, or delete some existing lists.`
            } else {
                return `${customListsCount}/2 custom lists created. Upgrade to Premium for unlimited lists.`
            }
        }
        return null
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

            {/* Show list count for non-premium users */}
            {getLimitWarningText() && (
                <View style={[styles.limitWarning, { backgroundColor: colors.card }]}>
                    <CustomText fontSize="small" color="gray" textAlign="center">
                        {getLimitWarningText()}
                    </CustomText>
                </View>
            )}

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
                title={getButtonTitle()}
                onPress={handleCreateList} 
                isLoading={isLoading}
                disabled={isButtonDisabled()}
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
    limitWarning: {
        width: "100%",
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: "center",
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