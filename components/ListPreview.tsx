import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import { useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import CustomIcon from "./CustomIcon";
import CustomText from "./CustomText";
import LoadingSpinner from './LoadingSpinner';

interface ListPreviewProps {
    title: string
    description: string
    count: number
    customList: boolean
    onDelete?: () => void
    isDeleting?: boolean
}

const ListPreview = ({title, description, count, customList, onDelete, isDeleting}: ListPreviewProps) => {
    const { colors } = useTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start(() => {
            router.navigate(`/(list)/${title}`);
        });
    };

    const handleDelete = (e: any) => {
        e.stopPropagation();
        onDelete?.();
    };

    return (
        <Animated.View
            style={[
                styles.bookContainer,
                {
                    transform: [{ scale: scaleAnim }],
                },
            ]}
        >
            

            {/* Book Cover */}
            <TouchableOpacity 
                onPress={handlePress} 
                activeOpacity={0.8} 
                style={[styles.bookCover, { backgroundColor: colors.primary }]}
            >
                <View style={styles.coverContent}>
                    <View style={styles.headerRow}>
                        <CustomText 
                            opposite 
                            fontSize="large" 
                            bold 
                            style={styles.bookTitle}
                            numberOfLines={2}
                        >
                            {title}
                        </CustomText>
                        
                        {customList && (
                            <View style={styles.deleteContainer}>
                                {isDeleting ? (
                                    <LoadingSpinner 
                                        size="small" 
                                        color={colors.background} 
                                        variant="button"
                                    />
                                ) : (
                                    <TouchableOpacity
                                        style={[styles.deleteButton, { backgroundColor: colors.background }]}
                                        onPress={handleDelete}
                                    >
                                        <CustomIcon 
                                            name="trash-2" 
                                            type="feather" 
                                            size={14} 
                                            color={colors.primary}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>

                    <CustomText 
                        opposite 
                        fontSize="small" 
                        style={styles.bookDescription}
                        numberOfLines={2}
                    >
                        {description}
                    </CustomText>

                    <View style={styles.footerRow}>
                        <View style={[styles.wordCount, { backgroundColor: colors.background }]}>
                            <CustomIcon primary name="book" size={12} />
                            <CustomText primary fontSize="small" bold>
                                {count} words
                            </CustomText>
                        </View>
                        
                        
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default ListPreview;

const styles = StyleSheet.create({
    bookContainer: {
        width: "100%",
        marginVertical: 6,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
        borderRadius: 15,
    },

    bookCover: {
        flex: 1,
        borderRadius: 15,
    },
    coverContent: {
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    bookTitle: {
        flex: 1,
        marginRight: 12,
        lineHeight: 22,
    },
    deleteContainer: {
        marginTop: 2,
    },
    deleteButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bookDescription: {
        opacity: 0.9,
        lineHeight: 16,
        marginBottom: 10,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    wordCount: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 12,
        gap: 4,
    },
    arrow: {
        opacity: 0.7,
    },
});