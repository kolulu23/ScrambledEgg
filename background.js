"use strict";
/* --------------------- Constants and global variables --------------------- */
const JANDAN_DOMAINS = ["jandan.net"];

/* ----------------------------- Event handlers ----------------------------- */
chrome.runtime.onInstalled.addListener(() => {
  console.log("Hello World!");
});

// chrome.tabs.onUpdated.addListener(tabUpdateHandler);
chrome.webNavigation.onCompleted.addListener(
  async (details) => {
    await chrome.tabs.sendMessage(details?.tabId, {
      eventType: "nav",
      navObj: {
        tabId: details?.tabId,
        navToken: null,
        trialUri: null,
        path: new URL(details?.url).pathname,
      },
    });
  },
  {
    url: [{ hostEquals: JANDAN_DOMAINS[0] }],
  }
);

chrome.runtime.onMessage.addListener((message, sender, respFunc) => {
  if (message.eventType === "saveMHTML") {
    onSaveAsMHTML(sender);
  } else if (message.eventType === "saveIndex") {
    onSaveIndex(sender);
  } else {
    console.log(`Handler for '${message?.eventType}' not implementated yet.`);
  }
  respFunc();
});

/* ------------------------- Fucntions ------------------------ */
function onSaveAsMHTML(sender) {
  let tabId = sender?.tab?.id;
  chrome.pageCapture.saveAsMHTML({ tabId }, (mhtmlData) => {
    // TODO
    mhtmlData.text().then((data) => {
      console.log(data);
    });
  });
}

function onSaveIndex(sender) {
  console.log(sender);
}
