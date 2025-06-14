import { useTheme } from "@react-navigation/native"
import { Modal, Pressable, StyleSheet, View } from "react-native"
import CustomButton from "./CustomButton"
import CustomText from "./CustomText"

interface NotificationsModalProps {
    visible: boolean
    onRequestClose: () => void
}

const NotificationsModal = ({visible, onRequestClose}: NotificationsModalProps) => {
    const { colors } = useTheme();
    return (
        <Modal animationType='fade' transparent visible={visible} onRequestClose={onRequestClose}>
            <Pressable onPress={onRequestClose} style={styles.backdrop}>    
                <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                    <CustomText>Notifications</CustomText>
                    <CustomButton title="Close" onPress={onRequestClose} style={{width:"100%"}} />
                </View>
            </Pressable>
        </Modal>
    )
}

export default NotificationsModal

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