import { supabase } from '@/database/supabase';
import { withInternetCheck } from '@/utils/networkUtils';

export const getAllWords = async (options?: { random?: boolean; number?: number }) => {
  return withInternetCheck(async () => {
    let query = supabase.from('words').select('*')
    
    if (options?.number) {
      query = query.limit(options.number)
    }
    
    const { data, error } = await query
    
    if (options?.random && data) {
      data.sort(() => Math.random() - 0.5)
    }
    
    if (error) {
      console.error('Error fetching all words:', error)
      return []
    }

    return data
  }, false); // Don't show alert here, let the calling component handle it
}

export const getWordsByCategories = async (categories: string[]) => {
  return withInternetCheck(async () => {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .in('category', categories)

    if (error) {
      console.error('Error fetching words by category:', error)
      return []
    }

    return data
  }, false); // Don't show alert here, let the calling component handle it
}

export const getDailyWords = async (categories: string[], dailyWordGoal: number) => {
  if (!categories || categories.length === 0 || dailyWordGoal <= 0) {
    console.log('getDailyWords: Invalid parameters', { categories, dailyWordGoal })
    return []
  }

  console.log('getDailyWords: Fetching words for categories:', categories, 'goal:', dailyWordGoal)

  return withInternetCheck(async () => {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .in('category', categories)

    if (error || !data) {
      console.error('Error fetching words for daily list:', error)
      return []
    }

    console.log('getDailyWords: Found', data.length, 'words in selected categories')
    console.log('getDailyWords: Available categories in data:', [...new Set(data.map(w => w.category))])

    // If we don't have enough words in the selected categories, fall back to all words
    if (data.length < dailyWordGoal) {
      console.log('getDailyWords: Not enough words in selected categories, falling back to all words')
      const { data: allData, error: allError } = await supabase
        .from('words')
        .select('*')
      
      if (allError || !allData) {
        console.error('Error fetching all words as fallback:', allError)
        return data.slice(0, dailyWordGoal) // Return what we have
      }
      
      console.log('getDailyWords: Found', allData.length, 'total words in database')
      const shuffledAllData = allData.sort(() => Math.random() - 0.5)
      return shuffledAllData.slice(0, dailyWordGoal)
    }

    const shuffleArray = (arr: any[]) => {
      return arr.sort(() => Math.random() - 0.5)
    }

    const selectedWords: any[] = []
    const usedIds = new Set<number>()
    const shuffledData = shuffleArray([...data])

    // First, try to get words from each selected category
    for (const category of categories) {
      const word = shuffledData.find(w => w.category === category && !usedIds.has(w.id))
      if (word) {
        selectedWords.push(word)
        usedIds.add(word.id)
      }
      if (selectedWords.length === dailyWordGoal) break
    }

    // If we still need more words, fill from any remaining words in selected categories
    for (const word of shuffledData) {
      if (selectedWords.length === dailyWordGoal) break
      if (!usedIds.has(word.id)) {
        selectedWords.push(word)
        usedIds.add(word.id)
      }
    }

    console.log('getDailyWords: Returning', selectedWords.length, 'words')
    return selectedWords
  }, false); // Don't show alert here, let the calling component handle it
}
