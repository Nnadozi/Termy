import { getAllLists } from '@/database/wordCache';
import { Word } from '@/types/word';
import { useTheme } from '@react-navigation/native';
import { CheckBox } from '@rneui/base';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import CustomButton from './CustomButton';
import CustomInput from './CustomInput';
import CustomText from './CustomText';
import LoadingSpinner from './LoadingSpinner';

interface WordSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onWordsSelected: (words: Word[]) => void;
  excludeListName?: string; // Name of list to exclude from sources
  targetListName?: string; // Name of list we're adding to (to exclude existing words)
  title?: string;
  allowCustomWords?: boolean;
  allowMultiList?: boolean; // New prop to enable multi-list selection
  onListsSelected?: (listNames: string[]) => void; // New callback for multi-list selection
}

const WordSelectorModal: React.FC<WordSelectorModalProps> = ({
  visible,
  onClose,
  onWordsSelected,
  excludeListName,
  targetListName,
  title = "Add Words",
  allowCustomWords = true,
  allowMultiList = false,
  onListsSelected
}) => {
  const { colors } = useTheme();
  const [selectedWords, setSelectedWords] = useState<Word[]>([]);
  const [availableWords, setAvailableWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'learned' | 'lists' | 'custom'>('learned');
  const [customWord, setCustomWord] = useState('');
  const [customDefinition, setCustomDefinition] = useState('');
  const [customExample, setCustomExample] = useState('');
  const [customPartOfSpeech, setCustomPartOfSpeech] = useState('');

  // Load available words when modal opens
  useEffect(() => {
    if (visible) {
      loadAvailableWords();
    }
  }, [visible, excludeListName, targetListName]);

  const loadAvailableWords = async () => {
    setLoading(true);
    try {
      const allLists = await getAllLists();
      let words: Word[] = [];

      // Add words from Learned list (only if not adding to Learned)
      if (targetListName !== 'Learned') {
        const learnedList = allLists.find(list => list.name === 'Learned');
        if (learnedList) {
          words.push(...learnedList.words);
        }
      }

      // Add words from other custom lists (excluding current list and target list)
      const otherLists = allLists.filter(list => 
        list.name !== 'Learned' && 
        list.name !== excludeListName &&
        list.name !== targetListName
      );
      otherLists.forEach(list => {
        words.push(...list.words);
      });

      // Remove duplicates based on word text
      const uniqueWords = words.filter((word, index, self) => 
        index === self.findIndex(w => w.word.toLowerCase() === word.word.toLowerCase())
      );

      setAvailableWords(uniqueWords);
    } catch (error) {
      console.error('Error loading available words:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWordSelection = (word: Word) => {
    setSelectedWords(prev => {
      const isSelected = prev.some(w => w.id === word.id);
      if (isSelected) {
        return prev.filter(w => w.id !== word.id);
      } else {
        return [...prev, word];
      }
    });
  };

  const addCustomWord = () => {
    if (!customWord.trim() || !customDefinition.trim()) {
      Alert.alert('Error', 'Please enter both word and definition');
      return;
    }

    const newWord: Word = {
      id: Date.now(), // Temporary ID for custom words
      word: customWord.trim(),
      definition: customDefinition.trim(),
      example_usage: customExample.trim() || '',
      part_of_speech: customPartOfSpeech.trim() || '',
      category: 'custom'
    };

    setSelectedWords(prev => [...prev, newWord]);
    setCustomWord('');
    setCustomDefinition('');
    setCustomExample('');
    setCustomPartOfSpeech('');
    
    // Switch to learned tab to show the selected word
    setActiveTab('learned');
  };

  const handleConfirm = () => {
    onWordsSelected(selectedWords);
    setSelectedWords([]);
    onClose();
  };

  const handleCancel = () => {
    setSelectedWords([]);
    setCustomWord('');
    setCustomDefinition('');
    setCustomExample('');
    setCustomPartOfSpeech('');
    onClose();
  };

  const renderLearnedTab = () => (
    <ScrollView style={styles.tabContent}>
      <CustomText fontSize="small" style={{ marginBottom:"2%"}}>
        Select words from your vocabulary
      </CustomText>
      
      {/* Show selected words first */}
      {selectedWords.length > 0 && (
        <View style={styles.selectedWordsSection}>
          <CustomText fontSize="small" bold style={{ marginBottom: "2%" }}>
            Selected Words ({selectedWords.length}):
          </CustomText>
          {selectedWords.map((word) => (
            <TouchableOpacity
              key={word.id}
              style={[
                styles.wordItem,
                { 
                  backgroundColor: colors.primary,
                  borderColor: colors.primary 
                }
              ]}
              onPress={() => toggleWordSelection(word)}
            >
              <View style={styles.wordItemContent}>
                <CustomText bold style={{ color: colors.background }} numberOfLines={1}>
                  {word.word}
                </CustomText>
                <CustomText fontSize="small" style={{ color: colors.background }} numberOfLines={2}>
                  {word.definition}
                </CustomText>
                <CustomText fontSize="small" style={{ color: colors.background }}>
                  {word.category}
                </CustomText>
              </View>
              <CheckBox
                checked={true}
                onPress={() => toggleWordSelection(word)}
                containerStyle={styles.checkbox}
                checkedColor={colors.background}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {/* Show loading state */}
      {loading ? (
        <LoadingSpinner 
          text="Loading words..."
          variant="inline"
        />
      ) : availableWords.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <CustomText fontSize="small" opacity={0.7}>No words available</CustomText>
          <CustomText fontSize="small" opacity={0.5} style={{ marginTop: 5 }}>
            Add some words to your lists first
          </CustomText>
        </View>
      ) : (
        /* Show available words */
        availableWords
          .filter(word => !selectedWords.some(w => w.id === word.id))
          .map(word => (
            <TouchableOpacity
              key={word.id}
              style={[
                styles.wordItem,
                { 
                  backgroundColor: selectedWords.some(w => w.id === word.id) 
                    ? colors.primary 
                    : colors.card,
                  borderColor: colors.border 
                }
              ]}
              onPress={() => toggleWordSelection(word)}
            >
              <View style={styles.wordItemContent}>
                <CustomText bold color = {selectedWords.some(w => w.id === word.id) ? colors.background : colors.text } numberOfLines={1}>
                  {word.word}
                </CustomText>
                <CustomText fontSize="small" color = {selectedWords.some(w => w.id === word.id) ? colors.background : colors.text } numberOfLines={2}>
                  {word.definition}
                </CustomText>
                <CustomText fontSize="small" color = {selectedWords.some(w => w.id === word.id) ? colors.background : colors.primary }>
                   {word.category}
                </CustomText>
              </View>
              <CheckBox
                checked={selectedWords.some(w => w.id === word.id)}
                onPress={() => toggleWordSelection(word)}
                containerStyle={styles.checkbox}
              />
            </TouchableOpacity>
          ))
      )}
    </ScrollView>
  );

  const renderCustomTab = () => (
    <View style={styles.tabContent}>
      <CustomText fontSize="small" style={{ marginBottom:"2%"}}>
        Add your own custom words
      </CustomText>
      
      {/* Show success message if words were added */}
      {selectedWords.filter(w => w.category === 'custom').length > 0 && (
        <View style={[styles.successMessage, { backgroundColor: colors.primary }]}>
          <CustomText fontSize="small">
            ✓ {selectedWords.filter(w => w.category === 'custom').length} custom word{selectedWords.filter(w => w.category === 'custom').length !== 1 ? 's' : ''} added
          </CustomText>
        </View>
      )}
      
      <CustomInput
        placeholder="Enter word *"
        value={customWord}
        onChangeText={setCustomWord}
        style={{marginBottom:"2%"}}
        maxLength={30}
      />
      <CustomInput
        placeholder="Enter definition *"
        value={customDefinition}
        onChangeText={setCustomDefinition}
        multiline
        numberOfLines={3}
        style={{marginBottom:"2%"}}
        maxLength={200}
      />
      <CustomInput
        placeholder="Enter part of speech (optional)"
        value={customPartOfSpeech}
        onChangeText={setCustomPartOfSpeech}
        style={{marginBottom:"2%"}}
        maxLength={20}
      />
      <CustomInput
        placeholder="Enter example usage *"
        value={customExample}
        onChangeText={setCustomExample}
        multiline
        numberOfLines={3}
        style={{marginBottom:"2%"}}
        maxLength={300}
      />
      <CustomButton
        title="Add Custom Word"
        onPress={addCustomWord}
        style={styles.addButton}
        disabled={!customWord.trim() || !customDefinition.trim() || !customExample.trim()}
      />
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView 
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flex: 1, padding:"5%", backgroundColor: colors.background }}>
            {/* Header */}
            <View style={{alignItems: 'center', marginBottom: "5%"}}>
              <CustomText fontSize="large" bold>{title}</CustomText>
              <CustomText fontSize="small" opacity={0.7}>
                {selectedWords.length} word{selectedWords.length !== 1 ? 's' : ''} selected
              </CustomText>
            </View>

            {/* Tabs */}
            <View style={[styles.tabs,{borderColor:colors.primary,borderWidth:1}]}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'learned' && { backgroundColor: colors.primary }
                ]}
                onPress={() => setActiveTab('learned')}
              >
                <CustomText color={activeTab === 'learned' ? colors.background : colors.text}>
                  Existing Words
                </CustomText>
              </TouchableOpacity>
              {allowCustomWords && (
                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeTab === 'custom' && { backgroundColor: colors.primary }
                  ]}
                  onPress={() => setActiveTab('custom')}
                >
                  <CustomText color={activeTab === 'custom' ? colors.background : colors.text}>
                    Custom
                  </CustomText>
                </TouchableOpacity>
              )}
            </View>

            {/* Content */}
            {activeTab === 'learned' && renderLearnedTab()}
            {activeTab === 'custom' && renderCustomTab()}

            {/* Footer */}
            <View style={{ marginTop: 'auto', paddingTop: 20 }}>
              <CustomButton
                title={`Add ${selectedWords.length} Word${selectedWords.length !== 1 ? 's' : ''}`}
                onPress={handleConfirm}
                disabled={selectedWords.length === 0}
              />
              <CustomButton
                title="Cancel"
                onPress={handleCancel}
                style={{marginTop:"3%"}}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    marginBottom:"3%",
    borderRadius: 10,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    padding:"3%",
    alignItems: 'center',
  },
  wordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  wordItemContent: {
    flex: 1,
  },
  checkbox: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0,
  },
  addButton: {
    marginTop: 10,
  },
  selectedWordsSection: {
    marginBottom: 20,
  },
  successMessage: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  tabContent: {
    flex: 1,
  },
});

export default WordSelectorModal; 