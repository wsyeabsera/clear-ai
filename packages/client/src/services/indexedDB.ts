/**
 * IndexedDB Service for Clear AI Client
 * 
 * Provides persistent storage for chat sessions and messages using IndexedDB
 */

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  sessionId: string;
  userId: string;
  metadata?: {
    intent?: { type: string; confidence: number };
    reasoning?: string;
    memoryContext?: any[];
  };
  fullResponseData?: any;
  isLoading?: boolean;
  error?: string;
}

export interface ConversationData {
  sessions: ChatSession[];
  messages: ChatMessage[];
}

const DB_NAME = 'ClearAI';
const DB_VERSION = 1;
const SESSIONS_STORE = 'sessions';
const MESSAGES_STORE = 'messages';

class IndexedDBService {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    this.initDB();
  }

  private async initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create sessions store
        if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
          const sessionsStore = db.createObjectStore(SESSIONS_STORE, { keyPath: 'id' });
          sessionsStore.createIndex('userId', 'userId', { unique: false });
          sessionsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Create messages store
        if (!db.objectStoreNames.contains(MESSAGES_STORE)) {
          const messagesStore = db.createObjectStore(MESSAGES_STORE, { keyPath: 'id' });
          messagesStore.createIndex('sessionId', 'sessionId', { unique: false });
          messagesStore.createIndex('userId', 'userId', { unique: false });
          messagesStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });

    return this.dbPromise;
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }
    return this.initDB();
  }

  // Session operations
  async saveSession(session: ChatSession): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([SESSIONS_STORE], 'readwrite');
    const store = transaction.objectStore(SESSIONS_STORE);

    // Ensure dates are properly serialized
    const sessionData = {
      ...session,
      timestamp: session.timestamp,
      createdAt: session.createdAt,
      updatedAt: new Date(),
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put(sessionData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save session'));
    });
  }

  async getSession(sessionId: string): Promise<ChatSession | null> {
    const db = await this.getDB();
    const transaction = db.transaction([SESSIONS_STORE], 'readonly');
    const store = transaction.objectStore(SESSIONS_STORE);

    return new Promise((resolve, reject) => {
      const request = store.get(sessionId);
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          // Convert dates back to Date objects
          result.timestamp = new Date(result.timestamp);
          result.createdAt = new Date(result.createdAt);
          result.updatedAt = new Date(result.updatedAt);
          resolve(result);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(new Error('Failed to get session'));
    });
  }

  async getAllSessions(userId: string): Promise<ChatSession[]> {
    const db = await this.getDB();
    const transaction = db.transaction([SESSIONS_STORE], 'readonly');
    const store = transaction.objectStore(SESSIONS_STORE);
    const index = store.index('userId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(userId);
      request.onsuccess = () => {
        const sessions = request.result.map((session: any) => ({
          ...session,
          timestamp: new Date(session.timestamp),
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
        }));
        // Sort by timestamp descending (most recent first)
        sessions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        resolve(sessions);
      };
      request.onerror = () => reject(new Error('Failed to get sessions'));
    });
  }

  async deleteSession(sessionId: string): Promise<void> {
    const db = await this.getDB();
    
    // Delete session
    const sessionTransaction = db.transaction([SESSIONS_STORE], 'readwrite');
    const sessionStore = sessionTransaction.objectStore(SESSIONS_STORE);
    
    // Delete all messages for this session
    const messagesTransaction = db.transaction([MESSAGES_STORE], 'readwrite');
    const messagesStore = messagesTransaction.objectStore(MESSAGES_STORE);
    const messagesIndex = messagesStore.index('sessionId');

    await Promise.all([
      new Promise<void>((resolve, reject) => {
        const request = sessionStore.delete(sessionId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error('Failed to delete session'));
      }),
      new Promise<void>((resolve, reject) => {
        const request = messagesIndex.getAll(sessionId);
        request.onsuccess = () => {
          const messages = request.result;
          const deletePromises = messages.map((message: any) => 
            new Promise<void>((deleteResolve, deleteReject) => {
              const deleteRequest = messagesStore.delete(message.id);
              deleteRequest.onsuccess = () => deleteResolve();
              deleteRequest.onerror = () => deleteReject(new Error('Failed to delete message'));
            })
          );
          Promise.all(deletePromises).then(() => resolve()).catch(reject);
        };
        request.onerror = () => reject(new Error('Failed to get messages for deletion'));
      })
    ]);
  }

  // Message operations
  async saveMessage(message: ChatMessage): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([MESSAGES_STORE], 'readwrite');
    const store = transaction.objectStore(MESSAGES_STORE);

    // Ensure dates are properly serialized
    const messageData = {
      ...message,
      timestamp: message.timestamp,
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put(messageData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save message'));
    });
  }

  async getMessagesForSession(sessionId: string): Promise<ChatMessage[]> {
    const db = await this.getDB();
    const transaction = db.transaction([MESSAGES_STORE], 'readonly');
    const store = transaction.objectStore(MESSAGES_STORE);
    const index = store.index('sessionId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(sessionId);
      request.onsuccess = () => {
        const messages = request.result.map((message: any) => ({
          ...message,
          timestamp: new Date(message.timestamp),
        }));
        // Sort by timestamp ascending (oldest first)
        messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        resolve(messages);
      };
      request.onerror = () => reject(new Error('Failed to get messages'));
    });
  }

  async getAllMessages(userId: string): Promise<ChatMessage[]> {
    const db = await this.getDB();
    const transaction = db.transaction([MESSAGES_STORE], 'readonly');
    const store = transaction.objectStore(MESSAGES_STORE);
    const index = store.index('userId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(userId);
      request.onsuccess = () => {
        const messages = request.result.map((message: any) => ({
          ...message,
          timestamp: new Date(message.timestamp),
        }));
        resolve(messages);
      };
      request.onerror = () => reject(new Error('Failed to get all messages'));
    });
  }

  // Utility operations
  async exportConversationData(userId: string): Promise<ConversationData> {
    const [sessions, messages] = await Promise.all([
      this.getAllSessions(userId),
      this.getAllMessages(userId),
    ]);

    return {
      sessions,
      messages,
    };
  }

  async importConversationData(data: ConversationData, userId: string): Promise<void> {
    const db = await this.getDB();
    
    // Clear existing data for this user
    await this.clearUserData(userId);

    // Import sessions
    const sessionTransaction = db.transaction([SESSIONS_STORE], 'readwrite');
    const sessionStore = sessionTransaction.objectStore(SESSIONS_STORE);
    
    // Import messages
    const messageTransaction = db.transaction([MESSAGES_STORE], 'readwrite');
    const messageStore = messageTransaction.objectStore(MESSAGES_STORE);

    // Update userId for imported data
    const sessionsToImport = data.sessions.map(session => ({
      ...session,
      userId,
      timestamp: new Date(session.timestamp),
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt),
    }));

    const messagesToImport = data.messages.map(message => ({
      ...message,
      userId,
      timestamp: new Date(message.timestamp),
    }));

    // Save sessions
    const sessionPromises = sessionsToImport.map(session =>
      new Promise<void>((resolve, reject) => {
        const request = sessionStore.put(session);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error('Failed to import session'));
      })
    );

    // Save messages
    const messagePromises = messagesToImport.map(message =>
      new Promise<void>((resolve, reject) => {
        const request = messageStore.put(message);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error('Failed to import message'));
      })
    );

    await Promise.all([...sessionPromises, ...messagePromises]);
  }

  async clearUserData(userId: string): Promise<void> {
    const db = await this.getDB();
    
    // Clear sessions
    const sessionTransaction = db.transaction([SESSIONS_STORE], 'readwrite');
    const sessionStore = sessionTransaction.objectStore(SESSIONS_STORE);
    const sessionIndex = sessionStore.index('userId');
    
    // Clear messages
    const messageTransaction = db.transaction([MESSAGES_STORE], 'readwrite');
    const messageStore = messageTransaction.objectStore(MESSAGES_STORE);
    const messageIndex = messageStore.index('userId');

    await Promise.all([
      new Promise<void>((resolve, reject) => {
        const request = sessionIndex.getAll(userId);
        request.onsuccess = () => {
          const sessions = request.result;
          const deletePromises = sessions.map((session: any) =>
            new Promise<void>((deleteResolve, deleteReject) => {
              const deleteRequest = sessionStore.delete(session.id);
              deleteRequest.onsuccess = () => deleteResolve();
              deleteRequest.onerror = () => deleteReject(new Error('Failed to delete session'));
            })
          );
          Promise.all(deletePromises).then(() => resolve()).catch(reject);
        };
        request.onerror = () => reject(new Error('Failed to get sessions for deletion'));
      }),
      new Promise<void>((resolve, reject) => {
        const request = messageIndex.getAll(userId);
        request.onsuccess = () => {
          const messages = request.result;
          const deletePromises = messages.map((message: any) =>
            new Promise<void>((deleteResolve, deleteReject) => {
              const deleteRequest = messageStore.delete(message.id);
              deleteRequest.onsuccess = () => deleteResolve();
              deleteRequest.onerror = () => deleteReject(new Error('Failed to delete message'));
            })
          );
          Promise.all(deletePromises).then(() => resolve()).catch(reject);
        };
        request.onerror = () => reject(new Error('Failed to get messages for deletion'));
      })
    ]);
  }

  async clearAllData(): Promise<void> {
    const db = await this.getDB();
    
    const sessionTransaction = db.transaction([SESSIONS_STORE], 'readwrite');
    const sessionStore = sessionTransaction.objectStore(SESSIONS_STORE);
    
    const messageTransaction = db.transaction([MESSAGES_STORE], 'readwrite');
    const messageStore = messageTransaction.objectStore(MESSAGES_STORE);

    await Promise.all([
      new Promise<void>((resolve, reject) => {
        const request = sessionStore.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error('Failed to clear sessions'));
      }),
      new Promise<void>((resolve, reject) => {
        const request = messageStore.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error('Failed to clear messages'));
      })
    ]);
  }

  // Statistics
  async getStorageStats(userId: string): Promise<{
    sessionCount: number;
    messageCount: number;
    totalStorageSize: number;
  }> {
    const [sessions, messages] = await Promise.all([
      this.getAllSessions(userId),
      this.getAllMessages(userId),
    ]);

    // Estimate storage size (rough calculation)
    const totalStorageSize = JSON.stringify({ sessions, messages }).length;

    return {
      sessionCount: sessions.length,
      messageCount: messages.length,
      totalStorageSize,
    };
  }
}

// Export singleton instance
export const indexedDBService = new IndexedDBService();

// Export types and service
export default indexedDBService;
