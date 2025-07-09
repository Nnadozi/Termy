import CustomIcon from '@/components/CustomIcon'
import CustomInput from '@/components/CustomInput'
import CustomText from '@/components/CustomText'
import ErrorDisplay from '@/components/ErrorDisplay'
import ListPreview from '@/components/ListPreview'
import LoadingSpinner from '@/components/LoadingSpinner'
import Page from '@/components/Page'
import { deleteList, getAllLists } from '@/database/wordCache'
import { List } from '@/types/list'
import { router, useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Alert, ScrollView, View } from 'react-native'

const Lists = () => {
  const [lists, setLists] = useState<List[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingList, setDeletingList] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const fetchLists = async () => {
    setLoading(true)
    setError(null)
    try {
      const lists = await getAllLists()
      setLists(lists)
    } catch (error) {
      console.error('Error fetching lists:', error)
      setError(error instanceof Error ? error.message : 'Failed to load lists')
    } finally {
      setLoading(false)
    }
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
            setDeletingList(listName)
            try {
              await deleteList(listName)
              setLists(lists.filter(l => l.name !== listName))
            } catch (error) {
              console.error('Error deleting list:', error)
              Alert.alert('Error', 'Failed to delete list. Please try again.')
            } finally {
              setDeletingList(null)
            }
          }
        }
      ]
    )
  }

  // Filter lists based on search query
  const filteredLists = lists.filter(list => 
    list.name.toLowerCase().includes(search.toLowerCase()) ||
    list.description.toLowerCase().includes(search.toLowerCase())
  )

  const customLists = filteredLists.filter(list => list.name !== "Learned")
  const learnedList = filteredLists.find(list => list.name === "Learned")

  return (
    <Page style={{flex: 1, justifyContent:"flex-start", alignItems:"flex-start"}}>
      <View style={{width:"100%", marginBottom:"3%", flexDirection:"row", alignItems:"center", justifyContent:"space-between"}}>
        <CustomText fontSize='XL' bold>Lists</CustomText>
        <CustomIcon name="plus" type="entypo" size={30} onPress={() => router.navigate("/(list)/CreateList")} />
      </View>
      
      {/* Search Bar - Only show if there are at least 5 lists */}
      {lists.length >= 5 && (
        <CustomInput 
          placeholder="Search lists..." 
          value={search} 
          onChangeText={setSearch} 
          style={{marginBottom:"3%", width:"100%"}} 
          maxLength={50}
        />
      )}
      
      {loading ? (
        <LoadingSpinner text="Loading lists..." />
      ) : error ? (
        <ErrorDisplay
          title="Failed to Load Lists"
          message={error}
          onRetry={fetchLists}
        />
      ) : (
        <>
          <CustomText style={{marginTop:5}} bold>Default Lists</CustomText>
          {learnedList && (
            <ListPreview 
              customList={false} 
              title="Learned" 
              description="Successfully completed vocabulary" 
              count={learnedList.words.length} 
            />
          )}
          <View style={{width:"100%", marginVertical:5}}>
            <CustomText bold>Custom Lists ({customLists.length})</CustomText>
          </View>
          <View style={{width:"100%", marginBottom:"0%", flex: 1}}>
            {
              customLists.length > 0 ? (
                <ScrollView style={{width:"100%", }}>
                {customLists.map((list) => (
                  <ListPreview
                    key={list.id}
                    title={list.name}
                    description={list.description}
                    count={list.words.length}
                    customList
                    onDelete={() => handleDeleteList(list.name)}
                    isDeleting={deletingList === list.name}
                  />
                ))}
                   </ScrollView>
              ) : (
                <CustomText opacity={0.5}>
                  {search ? `No lists found matching "${search}"` : "No custom lists yet - press \"+\" to create"}
                </CustomText>
              )
            }
          </View>
        </>
      )}
    </Page>
  )
}

export default Lists

/**
 * Learned Words - successfully completed vocabulary
 * Review Needed - failed quiz words requiring attention
 * Custom Lists (future premium feature, Ex: SAT, GRE, etc.)
 */