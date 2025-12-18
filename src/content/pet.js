// Prevent duplicate pets
if (!document.getElementById("virtual-pet")) {
  // ---------- CREATE PET ----------
  const pet = document.createElement("div");
  pet.id = "virtual-pet";

  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("src/assets/pet_front.png");
  img.alt = "Virtual Pet";

  pet.appendChild(img);
  document.body.appendChild(pet);

  // ---------- CONFIG ----------
  const MIN_X = 20;
  const MAX_X = 180;
  const MOVE_SPEED = 5.5;
  const FRAME_INTERVAL = 400;
  const FRONT_PAUSE_TICKS = 4;

  // ---------- STATE ----------
  let x = MIN_X;
  let direction = 1; // 1 = right, -1 = left
  let frameIndex = 0;
  let frontCooldown = 0;
  let isPaused = false;
  let walkInterval = null;

  // ---------- FRAMES ----------
  const frames = {
    front: chrome.runtime.getURL("src/assets/pet_front.png"),
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

  // ---------- INITIAL POSITION ----------
  pet.style.left = `${x}px`;
  pet.style.bottom = "20px";

  // ---------- WALK LOGIC ----------
  function startWalking() {
    if (walkInterval) return;

    walkInterval = setInterval(() => {
      x += direction * MOVE_SPEED;

      if (x <= MIN_X) {
        x = MIN_X;
        direction = 1;
        frontCooldown = FRONT_PAUSE_TICKS;
        frameIndex = 0;
      } else if (x >= MAX_X) {
        x = MAX_X;
        direction = -1;
        frontCooldown = FRONT_PAUSE_TICKS;
        frameIndex = 0;
      }

      pet.style.left = `${x}px`;

      if (frontCooldown > 0) {
        img.src = frames.front;
        frontCooldown--;
      } else {
        img.src =
          direction === 1 ? frames.right[frameIndex] : frames.left[frameIndex];

        frameIndex = (frameIndex + 1) % frames.left.length;
      }
    }, FRAME_INTERVAL);
  }

  function stopWalking() {
    if (!walkInterval) return;
    clearInterval(walkInterval);
    walkInterval = null;
    img.src = frames.front;
  }

  // ---------- START ----------
  startWalking();

  // ---------- CLICK: PAUSE / RESUME ----------
  pet.addEventListener("click", () => {
    isPaused = !isPaused;
    isPaused ? stopWalking() : startWalking();
  });
}
