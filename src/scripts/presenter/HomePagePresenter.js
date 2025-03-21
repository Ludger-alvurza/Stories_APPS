import { getAllStories } from "../data/api.js";
import {
  fetchAndSaveImageAsBlob,
  getImageBlobFromIndexedDB,
} from "../utils/imageStorage";

async function loadImage(imageUrl, key) {
  // Fetch dan Simpan gambar ke IndexedDB
  await fetchAndSaveImageAsBlob(imageUrl, key);

  // Ambil gambar dari IndexedDB untuk ditampilkan
  getImageBlobFromIndexedDB(key, (blobUrl) => {
    if (blobUrl) {
      const imgElement = document.getElementById(`story-image-${key}`);
      if (imgElement) {
        imgElement.src = blobUrl;
      }
    }
  });
}

export default class HomePagePresenter {
  constructor(view) {
    this.view = view;
  }

  async loadStories() {
    const token = localStorage.getItem("authToken");

    if (!token) {
      this.view.displayMessage("<p>Please log in to see the stories.</p>");
      return;
    }

    try {
      const page = 1;
      const size = 10;
      const location = 0;

      // Ambil cerita menggunakan fungsi getAllStories
      const stories = await getAllStories(page, size, location, token);
      console.log("Stories fetched:", stories);

      // Periksa apakah response kosong
      if (!stories || stories.length === 0) {
        this.view.displayMessage("<p>No stories available.</p>");
        return;
      }

      // Render HTML untuk cerita
      const storiesHtml = stories
        .map((story, index) => this.view.createStoryHTML(story, index))
        .join("");

      this.view.displayStories(storiesHtml);

      // Inisialisasi peta jika ada lat dan lon
      stories.forEach((story, index) => {
        if (story.photoUrl) {
          loadImage(story.photoUrl, index);
        }
        if (story.lat && story.lon) {
          this.view.initializeMap(
            index,
            story.lat,
            story.lon,
            story.name || "No Name",
            story.description || "No Description"
          );
        }
      });
    } catch (error) {
      // Tangani error berdasarkan jenisnya
      if (!navigator.onLine) {
        this.view.displayMessage(
          "<p>Anda sedang offline. Data akan diambil dari cache jika tersedia.</p>"
        );
      } else if (error.name === "TypeError") {
        this.view.displayMessage(
          "<p>Terjadi masalah saat menghubungi server. Silakan coba lagi nanti.</p>"
        );
      } else {
        console.error("Error fetching stories:", error);
        this.view.displayMessage(
          `<p>Error fetching stories: ${error.message}</p>`
        );
      }
    }
  }
}
