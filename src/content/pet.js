// src/content/pet.js
if (!document.getElementById("virtual-pet")) {
  const pet = document.createElement("div");
  pet.id = "virtual-pet";

  const img = document.createElement("img");
  img.alt = "Virtual Pet";
  pet.appendChild(img);
  document.body.appendChild(pet);

  // ---------- LAYOUT (LOCKED) ----------
  let x = 20;

  pet.style.position = "fixed";
  pet.style.bottom = "20px";
  pet.style.left = `${x}px`;
  pet.style.width = "120px"; // LOCKED container size
  pet.style.height = "120px";
  pet.style.pointerEvents = "auto";
  pet.style.zIndex = "9999";

  img.style.position = "absolute";
  img.style.bottom = "0";
  img.style.left = "50%";
  img.style.transform = "translateX(-50%)";
  img.style.width = "100%";
  img.style.height = "auto";
  img.style.userSelect = "none";

  // ---------- CONFIG ----------
  const MIN_X = 20;
  const MAX_X = 180;
  const SPEED = 5.5;
  const INTERVAL = 400;
  const FRONT_PAUSE = 3;

  const MIN_SIZE = 0.6;
  const MAX_SIZE = 1.6;
  const SIZE_STEP = 0.1;

  // ---------- STATE ----------
  let direction = 1;
  let frameIndex = 0;
  let frontCooldown = 0;
  let isSleeping = false;
  let isHidden = false;
  let walkInterval = null;
  let petScale = 1;

  // ---------- FRAMES ----------
  const frames = {
    front: chrome.runtime.getURL("src/assets/pet_front.png"),
    sleep: chrome.runtime.getURL("src/assets/pet_sleep.png"),
    left: [
      chrome.runtime.getURL("src/assets/pet_left1.png"),
      chrome.runtime.getURL("src/assets/pet_left2.png"),
      chrome.runtime.getURL("src/assets/pet_left3.png"),
    ],
    right: [
      chrome.runtime.getURL("src/assets/pet_right1.png"),
      chrome.runtime.getURL("src/assets/pet_right2.png"),
      chrome.runtime.getURL("src/assets/pet_right3.png"),
    ],
  };

  // ---------- HELPERS ----------
  function applySize() {
    pet.style.transform = `scale(${petScale})`;
  }

  function showFront() {
    img.src = frames.front;
    img.style.width = "100%";
  }

  function showSleep() {
    img.src = frames.sleep;
    img.style.width = "150px"; // sleep-only resize
  }

  function showWalkFrame() {
    img.style.width = "100%";
    img.src =
      direction === 1 ? frames.right[frameIndex] : frames.left[frameIndex];
  }

  // ---------- STORAGE LOAD ----------
  chrome.storage.local.get(["petSize", "petVisible"], (data) => {
    if (data.petSize) {
      petScale = data.petSize;
      applySize();
    }

    if (data.petVisible === false) {
      isHidden = true;
      pet.style.display = "none";
    }
  });

  // ---------- WALKING ----------
  function startWalking() {
    if (walkInterval || isSleeping || isHidden) return;

    walkInterval = setInterval(() => {
      x += direction * SPEED;

      if (x <= MIN_X || x >= MAX_X) {
        direction *= -1;
        frontCooldown = FRONT_PAUSE;
        frameIndex = 0;
      }

      pet.style.left = `${x}px`;

      if (frontCooldown > 0) {
        showFront();
        frontCooldown--;
      } else {
        showWalkFrame();
        frameIndex = (frameIndex + 1) % 3;
      }
    }, INTERVAL);
  }

  function stopWalking() {
    clearInterval(walkInterval);
    walkInterval = null;
  }

  showFront();
  startWalking();

  // ---------- CLICK HANDLING ----------
  let clickCount = 0;
  let clickTimer = null;

  pet.addEventListener("click", () => {
    clickCount++;

    if (clickTimer) clearTimeout(clickTimer);

    clickTimer = setTimeout(() => {
      // TRIPLE CLICK → HIDE
      if (clickCount >= 3) {
        isHidden = true;
        stopWalking();
        pet.style.display = "none";
        chrome.storage.local.set({ petVisible: false });
        chrome.runtime.sendMessage({ action: "pet-hidden" });
      }

      // SINGLE CLICK → TOGGLE SLEEP
      else if (clickCount === 1) {
        if (isSleeping) {
          isSleeping = false;
          showFront();
          startWalking();
        } else {
          isSleeping = true;
          stopWalking();
          showSleep();
        }
      }

      clickCount = 0;
      clickTimer = null;
    }, 300);
  });

  // ---------- POPUP MESSAGES ----------
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "hide-pet") {
      isHidden = true;
      stopWalking();
      pet.style.display = "none";
      chrome.storage.local.set({ petVisible: false });
    }

    if (message.action === "show-pet") {
      isHidden = false;
      pet.style.display = "block";
      if (!isSleeping) startWalking();
      chrome.storage.local.set({ petVisible: true });
    }

    if (message.action === "increase-size") {
      petScale = Math.min(MAX_SIZE, petScale + SIZE_STEP);
      applySize();
      chrome.storage.local.set({ petSize: petScale });
    }

    if (message.action === "decrease-size") {
      petScale = Math.max(MIN_SIZE, petScale - SIZE_STEP);
      applySize();
      chrome.storage.local.set({ petSize: petScale });
    }
  });
}
