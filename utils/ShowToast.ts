import Toast from "react-native-toast-message";

type ToastType = "success" | "error" | "info";

export function showToast(message: string, type: ToastType = "success", duration: number = 2000){
    Toast.show({
        text1: message,
        type: type,
        visibilityTime: duration,
        autoHide: true,
        swipeable:true,
        text1Style:{
            fontFamily:"DMSans-Bold",
            fontSize:16,
        },
    })
}