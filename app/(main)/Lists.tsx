import CustomIcon from '@/components/CustomIcon'
import CustomText from '@/components/CustomText'
import ListPreview from '@/components/ListPreview'
import Page from '@/components/Page'
import { deleteList, getAllLists } from '@/database/wordCache'
import { List } from '@/types/list'
import { router, useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Alert, ScrollView, View } from 'react-native'

const Lists = () => {
  const [lists, setLists] = useState<List[]>([])

  const fetchLists = async () => {
    const lists = await getAllLists()
    setLists(lists)
  }

  useEffect(() => {
    fetchLists()
  }, [])

  useFocusEffect(
    useCallback(() => {
      fetchLists()
    }, [])
  )

  const handleDeleteList = async (listName: string) => {
    Alert.alert(
      "Delete List",
      `Are you sure you want to delete "${listName}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteList(listName)
              setLists(lists.filter(l => l.name !== listName))
            } catch (error) {
              console.error('Error deleting list:', error)
            }
          }
        }
      ]
    )
  }

  return (
    <Page style={{flex: 1, justifyContent:"flex-start", alignItems:"flex-start"}}>
       <View style={{width:"100%", marginBottom:"3%", flexDirection:"row", alignItems:"center", justifyContent:"space-between"}}>
        <CustomText fontSize='XL' bold>Lists</CustomText>
        <CustomIcon name="plus" type="entypo" size={30} onPress={() => router.navigate("/(list)/CreateList")} />
      </View>
      <CustomText style={{marginBottom:"1%"}} bold>Default Lists</CustomText>
      <ListPreview customList={false} title="Learned" description="Successfully completed vocabulary" count={lists.find(l => l.name === "Learned")?.words.length || 0} />
      <View style={{width:"100%", marginVertical:"2%"}}>
        <CustomText bold>Custom Lists ({lists.filter(list => list.name !== "Learned").length})</CustomText>
      </View>
      <View style={{width:"100%", marginBottom:"3%", flex: 1}}>
        {
          lists.filter(list => list.name !== "Learned").length > 0 ? (
            <ScrollView style={{width:"100%", flex: 1}}>
            {lists.filter(list => list.name !== "Learned").map((list) => (
              <ListPreview
                key={list.id}
                title={list.name}
                description={list.description}
                count={list.words.length}
                customList
                onDelete={() => handleDeleteList(list.name)}
              />
            ))}
               </ScrollView>
          ) : (
            <CustomText opacity={0.5}>No custom lists yet</CustomText>
          )
        }
      </View>
    </Page>
  )
}

export default Lists

/**
 * Learned Words - successfully completed vocabulary
 * Review Needed - failed quiz words requiring attention
 * Custom Lists (future premium feature, Ex: SAT, GRE, etc.)
 */