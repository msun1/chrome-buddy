// src/background/serviceWorker.js

const FOCUS_ALARM = "chrome_focus_5s";
const FOCUS_SECONDS = 5;

// On install
chrome.runtime.onInstalled.addListener(() => {
  console.log("Virtual Pet installed!");
});

// When Chrome window focus changes
chrome.windows.onFocusChanged.addListener((windowId) => {
  // If focus lost (e.g., user clicked another app)
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    chrome.alarms.clear(FOCUS_ALARM);
    return;
  }

  // Focus gained: start a 5s timer
  chrome.alarms.clear(FOCUS_ALARM, () => {
    chrome.alarms.create(FOCUS_ALARM, {
      delayInMinutes: FOCUS_SECONDS / 60,
    });
  });
});

// When alarm fires, verify user is still focused in Chrome, then message active tab
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== FOCUS_ALARM) return;

  // Confirm Chrome is still focused
  const win = await chrome.windows.getLastFocused();
  if (!win || !win.focused) return;

  // Find active tab in that focused window
  const [tab] = await chrome.tabs.query({
    active: true,
    windowId: win.id,
  });

  if (!tab?.id) return;

  // Tell content script/pet to say something
  chrome.tabs.sendMessage(tab.id, {
    action: "buddy-say",
    text: "Hey! You’ve been on Chrome for 5 seconds 👀",
  });
});
