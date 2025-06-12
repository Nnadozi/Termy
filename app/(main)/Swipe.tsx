import SwipeCard from '@/components/SwipeCard'
import { Word } from '@/types/word'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import PagerView from 'react-native-pager-view'

const Swipe = () => {
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWords = async () => {
      setLoading(true)
      //const result = await getAllWords({ random: true })
     // setWords(result)
      setLoading(false)
    }
    fetchWords()
  }, [])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    )
  }

  return (
    <PagerView orientation="vertical" style={{ flex: 1 }} initialPage={0}>
      {words.map((word) => (
        <SwipeCard key={word.id} word={word} />
      ))}
    </PagerView>
  )
}

export default Swipe
