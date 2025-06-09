import { useThemeStore } from '@/stores/themeStore';
import { useTheme } from '@react-navigation/native';
import { CheckBox } from '@rneui/base';
import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

interface AppearanceModalProps {
    visible: boolean;
    onRequestClose: () => void;
}

const AppearanceModal = ({ visible, onRequestClose }: AppearanceModalProps) => {
    const { mode, setThemeMode, isDark } = useThemeStore();
    const { colors } = useTheme();
    
    return (
        <Modal animationType='fade' transparent visible={visible} onRequestClose={onRequestClose}>
            <Pressable onPress={onRequestClose} style={styles.backdrop}>
                <View style={[styles.modalContent, { backgroundColor: colors.card }]}>              
                    <CheckBox
                        title='System'
                        checked={mode === 'system'}
                        onPress={() => {
                            setThemeMode('system')
                            onRequestClose()
                        }}
                        checkedIcon="dot-circle-o"
                        uncheckedIcon="circle-o"
                        checkedColor={colors.primary}
                        containerStyle={{backgroundColor:colors.card}}
                        textStyle={{color:colors.text, fontFamily:'DMSans-Regular'}}
                    />             
                    <CheckBox
                        title='Light'
                        checked={mode === 'light'}
                        onPress={() => {
                            setThemeMode('light')
                            onRequestClose()
                        }}
                        checkedIcon="dot-circle-o"
                        uncheckedIcon="circle-o"
                        checkedColor={colors.primary}
                        containerStyle={{backgroundColor:colors.card}}
                        textStyle={{color:colors.text, fontFamily:'DMSans-Regular'}}
                    />              
                    <CheckBox
                        title='Dark'
                        checked={mode === 'dark'}
                        onPress={() => {
                            setThemeMode('dark')
                            onRequestClose()
                        }}
                        checkedIcon="dot-circle-o"
                        uncheckedIcon="circle-o"
                        checkedColor={colors.primary}
                        containerStyle={{backgroundColor:colors.card}}
                        textStyle={{color:colors.text, fontFamily:'DMSans-Regular'}}
                    />
                </View>
            </Pressable>
        </Modal>
    )
}

export default AppearanceModal

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