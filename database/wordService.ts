import { supabase } from '@/database/supabase'

export const getAllWords = async (options?: { random: boolean }) => {
  const { data, error } = await supabase
    .from('words')
    .select('*')
  if (options?.random && data) {
    data.sort(() => Math.random() - 0.5)
  }
  if (error) {
    console.error('Error fetching all words:', error)
    return []
  }

  return data
}

export const getWordsByCategories = async (categories: string[]) => {
  const { data, error } = await supabase
    .from('words')
    .select('*')
    .in('category', categories)

  if (error) {
    console.error('Error fetching words by category:', error)
    return []
  }

  return data
}

export const getDailyWords = async (categories: string[], dailyWordGoal: number) => {
  if (!categories || categories.length === 0 || dailyWordGoal <= 0) return []

  const { data, error } = await supabase
    .from('words')
    .select('*')
    .in('category', categories)

  if (error || !data) {
    console.error('Error fetching words for daily list:', error)
    return []
  }

  const shuffleArray = (arr: any[]) => {
    return arr.sort(() => Math.random() - 0.5)
  }

  const selectedWords: any[] = []
  const usedIds = new Set<number>()
  const shuffledCategories = shuffleArray([...categories])
  const shuffledData = shuffleArray([...data])

  for (const category of shuffledCategories) {
    const word = shuffledData.find(w => w.category === category && !usedIds.has(w.id))
    if (word) {
      selectedWords.push(word)
      usedIds.add(word.id)
    }
    if (selectedWords.length === dailyWordGoal) break
  }

  for (const word of shuffledData) {
    if (selectedWords.length === dailyWordGoal) break
    if (!usedIds.has(word.id)) {
      selectedWords.push(word)
      usedIds.add(word.id)
    }
  }

  return selectedWords
}
