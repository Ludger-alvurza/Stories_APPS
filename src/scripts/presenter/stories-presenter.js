import { addStory } from "../data/api.js";
import { fromLonLat, toLonLat } from "ol/proj";

export const handleFormSubmission = async (event, showPopup) => {
  event.preventDefault();

  const description = document.getElementById("description").value;
  const photo = document.getElementById("photo").files[0];
  const lat = document.getElementById("lat").value;
  const lon = document.getElementById("lon").value;
  const token = localStorage.getItem("authToken");

  if (!photo) {
    showPopup("Please take a photo before submitting.", false);
    return;
  }

  if (!token) {
    showPopup("Please log in first.");
    return;
  }

  try {
    await addStory(description, photo, token, lat || null, lon || null);
    showPopup("Story added successfully!", true);

    setTimeout(() => {
      window.location.hash = "/";
    }, 2000);
  } catch (error) {
    showPopup(`Error: ${error.message}`, false);
  }
};
export async function openCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  const video = document.getElementById("cameraStream");
  video.srcObject = stream;
  video.style.display = "block";
  video.play();

  const takePhotoButton = document.getElementById("takePhotoButton");
  const openCameraButton = document.getElementById("openCameraButton");

  openCameraButton.style.display = "none";
  takePhotoButton.style.display = "inline-block";

  takePhotoButton.addEventListener("click", () => {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const photoData = canvas.toDataURL("image/png");

    const photoPreview = document.getElementById("photoPreview");
    photoPreview.src = photoData;
    photoPreview.style.display = "block";

    const photoBlob = dataURLtoBlob(photoData);
    const file = new File([photoBlob], "photo.png", { type: "image/png" });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    document.getElementById("photo").files = dataTransfer.files;

    stream.getTracks().forEach((track) => track.stop());

    video.style.display = "none";
    takePhotoButton.style.display = "none";
  });
}

function dataURLtoBlob(dataURL) {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
}

export const initializeMap = (map, marker, defaultCoordinates) => {
  map.on("click", (event) => {
    const coordinates = event.coordinate;
    const [lon, lat] = toLonLat(coordinates);

    marker.getGeometry().setCoordinates(coordinates);

    document.getElementById("lat").value = lat.toFixed(6);
    document.getElementById("lon").value = lon.toFixed(6);
  });

  document.getElementById("resetMarker").addEventListener("click", () => {
    const defaultCoords = fromLonLat(defaultCoordinates);
    marker.getGeometry().setCoordinates(defaultCoords);

    const [defaultLon, defaultLat] = defaultCoordinates;
    document.getElementById("lat").value = defaultLat.toFixed(6);
    document.getElementById("lon").value = defaultLon.toFixed(6);
  });
};
