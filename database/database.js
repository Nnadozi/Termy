import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseAsync('termy.db');

// Initialize database tables
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS words (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          word TEXT NOT NULL,
          definition TEXT NOT NULL
        );
      `);
    }, 
    error => reject(error),
    () => resolve()
    );
  });
};

// Insert words into local database
export const insertWords = (words) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      words.forEach(word => {
        tx.executeSql(
          'INSERT INTO words (word, definition) VALUES (?, ?)',
          [word.word, word.definition],
          () => {},
          (_, error) => reject(error)
        );
      });
    },
    error => reject(error),
    () => resolve()
    );
  });
};

// Get all words from local database
export const getAllWords = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM words',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};