import CONFIG from "../config";
import {
  syncStories,
  getAllStories as getOfflineStories,
} from "../../scripts/utils/db.js";

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
  STORY_DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
};

export async function register(name, email, password) {
  const url = `${CONFIG.BASE_URL}/register`;

  if (!navigator.onLine) {
    throw new Error("Anda sedang offline. Tidak dapat melakukan registrasi.");
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Gagal melakukan registrasi.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error di register:", error.message);

    throw error;
  }
}

export async function login(email, password) {
  if (!navigator.onLine) {
    throw new Error("Anda sedang offline. Tidak dapat melakukan login.");
  }

  try {
    const response = await fetch(ENDPOINTS.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const responseJson = await response.json();

    console.log("Login response:", responseJson);

    if (!response.ok) {
      throw new Error(responseJson.message || "Gagal melakukan login.");
    }

    const { loginResult } = responseJson;
    if (
      !loginResult ||
      !loginResult.token ||
      !loginResult.token.includes(".")
    ) {
      throw new Error("Format token tidak valid.");
    }

    localStorage.setItem("token", loginResult.token);
    console.log("Token berhasil disimpan di localStorage:", loginResult.token);

    return loginResult;
  } catch (error) {
    console.error("Login error:", error.message);

    throw error;
  }
}

export async function getAllStories(page = 1, size = 10, location = 0, token) {
  try {
    if (!navigator.onLine) {
      console.warn("Offline mode: Data diambil dari IndexedDB.");
      return await getOfflineStories();
    }

    const response = await fetch(
      `${ENDPOINTS.STORIES}?page=${page}&size=${size}&location=${location}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    await syncStories(data.listStory);

    console.log(
      "Data berhasil diambil dari API dan disinkronkan ke IndexedDB."
    );
    return data.listStory;
  } catch (error) {
    console.error("Error di getAllStories:", error.message);

    console.warn("Mengambil data dari IndexedDB sebagai fallback.");
    return await getOfflineStories();
  }
}

export async function addStory(description, photo, token, lat, lon) {
  try {
    if (!navigator.onLine) {
      throw new Error("Anda sedang offline. Tidak dapat Mebuat Story.");
    }
    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", photo);

    if (lat) formData.append("lat", lat);
    if (lon) formData.append("lon", lon);

    const response = await fetch(ENDPOINTS.STORIES, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server returned: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in addStory:", error);
    throw error;
  }
}
