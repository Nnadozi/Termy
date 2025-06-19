import { Word } from "./word"

export interface List {
    id: number | string
    name: string
    description: string
    words: Word[]
    created_at: string
    updated_at: string
} 