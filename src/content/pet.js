// Prevent duplicate pets
if (!document.getElementById("virtual-pet")) {
  const pet = document.createElement("div");
  pet.id = "virtual-pet";

  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("src/assets/pet.png");
  img.alt = "Virtual Pet";

  pet.appendChild(img);
  document.body.appendChild(pet);

  // --- Initial position ---
  const MIN_X = 20;
  const MAX_X = 140;
  let x = MIN_X;
  let direction = 1;

  pet.style.left = `${x}px`;
  pet.style.bottom = "20px";

  // --- Simple bounded movement ---
  setInterval(() => {
    x += direction * 1.5;

    if (x <= MIN_X || x >= MAX_X) {
      direction *= -1;
    }

    pet.style.left = `${x}px`;
  }, 50);

  // --- Click interaction ---
  pet.addEventListener("click", () => {
    pet.style.transform = "scale(1.1)";
    setTimeout(() => {
      pet.style.transform = "scale(1)";
    }, 150);
  });
}
