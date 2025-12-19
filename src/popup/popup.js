// src/popup/popup.js
const togglePetBtn = document.getElementById("toggle-pet");
let petVisible = true; // Tracks current state

function sendToPet(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab) return;

    chrome.tabs.sendMessage(tab.id, message, () => {
      // Ignore runtime errors. Pet may not exist on this tab yet.
      // We update button text based on our local state.
    });
  });
}

// Listen for hidden event from pet (triple click)
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "pet-hidden") {
    petVisible = false;
    togglePetBtn.textContent = "Show Pet";
  }
});

togglePetBtn.addEventListener("click", () => {
  petVisible = !petVisible;
  togglePetBtn.textContent = petVisible ? "Hide Pet" : "Show Pet";
  sendToPet({ action: petVisible ? "show-pet" : "hide-pet" });
  chrome.storage.local.set({ petVisible });
});

// On popup open
chrome.storage.local.get("petVisible", (data) => {
  if (data.petVisible === false) {
    petVisible = false;
    togglePetBtn.textContent = "Show Pet";
  }
});
