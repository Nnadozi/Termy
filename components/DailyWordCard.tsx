import { Word } from '@/types/word'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import CustomIcon from './CustomIcon'
import CustomText from './CustomText'

interface DailyWordCardProps {
  word: Word
  index: number
  total: number
  scrollToNext: () => void
}

const DailyWordCard = ({ word, index, total, scrollToNext }: DailyWordCardProps) => {
    const { colors } = useTheme();
  
    return (
      <View style={[styles.pageContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <CustomText bold fontSize="XL">
            {word.word}
          </CustomText>
          <View style={{flexDirection:"row", alignItems:"center", justifyContent:"space-between",gap:"3%"}}>
            <CustomText fontSize='small' textAlign='center'>
              {word.part_of_speech} · {word.category} 
            </CustomText>
            <CustomIcon size={15} name='volume-up' type='font-awesome' color={colors.border} />
          </View>
          <CustomText textAlign='center'>
            {word.definition}
          </CustomText>
          <CustomText fontSize='small' italic textAlign='center'>
           "{word.example_usage}"
          </CustomText>
          <View style={styles.buttonRow}>
            <CustomIcon size={20} name='share' type='feather' color={colors.border} />
            <CustomIcon size={20} name='favorite' type='material' color={colors.border} />
            <CustomIcon size={20} name='bookmarks' type='entypo' color={colors.border} />
          </View>
          <CustomText style={{marginTop:"5%"}} bold primary onPress={scrollToNext}>Got it! ({index + 1} / {total})</CustomText>
        </View>
      </View>
    );
  };
  
export default DailyWordCard

const styles = StyleSheet.create({
    pageContainer: {
      flex: 1,
      justifyContent: 'center', 
      alignItems: 'center',     
    },
    card: {
      width: '100%',
      height: '75%',
      justifyContent:"center",
      alignItems:"center",
      padding:'5%',
      borderWidth: 1,
      borderRadius:15,
      elevation:10,
      shadowColor: "gray",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 5,
      gap:"2%"
    },
    buttonRow:{
      flexDirection:"row",
      alignItems:"center",
      justifyContent:"space-between",     
      gap:"3%",
    }
  })
  