import { openDB } from "idb";

const dbPromise = openDB("storyDB", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("stories")) {
      db.createObjectStore("stories", { keyPath: "id" });
    }
  },
});

export async function saveStory(story) {
  const db = await dbPromise;
  return db.put("stories", story);
}

export async function getAllStories() {
  const db = await dbPromise;
  const stories = await db.getAll("stories");
  // Sorting hasil getAll berdasarkan createdAt tanpa mengubah data asli
  return stories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function deleteStory(id) {
  const db = await dbPromise;
  return db.delete("stories", id);
}
// Fungsi untuk sinkronisasi data baru dengan IndexedDB
export async function syncStories(newStories) {
  const db = await dbPromise;

  // Ambil semua ID dari cerita baru
  const newStoryIds = newStories.map((story) => story.id);

  // Ambil semua cerita yang ada di IndexedDB
  const existingStories = await db.getAll("stories");

  // Hapus cerita lama yang tidak ada di data baru
  for (const oldStory of existingStories) {
    if (!newStoryIds.includes(oldStory.id)) {
      await db.delete("stories", oldStory.id);
    }
  }

  // Simpan cerita baru ke IndexedDB
  for (const story of newStories) {
    await db.put("stories", story);
  }

  console.log("Sinkronisasi data selesai.");
}

// Fungsi untuk mendapatkan data offline dari IndexedDB
export async function getOfflineStories() {
  const db = await dbPromise;
  return db.getAll("stories");
}
