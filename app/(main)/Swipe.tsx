import SwipeCard from '@/components/SwipeCard'
import React from 'react'
import PagerView from 'react-native-pager-view'

const Swipe = () => {
  return (
      <PagerView orientation={'vertical'} style={{flex:1}} initialPage={0}>
        <SwipeCard word={{
          id: '1',
          word: 'Hello',
          definition: 'A greeting',
          example: 'Hello, how are you?',
          partOfSpeech: 'Noun',
        }} />
        <SwipeCard word={{
          id: '2',
          word: 'Hello',
          definition: 'A greeting',
          example: 'Hello, how are you?',
          partOfSpeech: 'Noun',
        }} />
      </PagerView>
  )
}

export default Swipe

//Buttons: copy, share, listen, favorit