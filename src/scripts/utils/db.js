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
  return stories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function deleteStory(id) {
  const db = await dbPromise;
  return db.delete("stories", id);
}
export async function syncStories(newStories) {
  const db = await dbPromise;

  const newStoryIds = newStories.map((story) => story.id);

  const existingStories = await db.getAll("stories");

  for (const oldStory of existingStories) {
    if (!newStoryIds.includes(oldStory.id)) {
      await db.delete("stories", oldStory.id);
    }
  }

  for (const story of newStories) {
    await db.put("stories", story);
  }

  console.log("Sinkronisasi data selesai.");
}

export async function getOfflineStories() {
  const db = await dbPromise;
  return db.getAll("stories");
}
