import Toast from "react-native-toast-message";

type ToastType = "success" | "error" | "info";

export function showToast(message: string, type: ToastType = "success", duration: number = 1500, fontSize: number = 16){
    Toast.show({
        text1: message,
        type: type,
        visibilityTime: duration,
        autoHide: true,
        swipeable:true,
        text1Style:{
            fontFamily:"DMSans-Bold",
            fontSize:fontSize,
        },
    })
}