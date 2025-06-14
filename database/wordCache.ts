import { Word } from '@/types/word';
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

const initializeDatabase = async () => {
  try {
    if (!db) {
      db = await SQLite.openDatabaseAsync('wordCache.db');
    }
    
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS dailyWords (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT NOT NULL UNIQUE,
        definition TEXT NOT NULL,
        example_usage TEXT,
        part_of_speech TEXT,
        category TEXT,
        date_cached TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

const cacheDailyWords = async (words: Word[]) => {
  try {
    await initializeDatabase();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    await db.withTransactionAsync(async () => {
      // Clear old cached words
      await db.runAsync('DELETE FROM dailyWords WHERE date_cached != ?', [today]);
      for (const word of words) {
        await db.runAsync(
          `INSERT OR REPLACE INTO dailyWords (word, definition, example_usage, part_of_speech, category, date_cached) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            word.word,
            word.definition,
            word.example_usage || null,
            word.part_of_speech || null,
            word.category || null,
            today
          ]
        );
      }
    });
    
    console.log(`Successfully cached ${words.length} daily words`);
  } catch (error) {
    console.error('Error caching daily words:', error);
    throw error;
  }
};

const getCachedDailyWords = async (): Promise<Word[]> => {
  try {
    await initializeDatabase();
    const today = new Date().toISOString().split('T')[0];
    const result = await db.getAllAsync(
      'SELECT * FROM dailyWords WHERE date_cached = ? ORDER BY created_at ASC',
      [today]
    );
    return result.map((row: any) => ({
      id: row.id,
      word: row.word,
      definition: row.definition,
      example_usage: row.example_usage,
      part_of_speech: row.part_of_speech,
      category: row.category,
    }));
  } catch (error) {
    console.error('Error retrieving cached words:', error);
    return [];
  }
};

const hasCachedWordsForToday = async (): Promise<boolean> => {
  try {
    await initializeDatabase();
    const today = new Date().toISOString().split('T')[0];
    const result = await db.getFirstAsync(
      'SELECT COUNT(*) as count FROM dailyWords WHERE date_cached = ?',
      [today]
    );
    return (result as any)?.count > 0;
  } catch (error) {
    console.error('Error checking cached words:', error);
    return false;
  }
};

const clearCachedWords = async () => {
  try {
    await initializeDatabase();
    await db.execAsync('DELETE FROM dailyWords');
    console.log('All cached words cleared');
  } catch (error) {
    console.error('Error clearing cached words:', error);
    throw error;
  }
};

const createList = async (listName: string) => {
 
}

const getList = async (listName: string) => {

}

const deleteList = async (listName: string) => {

}

const addWordToList = async (listName: string, word: Word) => {

}

const removeWordFromList = async (listName: string, word: Word) => {

}

const getAllLists = async () => {
  
}


export {
  addWordToList, cacheDailyWords,
  clearCachedWords, createList, deleteList, getAllLists, getCachedDailyWords, getList, hasCachedWordsForToday,
  initializeDatabase, removeWordFromList
};

