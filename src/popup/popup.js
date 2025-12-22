// src/popup/popup.js
const togglePetBtn = document.getElementById("toggle-pet");
const increaseBtn = document.getElementById("increase-size");
const decreaseBtn = document.getElementById("decrease-size");

let petVisible = true;

function sendToPet(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    chrome.tabs.sendMessage(tabs[0].id, message);
  });
}

// Sync state on popup open
chrome.storage.local.get("petVisible", (data) => {
  if (data.petVisible === false) {
    petVisible = false;
    togglePetBtn.textContent = "Show Pet";
  }
});

togglePetBtn.addEventListener("click", () => {
  petVisible = !petVisible;
  togglePetBtn.textContent = petVisible ? "Hide Pet" : "Show Pet";
  chrome.storage.local.set({ petVisible });
  sendToPet({ action: petVisible ? "show-pet" : "hide-pet" });
});

increaseBtn.addEventListener("click", () => {
  sendToPet({ action: "increase-size" });
});

decreaseBtn.addEventListener("click", () => {
  sendToPet({ action: "decrease-size" });
});
