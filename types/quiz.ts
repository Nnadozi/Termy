export interface QuizQuestion {
    word: string
    question: string
    type: 'multiple_choice' | 'fill_blank'
    correctAnswer: string
    options?: string[]
    context?: string
  }