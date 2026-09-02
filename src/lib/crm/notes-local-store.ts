/**
 * Espelho local das notas do CRM — IndexedDB separado do Business.
 */
import type { StickyNote } from "@/lib/sticky-notes/types";

const DB_NAME = "omni-crm-sticky-notes";
const DB_VERSION = 1;
const STORE = "notes";
const META = "meta";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(META)) {
        db.createObjectStore(META, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB unavailable"));
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function localListNotes(): Promise<StickyNote[]> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve((req.result as StickyNote[]) ?? []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function localPutNote(note: StickyNote): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(note);
    await txDone(tx);
  } catch {
    /* best effort */
  }
}

export async function localPutNotes(notes: StickyNote[]): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    for (const note of notes) store.put(note);
    await txDone(tx);
  } catch {
    /* best effort */
  }
}

export async function localDeleteNote(id: string): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    await txDone(tx);
  } catch {
    /* best effort */
  }
}

export async function localGetPendingIds(): Promise<string[]> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(META, "readonly");
      const req = tx.objectStore(META).get("pendingIds");
      req.onsuccess = () => {
        const value = req.result?.value;
        resolve(Array.isArray(value) ? value : []);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function localSetPendingIds(ids: string[]): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(META, "readwrite");
    tx.objectStore(META).put({ key: "pendingIds", value: Array.from(new Set(ids)) });
    await txDone(tx);
  } catch {
    /* best effort */
  }
}

export async function localMarkPending(id: string): Promise<void> {
  const ids = await localGetPendingIds();
  if (!ids.includes(id)) {
    await localSetPendingIds([...ids, id]);
  }
}

export async function localClearPending(id: string): Promise<void> {
  const ids = await localGetPendingIds();
  await localSetPendingIds(ids.filter((x) => x !== id));
}

export { mergeNotes } from "@/lib/sticky-notes/local-store";
