import { useThemeStore } from '@/stores/themeStore';
import { useTheme } from '@react-navigation/native';
import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import CustomText from './CustomText';

interface LanguageModalProps {
    visible: boolean;
    onRequestClose: () => void;
}

const LanguageModal = ({ visible, onRequestClose }: LanguageModalProps) => {
  const { mode, setThemeMode, isDark } = useThemeStore();
  const { colors } = useTheme();
  return (
    <Modal animationType='fade' transparent visible={visible} onRequestClose={onRequestClose}>
        <Pressable onPress={onRequestClose} style={styles.backdrop}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                <CustomText>Language</CustomText>
            </View>
        </Pressable>
    </Modal>
  )
}

export default LanguageModal

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        borderRadius: 10,
        padding:"2%",
        width:"80%",
    }
})