// src/content/pet.js
if (!document.getElementById("virtual-pet")) {
  const pet = document.createElement("div");
  pet.id = "virtual-pet";

  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("src/assets/pet_front.png");
  pet.appendChild(img);
  document.body.appendChild(pet);

  // ---------- CONFIG ----------
  const MIN_X = 20;
  const MAX_X = 180;
  const SPEED = 5.5;
  const INTERVAL = 400;
  const FRONT_PAUSE = 3;

  // ---------- STATE ----------
  let x = MIN_X;
  let direction = 1;
  let frameIndex = 0;
  let frontCooldown = 0;
  let isSleeping = false;
  let isHidden = false;
  let walkInterval = null;

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

  function startWalking() {
    if (walkInterval || isHidden || isSleeping) return;

    walkInterval = setInterval(() => {
      x += direction * SPEED;

      if (x <= MIN_X || x >= MAX_X) {
        direction *= -1;
        frontCooldown = FRONT_PAUSE;
        frameIndex = 0;
      }

      pet.style.left = `${x}px`;

      if (frontCooldown > 0) {
        img.src = frames.front;
        frontCooldown--;
      } else {
        img.src =
          direction === 1 ? frames.right[frameIndex] : frames.left[frameIndex];
        frameIndex = (frameIndex + 1) % 3;
      }
    }, INTERVAL);
  }

  function stopWalking() {
    clearInterval(walkInterval);
    walkInterval = null;
  }

  startWalking();

  // ---------- CLICK HANDLING ----------
  let clickCount = 0;
  let clickTimer = null;

  pet.addEventListener("click", () => {
    clickCount++;

    if (clickTimer) clearTimeout(clickTimer);

    clickTimer = setTimeout(() => {
      if (clickCount >= 3) {
        // TRIPLE CLICK → HIDE pet
        isHidden = true;
        stopWalking();
        pet.style.display = "none";
        chrome.runtime.sendMessage({ action: "pet-hidden" });

        // Update popup
        chrome.runtime.sendMessage({ action: "pet-hidden" });
        chrome.storage.local.set({ petVisible: false });
      } else if (clickCount === 1) {
        // SINGLE CLICK → toggle sleep
        if (isSleeping) {
          isSleeping = false;
          img.src = frames.front;
          startWalking();
        } else {
          isSleeping = true;
          stopWalking();
          img.src = frames.sleep;
        }
      }
      clickCount = 0;
      clickTimer = null;
    }, 300);
  });

  // ---------- MESSAGE HANDLER FROM POPUP ----------
  chrome.runtime.onMessage.addListener((message) => {
    if (!pet) return;

    if (message.action === "hide-pet") {
      isHidden = true;
      stopWalking();
      pet.style.display = "none";
    }
    if (message.action === "show-pet") {
      isHidden = false;
      pet.style.display = "block";
      if (!isSleeping) startWalking();
    }
  });
}
