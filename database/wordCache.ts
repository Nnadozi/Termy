import { Word } from '@/types/word';
import { showToast } from '@/utils/ShowToast';
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

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS lists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        words TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create default lists if they don't exist (direct database calls to avoid circular dependency)
    await createDefaultListsDirect();
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

const createDefaultListsDirect = async () => {
  try {
    const defaultLists = [
      { name: 'Learned', description: 'Successfully completed vocabulary' },
    ];

    // Remove any existing favorites list (migration)
    await db.runAsync('DELETE FROM lists WHERE name = ?', ['Favorites']);

    for (const defaultList of defaultLists) {
      // Check if list exists using direct database query
      const existingList = await db.getFirstAsync(
        'SELECT id FROM lists WHERE name = ?',
        [defaultList.name]
      );
      
      if (!existingList) {
        await db.runAsync(
          'INSERT INTO lists (name, description, words) VALUES (?, ?, ?)',
          [defaultList.name, defaultList.description, null]
        );
        console.log(`Created default list: ${defaultList.name}`);
      }
    }
  } catch (error) {
    console.error('Error creating default lists:', error);
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

const clearAllData = async () => {
  try {
    await initializeDatabase();
    await db.execAsync('DELETE FROM dailyWords');
    await db.execAsync('DELETE FROM lists');
    console.log('All data cleared from database');
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};

const createList = async (listName: string, listDescription: string, words?: Word[]) => {
    try{
      await initializeDatabase();
      if(await getList(listName)){
        showToast("List name already exists", "error")
        throw new Error('List already exists');
      }
      await db.runAsync(
        'INSERT INTO lists (name, description, words) VALUES (?, ?, ?)',
        [listName, listDescription, words ? JSON.stringify(words) : null]
      );
      showToast("List created successfully")
    }catch(error){
      console.error('Error creating list:', error);
      throw error;
    }
}

const getList = async (listName: string) => {
  try {
    await initializeDatabase();
    const result = await db.getFirstAsync<{
      id: number;
      name: string;
      description: string;
      words: string | null;
      created_at: string;
      updated_at: string;
    }>(
      'SELECT * FROM lists WHERE name = ?',
      [listName]
    );
    if (!result) return null;
    return {
      id: result.id,
      name: result.name,
      description: result.description,
      words: result.words ? JSON.parse(result.words) : [],
      created_at: result.created_at,
      updated_at: result.updated_at
    };
  } catch(error){
    console.error('Error getting list:', error);
    throw error;
  }
}

const deleteList = async (listName: string) => {
  try {
    await initializeDatabase();
    await db.runAsync(
      'DELETE FROM lists WHERE name = ?',
      [listName]
    );
  } catch(error){
    console.error('Error deleting list:', error);
    throw error;
  }
}

const addWordToList = async (listName: string, word: Word) => {
  try {
    await initializeDatabase();
    const list = await getList(listName);
    if (!list) throw new Error('List not found');
    
    const words: Word[] = list.words || [];
    if (!words.some((w: Word) => w.id === word.id)) {
      words.push(word);
      await db.runAsync(
        'UPDATE lists SET words = ? WHERE name = ?',
        [JSON.stringify(words), listName]
      );
      showToast(`Word added to ${listName}`)
    } else {
      showToast(`Word is already in ${listName}`, "info")
    }
  } catch(error){
    console.error('Error adding word to list:', error);
    throw error;
  }
}

const addWordsToList = async (listName: string, words: Word[]) => {
  try {
    await initializeDatabase();
    const list = await getList(listName);
    if (!list) throw new Error('List not found');
    
    const existingWords: Word[] = list.words || [];
    const newWords = words.filter(word => !existingWords.some((w: Word) => w.id === word.id));
    
    if (newWords.length > 0) {
      const updatedWords = [...existingWords, ...newWords];
      await db.runAsync(
        'UPDATE lists SET words = ? WHERE name = ?',
        [JSON.stringify(updatedWords), listName]
      );
      showToast(`${newWords.length} words added to ${listName}`)
    } else {
      showToast(`All words are already in ${listName}`, "info")
    }
  } catch(error){
    console.error('Error adding words to list:', error);
    throw error;
  }
}

const removeWordFromList = async (listName: string, word: Word) => {
  try {
    await initializeDatabase();
    const list = await getList(listName);
    if (!list) throw new Error('List not found');
    
    const words = list.words.filter((w: Word) => w.id !== word.id);
    await db.runAsync(
      'UPDATE lists SET words = ? WHERE name = ?',
      [JSON.stringify(words), listName]
    );
    showToast(`Word removed from ${listName}`)
  } catch(error){
    console.error('Error removing word from list:', error);
    throw error;
  }
}

const getAllLists = async () => {
  try {
    await initializeDatabase();
    const results = await db.getAllAsync<{
      id: number;
      name: string;
      description: string;
      words: string | null;
      created_at: string;
      updated_at: string;
    }>('SELECT * FROM lists');
    return results.map(result => ({
      id: result.id,
      name: result.name,
      description: result.description,
      words: result.words ? JSON.parse(result.words) : [],
      created_at: result.created_at,
      updated_at: result.updated_at
    }));
  } catch(error){
    console.error('Error getting all lists:', error);
    throw error;
  }
}


export {
  addWordsToList, addWordToList, cacheDailyWords, clearAllData, clearCachedWords, createList, deleteList, getAllLists, getCachedDailyWords, getList, hasCachedWordsForToday,
  initializeDatabase, removeWordFromList
};

