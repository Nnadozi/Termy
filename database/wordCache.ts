import { Word } from '@/types/word';
import { showToast } from '@/utils/ShowToast';
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;
let isInitializing = false;

const initializeDatabase = async () => {
  try {
    // Prevent multiple simultaneous initializations
    if (isInitializing) {
      // Wait for the current initialization to complete
      while (isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    if (!db) {
      isInitializing = true;
      db = await SQLite.openDatabaseAsync('wordCache.db');
      
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
      isInitializing = false;
    }
  } catch (error) {
    isInitializing = false;
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
    try {
      await db.runAsync('DELETE FROM lists WHERE name = ?', ['Favorites']);
    } catch (error) {
      console.log('No Favorites list to remove (migration)');
    }

    for (const defaultList of defaultLists) {
      try {
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
      } catch (error) {
        console.error(`Error creating default list ${defaultList.name}:`, error);
        // Continue with other lists even if one fails
      }
    }
  } catch (error) {
    console.error('Error creating default lists:', error);
    // Don't throw here to prevent database initialization from failing
  }
};

const cacheDailyWords = async (words: Word[]) => {
  try {
    await initializeDatabase();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    console.log('Caching words for date:', today, 'count:', words.length);
    
    // Clear words from different dates (not today)
    await db.runAsync('DELETE FROM dailyWords WHERE date_cached != ?', [today]);
    console.log('Cleared words from different dates (keeping today\'s words)');
    
    // Insert new words
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
    
    console.log(`Successfully cached ${words.length} daily words for ${today}`);
  } catch (error) {
    console.error('Error caching daily words:', error);
    throw error;
  }
};

const getCachedDailyWords = async (): Promise<Word[]> => {
  try {
    await initializeDatabase();
    const today = new Date().toISOString().split('T')[0];
    console.log('Retrieving cached words for date:', today);
    
    const result = await db.getAllAsync(
      'SELECT * FROM dailyWords WHERE date_cached = ? ORDER BY created_at ASC',
      [today]
    );
    
    console.log('Retrieved cached words:', result.length);
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
    console.log('Checking for cached words on date:', today);
    
    const result = await db.getFirstAsync(
      'SELECT COUNT(*) as count FROM dailyWords WHERE date_cached = ?',
      [today]
    );
    
    const hasWords = (result as any)?.count > 0;
    console.log('Has cached words for today:', hasWords, 'count:', (result as any)?.count);
    return hasWords;
  } catch (error) {
    console.error('Error checking cached words:', error);
    return false;
  }
};

const clearCachedWords = async () => {
  try {
    await initializeDatabase();
    await db.runAsync('DELETE FROM dailyWords');
    console.log('All cached words cleared');
  } catch (error) {
    console.error('Error clearing cached words:', error);
    throw error;
  }
};

const clearAllData = async () => {
  try {
    await initializeDatabase();
    
    // Use a transaction to ensure atomicity and prevent locking
    await db.withTransactionAsync(async () => {
      await db.execAsync('DELETE FROM dailyWords');
      // Preserve the "Learned" list as it's a default list
      await db.execAsync('DELETE FROM lists WHERE name != "Learned"');
    });
    
    console.log('All data cleared from database (preserving Learned list)');
  } catch (error) {
    console.error('Error clearing all data:', error);
    // Don't throw the error to prevent the profile deletion from failing
    // The AsyncStorage clear and userStore reset will still work
  }
};

const clearUserData = async () => {
  try {
    await initializeDatabase();
    
    // Clear data in smaller, safer operations instead of one large transaction
    try {
      await db.execAsync('DELETE FROM dailyWords');
      console.log('Cleared daily words');
    } catch (error) {
      console.log('Error clearing daily words:', error);
    }
    
    try {
      await db.execAsync('DELETE FROM lists WHERE name != "Learned"');
      console.log('Cleared user lists');
    } catch (error) {
      console.log('Error clearing user lists:', error);
    }
    
    try {
      await db.runAsync('UPDATE lists SET words = ? WHERE name = "Learned"', [null]);
      console.log('Cleared Learned list words');
    } catch (error) {
      console.log('Error clearing Learned list words:', error);
    }
    
    // Ensure the Learned list exists after clearing
    try {
      await createDefaultListsDirect();
      console.log('Recreated default lists');
    } catch (error) {
      console.log('Error recreating default lists:', error);
    }
    
    console.log('User data cleared from database (preserving default lists structure)');
  } catch (error) {
    console.error('Error clearing user data:', error);
    // Don't throw the error to prevent the profile deletion from failing
    // The AsyncStorage clear and userStore reset will still work
  }
};

const createList = async (listName: string, listDescription: string, words?: Word[]) => {
    try{
      await initializeDatabase();
      
      // Prevent creating lists with default names
      if (listName === 'Learned') {
        showToast("Cannot create a list with the name 'Learned' as it's a default list", "error")
        throw new Error('Cannot create list with default name');
      }
      
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
    
    // Prevent deletion of default lists
    if (listName === 'Learned') {
      showToast("Cannot delete the default Learned list", "error")
      throw new Error('Cannot delete default list');
    }
    
    await db.runAsync(
      'DELETE FROM lists WHERE name = ?',
      [listName]
    );
    showToast(`List ${listName} deleted`)
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

const clearUserDataIOSSafe = async () => {
  try {
    console.log('Starting iOS-safe user data clearing...')
    
    // Initialize database first
    await initializeDatabase();
    console.log('Database initialized for clearing')
    
    // Clear daily words with simple operation
    try {
      const result = await db.execAsync('DELETE FROM dailyWords');
      console.log('Daily words cleared:', result)
    } catch (error) {
      console.log('Error clearing daily words:', error)
    }
    
    // Clear user lists with simple operation
    try {
      const result = await db.execAsync('DELETE FROM lists WHERE name != "Learned"');
      console.log('User lists cleared:', result)
    } catch (error) {
      console.log('Error clearing user lists:', error)
    }
    
    // Clear Learned list words with simple operation
    try {
      const result = await db.runAsync('UPDATE lists SET words = ? WHERE name = "Learned"', [null]);
      console.log('Learned list words cleared:', result)
    } catch (error) {
      console.log('Error clearing Learned list words:', error)
    }
    
    // Ensure Learned list exists (this is the most likely to fail)
    try {
      const existingList = await db.getFirstAsync(
        'SELECT id FROM lists WHERE name = ?',
        ['Learned']
      );
      
      if (!existingList) {
        await db.runAsync(
          'INSERT INTO lists (name, description, words) VALUES (?, ?, ?)',
          ['Learned', 'Successfully completed vocabulary', null]
        );
        console.log('Recreated Learned list')
      } else {
        console.log('Learned list already exists')
      }
    } catch (error) {
      console.log('Error ensuring Learned list exists:', error)
    }
    
    console.log('iOS-safe user data clearing completed')
  } catch (error) {
    console.error('Error in iOS-safe user data clearing:', error)
    // Don't throw - let the process continue
  }
};


export {
  addWordsToList, addWordToList, cacheDailyWords, clearAllData, clearCachedWords, clearUserData, clearUserDataIOSSafe, createList, deleteList, getAllLists, getCachedDailyWords, getList, hasCachedWordsForToday,
  initializeDatabase, removeWordFromList
};

