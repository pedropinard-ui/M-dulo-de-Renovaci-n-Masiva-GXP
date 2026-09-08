import { FeedbackNote } from '../types';

const STORAGE_KEY = 'universal_gxp_feedback_notes_v2';
const FALLBACK_KEY = 'universal_gxp_feedback_notes_v1';
const DB_NAME = 'UniversalGXP_NotesDB';
const DB_VERSION = 1;
const STORE_NAME = 'notes_store';

// Helper for IndexedDB durable storage
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getFromIndexedDB(): Promise<FeedbackNote[] | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get('feedback_notes');
      req.onsuccess = () => {
        if (Array.isArray(req.result)) {
          resolve(req.result);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function saveToIndexedDB(notes: FeedbackNote[]): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(notes, 'feedback_notes');
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // Ignore IndexedDB errors silently
  }
}

// Read synchronously from local storage for instant initial render, merging with fallback seed notes
export function getInitialNotesSync(fallback: FeedbackNote[] = []): FeedbackNote[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(FALLBACK_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge seed fallback notes with any local changes or user-added notes
        const map = new Map<string, FeedbackNote>();
        // 1. First insert all embedded seed notes
        for (const note of fallback) {
          map.set(note.id, note);
        }
        // 2. Then overlay with user's local notes or edits
        for (const note of parsed) {
          map.set(note.id, note);
        }
        return Array.from(map.values());
      }
    }
  } catch (err) {
    console.warn('Error reading notes from localStorage:', err);
  }
  return fallback;
}

// Asynchronously load notes from Server API with fallback to IndexedDB and localStorage
export async function loadNotesFromAllSources(currentLocalNotes: FeedbackNote[]): Promise<FeedbackNote[]> {
  // 1. Try Server API first (cross-device, cross-tab, cross-hours persistent storage)
  try {
    const res = await fetch('/api/notes');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const serverNotes = await res.json();
      if (Array.isArray(serverNotes) && serverNotes.length > 0) {
        // Merge with current local notes to avoid losing any local note
        const map = new Map<string, FeedbackNote>();
        for (const note of currentLocalNotes) {
          map.set(note.id, note);
        }
        for (const note of serverNotes) {
          map.set(note.id, note);
        }
        const merged = Array.from(map.values());
        saveNotesLocally(merged);
        return merged;
      } else if (Array.isArray(serverNotes) && serverNotes.length === 0 && currentLocalNotes.length > 0) {
        // Server has empty file but client has existing notes -> sync to server!
        await syncNotesToServer(currentLocalNotes);
        return currentLocalNotes;
      }
    }
  } catch (err) {
    console.log('Server /api/notes not reachable or offline, checking local caches:', err);
  }

  // 2. Check IndexedDB
  const idbNotes = await getFromIndexedDB();
  if (idbNotes && idbNotes.length > 0) {
    const map = new Map<string, FeedbackNote>();
    for (const note of currentLocalNotes) {
      map.set(note.id, note);
    }
    for (const note of idbNotes) {
      map.set(note.id, note);
    }
    const merged = Array.from(map.values());
    saveNotesLocally(merged);
    syncNotesToServer(merged).catch(() => {});
    return merged;
  }

  // 3. Fallback to localStorage
  const localNotes = getInitialNotesSync(currentLocalNotes);
  if (localNotes.length > 0) {
    saveNotesLocally(localNotes);
    syncNotesToServer(localNotes).catch(() => {});
    return localNotes;
  }

  saveNotesLocally(currentLocalNotes);
  return currentLocalNotes;
}

// Save notes locally to both localStorage and IndexedDB
export function saveNotesLocally(notes: FeedbackNote[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(notes));
  } catch (err) {
    console.warn('Error writing to localStorage:', err);
  }
  saveToIndexedDB(notes).catch(() => {});
}

// Send notes to server endpoint for durable disk persistence
export async function syncNotesToServer(notes: FeedbackNote[]): Promise<boolean> {
  try {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notes),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Persist notes everywhere
export async function persistNotes(notes: FeedbackNote[]): Promise<void> {
  saveNotesLocally(notes);
  await syncNotesToServer(notes);
}
