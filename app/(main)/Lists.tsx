  import CustomIcon from '@/components/CustomIcon'
import CustomText from '@/components/CustomText'
import ListPreview from '@/components/ListPreview'
import Page from '@/components/Page'
import { List } from '@/types/list'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'

const Lists = () => {
  const [lists, setLists] = useState<List[]>([])
  useEffect(() => {
   
  }, [])
  return (
    <Page style={{justifyContent:"flex-start", alignItems:"flex-start"}}>
       <View style={{width:"100%", marginBottom:"3%", flexDirection:"row", alignItems:"center", justifyContent:"space-between"}}>
        <CustomText fontSize='XL' bold>Lists</CustomText>
        <CustomIcon name="plus" type="entypo" size={30} onPress={() => router.navigate("/(list)/CreateList")} />
      </View>
      <CustomText style={{marginBottom:"1%"}} bold>Default Lists</CustomText>
      <ListPreview title="Learned" description="Successfully completed vocabulary" count={10} />
      <ListPreview title="Favorites" description="Words you've marked as favorites" count={10} />
      <View style={{width:"100%", marginVertical:"2%"}}>
        <CustomText bold>Custom Lists</CustomText>
      </View>
      <View style={{width:"100%", marginBottom:"3%"}}>
        <CustomText opacity={0.5}>No custom lists yet - Press + to create one.</CustomText>
      </View>
    </Page>
  )
}

export default Lists

/**
 * Learned Words - successfully completed vocabulary
 * Review Needed - failed quiz words requiring attention
 * Favorites/Starred List - user-saved words
 * Custom Lists (future premium feature, Ex: SAT, GRE, etc.)
 */