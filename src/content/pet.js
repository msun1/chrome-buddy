if (!document.getElementById("virtual-pet")) {
  const pet = document.createElement("div");
  pet.id = "virtual-pet";

  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("src/assets/pet_front.png");
  img.alt = "Virtual Pet";

  pet.appendChild(img);
  document.body.appendChild(pet);

  const MIN_X = 20;
  const MAX_X = 180;
  let x = MIN_X;
  let direction = 1;
  let frameIndex = 0;
  let frontCooldown = 0;
  let isPaused = false;
  let walkInterval = null;

  const frames = {
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
    front: chrome.runtime.getURL("src/assets/pet_front.png"),
  };

  pet.style.left = `${x}px`;
  pet.style.bottom = "20px";

  function startWalking() {
    if (walkInterval) return;

    walkInterval = setInterval(() => {
      x += direction * 5.5;

      if (x <= MIN_X || x >= MAX_X) {
        direction *= -1;
        frontCooldown = 4;
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
    }, 400);
  }

  function stopWalking() {
    clearInterval(walkInterval);
    walkInterval = null;
    img.src = frames.front;
  }

  // Start moving initially
  startWalking();

  // Toggle pause on click
  pet.addEventListener("click", () => {
    isPaused = !isPaused;

    if (isPaused) {
      stopWalking();
    } else {
      startWalking();
    }
  });
}
