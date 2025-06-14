import { Word } from "./word"

export interface List {
    id: string
    name: string
    description?: string
    words: Word[]
    created_at: Date
    updated_at: Date
} 