import { getAllLists } from '@/database/wordCache';
import { Word } from '@/types/word';
import { useTheme } from '@react-navigation/native';
import { CheckBox } from '@rneui/base';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import CustomButton from './CustomButton';
import CustomInput from './CustomInput';
import CustomText from './CustomText';

interface WordSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onWordsSelected: (words: Word[]) => void;
  excludeListName?: string; // Name of list to exclude from sources
  targetListName?: string; // Name of list we're adding to (to exclude existing words)
  title?: string;
  allowCustomWords?: boolean;
}

const WordSelectorModal: React.FC<WordSelectorModalProps> = ({
  visible,
  onClose,
  onWordsSelected,
  excludeListName,
  targetListName,
  title = "Add Words",
  allowCustomWords = true
}) => {
  const { colors } = useTheme();
  const [selectedWords, setSelectedWords] = useState<Word[]>([]);
  const [availableWords, setAvailableWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'learned' | 'lists' | 'custom'>('learned');
  const [customWord, setCustomWord] = useState('');
  const [customDefinition, setCustomDefinition] = useState('');
  const [customExample, setCustomExample] = useState('');

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
      part_of_speech: '',
      category: 'Custom'
    };

    setSelectedWords(prev => [...prev, newWord]);
    setCustomWord('');
    setCustomDefinition('');
    setCustomExample('');
    
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
    onClose();
  };

  const renderLearnedTab = () => (
    <ScrollView style={styles.tabContent}>
      <CustomText fontSize="small" style={{ marginBottom: 10, opacity: 0.7 }}>
        Select words from your learned vocabulary
      </CustomText>
      
      {/* Show selected words first */}
      {selectedWords.length > 0 && (
        <View style={styles.selectedWordsSection}>
          <CustomText fontSize="small" bold style={{ marginBottom: 10 }}>
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
                <CustomText bold style={{ color: colors.background }}>
                  {word.word}
                </CustomText>
                <CustomText fontSize="small" style={{ opacity: 0.8, color: colors.background }}>
                  {word.definition}
                </CustomText>
                <CustomText fontSize="small" style={{ opacity: 0.6, color: colors.background }}>
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
      
      {/* Show available words */}
      {availableWords
        .filter(word => word.category !== 'Custom' && !selectedWords.some(w => w.id === word.id))
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
              <CustomText bold>{word.word}</CustomText>
              <CustomText fontSize="small" style={{ opacity: 0.7 }}>
                {word.definition}
              </CustomText>
              <CustomText fontSize="small" style={{ opacity: 0.5 }}>
                {word.category}
              </CustomText>
            </View>
            <CheckBox
              checked={selectedWords.some(w => w.id === word.id)}
              onPress={() => toggleWordSelection(word)}
              containerStyle={styles.checkbox}
            />
          </TouchableOpacity>
        ))}
    </ScrollView>
  );

  const renderCustomTab = () => (
    <View style={styles.tabContent}>
      <CustomText fontSize="small" style={{ marginBottom: 10, opacity: 0.7 }}>
        Add your own custom words
      </CustomText>
      
      {/* Show success message if words were added */}
      {selectedWords.filter(w => w.category === 'Custom').length > 0 && (
        <View style={[styles.successMessage, { backgroundColor: colors.primary }]}>
          <CustomText fontSize="small" style={{ color: colors.background }}>
            ✓ {selectedWords.filter(w => w.category === 'Custom').length} custom word{selectedWords.filter(w => w.category === 'Custom').length !== 1 ? 's' : ''} added
          </CustomText>
        </View>
      )}
      
      <CustomInput
        placeholder="Enter word"
        value={customWord}
        onChangeText={setCustomWord}
        style={styles.input}
      />
      <CustomInput
        placeholder="Enter definition"
        value={customDefinition}
        onChangeText={setCustomDefinition}
        multiline
        style={{ marginBottom: 15, height: 80 }}
      />
      <CustomInput
        placeholder="Enter example usage (optional)"
        value={customExample}
        onChangeText={setCustomExample}
        multiline
        style={{ marginBottom: 15, height: 80 }}
      />
      <CustomButton
        title="Add Custom Word"
        onPress={addCustomWord}
        style={styles.addButton}
      />
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <CustomText fontSize="large" bold>{title}</CustomText>
          <CustomText fontSize="small" style={{ opacity: 0.7 }}>
            {selectedWords.length} word{selectedWords.length !== 1 ? 's' : ''} selected
          </CustomText>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'learned' && { backgroundColor: colors.primary }
            ]}
            onPress={() => setActiveTab('learned')}
          >
            <CustomText 
              style={{
                fontSize: 16,
                fontFamily: 'DMSans-Bold',
                color: activeTab === 'learned' ? colors.background : colors.text
              }}
            >
              Learned
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
              <CustomText 
                style={{
                  fontSize: 16,
                  fontFamily: 'DMSans-Bold',
                  color: activeTab === 'custom' ? colors.background : colors.text
                }}
              >
                Custom
              </CustomText>
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        {activeTab === 'learned' && renderLearnedTab()}
        {activeTab === 'custom' && renderCustomTab()}

        {/* Footer */}
        <View style={styles.footer}>
          <CustomButton
            title="Cancel"
            onPress={handleCancel}
            style={styles.footerButton}
          />
          <CustomButton
            title={`Add ${selectedWords.length} Word${selectedWords.length !== 1 ? 's' : ''}`}
            onPress={handleConfirm}
            disabled={selectedWords.length === 0}
            style={styles.footerButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
  },
  tabContent: {
    flex: 1,
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
  input: {
    marginBottom: 15,
  },
  addButton: {
    marginTop: 10,
  },
  footer: {
    justifyContent: 'space-between',
    marginTop: 20,
  },
  footerButton: {
    width: '48%',
  },
  selectedWordsSection: {
    marginBottom: 20,
  },
  successMessage: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
});

export default WordSelectorModal; 