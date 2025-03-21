import HomePagePresenter from "../../presenter/HomePagePresenter.js";

export default class HomePage {
  constructor() {
    this.presenter = new HomePagePresenter(this);
  }

  async render() {
    return `
      <section id="mainContent" class="container">
        <h1>Home</h1>
        <div id="storiesContainer">
          <p>Loading stories...</p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const skipLink = document.querySelector(".skip-to-content");
    const mainContent = document.getElementById("mainContent");

    if (skipLink && mainContent) {
      skipLink.addEventListener("click", (event) => {
        event.preventDefault();
        mainContent.scrollIntoView({ behavior: "smooth" });
      });
    }

    await this.presenter.loadStories();
  }

  displayMessage(message) {
    const storiesContainer = document.getElementById("storiesContainer");
    storiesContainer.innerHTML = message;
  }

  displayStories(storiesHtml) {
    const storiesContainer = document.getElementById("storiesContainer");
    storiesContainer.innerHTML = storiesHtml;
  }

  createStoryHTML(story, index) {
    return `
      <div class="story">
        <img id="story-image-${index}" src="${story.photoUrl}" alt="${
      story.name
    }'s story" class="story-image"/>
        <div class="story-content">
          <h3>${story.name}</h3>
          <p>${story.description}</p>
          <small>Posted at: ${new Date(
            story.createdAt
          ).toLocaleString()}</small>
          <p>Location: (${story.lat}, ${story.lon})</p>
        </div>
        <div id="map-${index}" class="story-map"></div>
      </div>
    `;
  }

  initializeMap(index, lat, lon, name, description) {
    const map = L.map(`map-${index}`).setView([lat, lon], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    L.marker([lat, lon])
      .addTo(map)
      .bindPopup(`<b>${name}</b><br>${description}`);
  }
}
