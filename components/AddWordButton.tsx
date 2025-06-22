import { Word } from '@/types/word';
import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import CustomIcon from './CustomIcon';
import WordSelectorModal from './WordSelectorModal';

interface AddWordButtonProps {
  onWordsSelected: (words: Word[]) => void;
  excludeListName?: string;
  targetListName?: string;
  title?: string;
  allowCustomWords?: boolean;
  iconName?: string;
  iconType?: "entypo" | "antdesign" | "evilicon" | "feather" | "font-awesome" | "font-awesome-5" | "fontisto" | "foundation" | "ionicon" | "material" | "material-community" | "octicon" | "simple-line-icon" | "zocial";
  iconSize?: number;
  iconColor?: string;
}

const AddWordButton: React.FC<AddWordButtonProps> = ({
  onWordsSelected,
  excludeListName,
  targetListName,
  title = "Add Words",
  allowCustomWords = true,
  iconName = "add-to-list",
  iconType = "entypo",
  iconSize = 24,
  iconColor
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleWordsSelected = (words: Word[]) => {
    onWordsSelected(words);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <CustomIcon
          name={iconName}
          type={iconType}
          size={iconSize}
          color={iconColor}
        />
      </TouchableOpacity>
      
      <WordSelectorModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onWordsSelected={handleWordsSelected}
        excludeListName={excludeListName}
        targetListName={targetListName}
        title={title}
        allowCustomWords={allowCustomWords}
      />
    </>
  );
};

export default AddWordButton; 