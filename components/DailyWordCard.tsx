import { addWordsToList, getAllLists, removeWordFromList } from '@/database/wordCache'
import { List } from '@/types/list'
import { Word } from '@/types/word'
import { useTheme } from '@react-navigation/native'
import { CheckBox } from '@rneui/base'
import * as Speech from 'expo-speech'
import { useState } from 'react'
import { ActivityIndicator, Alert, Modal, ScrollView, Share, StyleSheet, TouchableOpacity, View } from 'react-native'
import CustomButton from './CustomButton'
import CustomIcon from './CustomIcon'
import CustomText from './CustomText'

interface DailyWordCardProps {
  word: Word
  index: number
  total: number
  scrollToNext: () => void
  scrollToPrevious?: () => void
  customText?: string
  noText?: boolean
  noCounter?: boolean
  height?: any
  showScrollButtons?: boolean
  listName?: string
  onWordDeleted?: (wordId: number) => void
}

const DailyWordCard = ({ word, index, total, scrollToNext, scrollToPrevious, customText, noText, noCounter, height, showScrollButtons, listName, onWordDeleted }: DailyWordCardProps) => {
    const { colors } = useTheme();
    const [showListSelector, setShowListSelector] = useState(false);
    const [availableLists, setAvailableLists] = useState<List[]>([]);
    const [selectedLists, setSelectedLists] = useState<string[]>([]);
    const [loadingLists, setLoadingLists] = useState(false);
    
    const pronounceWord = () => {
      Speech.speak(word.word)
    }
    const shareWord = () => {
      Share.share({
        message: `${word.word} - ${word.definition} - ${word.example_usage}`,
      })
    }

    const loadAvailableLists = async () => {
      if (loadingLists) return; // Prevent multiple simultaneous loads
      
      setLoadingLists(true);
      try {
        const allLists = await getAllLists();
        // Only show custom lists (not Learned) that don't already contain this word
        const customLists = allLists.filter(list => 
          list.name !== 'Learned' && 
          !list.words.some((w: Word) => w.word.toLowerCase() === word.word.toLowerCase())
        );
        setAvailableLists(customLists);
        setSelectedLists([]); // Reset selections when opening modal
      } catch (error) {
        console.error('Error loading available lists:', error);
        setAvailableLists([]); // Set empty array on error to prevent undefined state
      } finally {
        setLoadingLists(false);
      }
    };

    const toggleListSelection = (listName: string) => {
      setSelectedLists(prev => {
        if (prev.includes(listName)) {
          return prev.filter(name => name !== listName);
        } else {
          return [...prev, listName];
        }
      });
    };

    const handleAddToSelectedLists = async () => {
      if (selectedLists.length === 0) {
        Alert.alert('No Lists Selected', 'Please select at least one list to add the word to.');
        return;
      }

      try {
        // Add word to all selected lists
        for (const listName of selectedLists) {
          await addWordsToList(listName, [word]);
        }
        
        setShowListSelector(false);
        setSelectedLists([]);
        
        // Show success message
        const listNames = selectedLists.join(', ');
        Alert.alert(
          'Success', 
          `"${word.word}" has been added to ${selectedLists.length} list${selectedLists.length > 1 ? 's' : ''}: ${listNames}`,
          [{ text: 'OK' }]
        );
      } catch (error) {
        console.error('Error adding word to lists:', error);
        Alert.alert('Error', 'Failed to add word to some lists');
      }
    };

    const handleAddToListPress = () => {
      setShowListSelector(true);
      loadAvailableLists();
    };

    const handleDeleteWord = async () => {
      if (!listName || listName === 'Learned') {
        return; // Can't delete from Learned list
      }

      Alert.alert(
        'Delete Word',
        `Are you sure you want to delete "${word.word}" from "${listName}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: async () => {
              try {
                await removeWordFromList(listName, word);
                // Call the callback to update the parent component
                if (onWordDeleted) {
                  onWordDeleted(word.id);
                }
              } catch (error) {
                console.error('Error deleting word:', error);
                Alert.alert('Error', 'Failed to delete word from list');
              }
            }
          }
        ]
      );
    };

    const handleCloseModal = () => {
      setShowListSelector(false);
      setSelectedLists([]);
      setLoadingLists(false);
    };
  
    return (
      <View style={[styles.pageContainer, { backgroundColor: colors.background }]}>
        {showScrollButtons && index > 0 && (
        <View style={styles.scrollButton}>
          <CustomIcon 
            name="chevron-up" 
            type="entypo"
            color={colors.primary}
            onPress={scrollToPrevious}
          />
        </View>
      )}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border ,shadowColor: colors.border, height: height ?? "75%"}]}>
          <CustomText bold fontSize="XL">
            {word.word}
          </CustomText>
          <CustomText fontSize='small' textAlign='center'>
            {word.part_of_speech ? `${word.part_of_speech} · ${word.category}` : word.category}
          </CustomText>
          <CustomText textAlign='center'>
            {word.definition}
          </CustomText>
          <CustomText fontSize='small' italic textAlign='center'>
           {word.example_usage}
          </CustomText>
          <View style={styles.buttonRow}>
            <CustomIcon onPress={pronounceWord} size={20} name='volume-up' type='font-awesome' color={colors.border} />
            <CustomIcon onPress={shareWord} size={20} name='share' type='feather' color={colors.border} />
            <CustomIcon 
              onPress={handleAddToListPress} 
              size={20} 
              name='add-to-list' 
              type='entypo' 
              color={colors.border} 
            />
            {/* Show delete button only for custom lists */}
            {listName && listName !== 'Learned' && (
              <CustomIcon 
                onPress={handleDeleteWord} 
                size={20} 
                name='trash' 
                type='feather' 
                color='#FF4444' 
              />
            )}
          </View>
          <CustomText style={{marginTop:"5%"}} bold primary onPress={scrollToNext}>{`${ noText ? "" : customText || "Got it!"} ${noCounter ? "" : `(${index + 1} / ${total})`}`}</CustomText>
        </View>
        {showScrollButtons && index < total - 1 && (
          <View style={styles.scrollButton}>
            <CustomIcon 
              name="chevron-down" 
              type="entypo"
              color={colors.primary}
              onPress={scrollToNext}
            />
          </View>
        )}

        {/* Multi-List Selector Modal */}
        <Modal
          visible={showListSelector}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleCloseModal}
        >
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <CustomText fontSize="large" bold>Add to Lists</CustomText>
            <CustomText style={{marginBottom:"2%"}}>
              Select lists to add "{word.word}"
            </CustomText>
            <CustomText fontSize="small" style={{marginBottom:"5%", opacity: 0.7}}>
              {selectedLists.length} list{selectedLists.length !== 1 ? 's' : ''} selected
            </CustomText>

            <ScrollView style={styles.modalContent}>
              {loadingLists ? (
                <View style={styles.emptyState}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <CustomText textAlign="center" opacity={0.7} style={{ marginTop: 10 }}>
                    Loading lists...
                  </CustomText>
                </View>
              ) : availableLists.length > 0 ? (
                availableLists.map((list) => (
                  <TouchableOpacity
                    key={list.name}
                    style={[
                      styles.listItem, 
                      { 
                        backgroundColor: selectedLists.includes(list.name) ? colors.primary : colors.card, 
                        borderColor: colors.border 
                      }
                    ]}
                    onPress={() => toggleListSelection(list.name)}
                  >
                    <View style={styles.listItemContent}> 
                      <CustomText 
                        bold 
                        color={selectedLists.includes(list.name) ? colors.background : colors.text}
                      >
                        {list.name}
                      </CustomText>
                      <CustomText 
                        fontSize="small" 
                        style={{ opacity: 0.7 }}
                        color={selectedLists.includes(list.name) ? colors.background : colors.text}
                      >
                        {list.description}
                      </CustomText>
                      <CustomText 
                        fontSize="small" 
                        style={{ opacity: 0.5 }}
                        color={selectedLists.includes(list.name) ? colors.background : colors.text}
                      >
                        {list.words.length} words
                      </CustomText>
                    </View>
                    <CheckBox
                      checked={selectedLists.includes(list.name)}
                      onPress={() => toggleListSelection(list.name)}
                      containerStyle={styles.checkbox}
                      checkedColor={colors.background}
                      uncheckedColor={colors.border}
                    />
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <CustomText textAlign="center" opacity={0.5}>
                    No available lists to add this word to.
                  </CustomText>
                  <CustomText textAlign="center" fontSize="small" opacity={0.5}>
                    Create a new list or the word is already in all your custom lists.
                  </CustomText>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <CustomButton
                title={`Add to ${selectedLists.length} List${selectedLists.length !== 1 ? 's' : ''}`}
                onPress={handleAddToSelectedLists}
                disabled={selectedLists.length === 0}
                style={{ marginBottom: "3%" }}
              />
              <CustomButton
                title="Cancel"
                onPress={handleCloseModal}
                style={{ width: '100%' }}
              />
            </View>
          </View>
        </Modal>
      </View>
    );
  };
  
export default DailyWordCard

const styles = StyleSheet.create({
    pageContainer: {
      flex: 1,
      justifyContent: 'center', 
      alignItems: 'center',     
    },
    card: {
      width: '100%',
      height: '90%',
      justifyContent:"center",
      alignItems:"center",
      padding:'5%',
      borderWidth: 1,
      borderRadius:20,
      elevation:5,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 5,
      gap:"2%"
    },
    buttonRow:{
      flexDirection:"row",
      alignItems:"center",
      justifyContent:"space-between",     
      gap:"3%",
    },
    scrollButton: {
      marginVertical:"3%",
    },
    modalContainer: {
      flex: 1,
      padding: "5%",
    },
    modalContent: {
      flex: 1,
    },
    listItem: {
      padding: "3%",
      borderWidth: 1,
      borderColor: 'gray',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom:"3%",
      borderRadius: 8,
    },
    listItemContent: {
      flex: 1,
    },
    checkbox: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      padding: 0,
      margin: 0,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalFooter: {
      marginTop: "5%",
    },
  })