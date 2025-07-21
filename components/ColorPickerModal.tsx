import { useTheme } from '@react-navigation/native';
import { Dimensions, Modal, StyleSheet, View } from 'react-native';
import ColorPicker from 'react-native-wheel-color-picker';
import CustomButton from './CustomButton';
import CustomText from './CustomText';

interface ColorPickerModalProps {
    visible: boolean;
    onClose: () => void;
    onColorSelect: (color: string) => void;
    initialColor?: string;
}

const ColorPickerModal = ({ visible, onClose, onColorSelect, initialColor = '#000000' }: ColorPickerModalProps) => {
    const {colors} = useTheme();
    return (
        <Modal visible={visible} animationType='fade' transparent>
            <View style={styles.modalContainer}>
                <View style={[styles.pickerContainer,{backgroundColor: colors.card, borderColor: colors.border}]}>
                    <CustomText bold fontSize="large">Choose Your Color</CustomText>
                    <View style={styles.pickerWrapper}>
                        <ColorPicker 
                            color={initialColor}
                            onColorChange={onColorSelect}
                            thumbSize={20}
                            sliderSize={20}
                            noSnap={true}
                            row={false}
                            swatches={true}
                            swatchesLast={true}
                            useNativeDriver={true}
                        />
                    </View>
                    <CustomButton 
                        title="Done" 
                        onPress={onClose} 
                        width={Dimensions.get('window').width * 0.8}
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
    },
    pickerContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        width: '90%',
        alignItems: 'center',
        borderWidth: 1
    },
    title: {
        marginBottom: 20,
    },
    pickerWrapper: {
        width: '100%',
        height: 400,
        marginBottom: 20,
    },
});

export default ColorPickerModal; 