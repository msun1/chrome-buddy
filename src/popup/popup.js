const sleepBtn = document.getElementById("sleep");
const wakeBtn = document.getElementById("wake");

function send(action) {
  chrome.runtime.sendMessage({ action });
}

function updateButtons(state) {
  if (state === "sleeping") {
    sleepBtn.style.display = "none";
    wakeBtn.style.display = "block";
  } else {
    sleepBtn.style.display = "block";
    wakeBtn.style.display = "none";
  }
}

chrome.storage.local.get("petState", ({ petState }) => {
  updateButtons(petState || "awake");
});

sleepBtn.onclick = () => {
  send("sleep");
  updateButtons("sleeping");
};

wakeBtn.onclick = () => {
  send("wake");
  updateButtons("awake");
};

document.getElementById("play").onclick = () => send("play");
document.getElementById("home").onclick = () => send("home");
