"use strict";
/* --------------------- Constants and global variables --------------------- */
const JANDAN_DOMAINS = ["jandan.net"];
const EXTRA_CSS = "inject.css";
const ARTICLE_PATH_REG = /\/(p)\/(\d+)/;
const NAV_URL_REG = /\/(\w+)(\/\w+)*/;
const FUNC_MAP = new Map([
  ["pic", pic],
  ["treehole", treehole],
  ["qa", qa],
  ["zoo", zoo],
  ["ooxx", ooxx],
  ["top", hot],
  ["dzh", dzh],
  ["zhoubian", zhoubian],
  ["pond", pond],
  ["p", article],
  ["t", post],
]);
// Silly log severity emoji mappings
const EGGS = ["[🥚]", "[🐣]", "[🐥]"];

/* ----------------------------- Event handlers ----------------------------- */
chrome.runtime.onInstalled.addListener(() => {
  console.log("Hello World!");
});
// chrome.tabs.onUpdated.addListener(tabUpdateHandler);
chrome.webNavigation.onCompleted.addListener(onJandanPageLoaded, {
  url: [{ hostEquals: JANDAN_DOMAINS[0] }],
});

chrome.runtime.onMessage.addListener((message, sender, respFunc) => {
  if (message.eventType === "saveMHTML") {
    onSaveAsMHTML(sender);
  } else if (message.eventType === "saveIndex") {
    onSaveIndex(sender);
  } else {
    console.log(
      `${EGGS[0]} Handler for '${message?.eventType}' not implementated yet.`
    );
  }
  respFunc();
});

/* ------------------------- Event Handler Fucntions ------------------------ */
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
/* --------------------------- Dispatch Functions --------------------------- */
/**
 * Handles chrome tab update event. Check if the tab's domain is valid.
 * Valid domain gets dispatched to subsequent functions.
 *
 * @param {Object} details
 */
async function onJandanPageLoaded(details) {
  let navObj = {
    tabId: details?.tabId,
    navToken: null,
    trialUri: null,
    path: new URL(details?.url).pathname,
  };
  await dispatchUrl(navObj);
}

/**
 * Dynamically execute scripts on par with `manifest`'s static matche rules.
 *
 * @param {Object} navObj
 * @returns Early return if dispatch has failed
 */
async function dispatchUrl(navObj) {
  let matches = NAV_URL_REG.exec(navObj.path);
  if (!matches) {
    console.log(`${EGGS[0]} No implementation for ${navObj.path}`);
    return;
  }
  navObj.navToken = matches[1];
  navObj.trialUri = matches[2];
  let f = FUNC_MAP.get(navObj.navToken);
  if (!f) {
    console.log(`${EGGS[0]} No function mapping for '${navObj.navToken}'`);
    return;
  }
  console.log(navObj);
  try {
    await Promise.all([
      f(navObj),
      chrome.scripting.executeScript({
        target: { tabId: navObj.tabId },
        func: () => console.log(`${PAN} Injecting UI elements into this page`),
      }),
    ]);
  } catch (err) {
    console.error(`${EGGS[2]} Chrome probably doesn't happy about this:`);
    console.error(err);
  }
}

/**
 * 单个文章
 * @param {Object} navObj
 */
async function article(navObj) {
  if (!ARTICLE_PATH_REG.test(navObj.path)) {
    console.log(`${EGGS[0]} No implementation for ${navObj.path}`);
    return;
  }
  await chrome.scripting.executeScript({
    target: { tabId: navObj.tabId },
    func: saveInArticle,
  });
}

/**
 * 单个帖子
 * @param {Object} navObj
 */
async function post(navObj) {
  await chrome.scripting.executeScript({
    target: { tabId: navObj.tabId },
    func: saveInPost,
  });
}

/**
 * 无聊图
 * @param {Object} navObj
 */
async function pic(navObj) {
  await chrome.scripting.executeScript({
    target: { tabId: navObj.tabId },
    func: saveInPostList,
  });
}

/**
 * 树洞
 * @param {Object} navObj
 */
async function treehole(navObj) {
  await chrome.scripting.executeScript({
    target: { tabId: navObj.tabId },
    func: saveInPostList,
  });
}

/**
 * 问答
 * @param {Object} navObj
 */
async function qa(navObj) {
  await chrome.scripting.executeScript({
    target: { tabId: navObj.tabId },
    func: saveInPostList,
  });
}

/**
 * 动物园
 * @param {Object} navObj
 */
async function zoo(navObj) {
  await chrome.scripting.executeScript({
    target: { tabId: navObj.tabId },
    func: saveInPostList,
  });
}

/**
 * 随手拍
 * @param {Object} navObj
 */
async function ooxx(navObj) {
  await chrome.scripting.executeScript({
    target: { tabId: navObj.tabId },
    func: saveInPostList,
  });
}

/**
 * 热榜
 * @param {Object} navObj
 */
async function hot(navObj) {
  console.log("TODO");
}

/**
 * 大杂烩
 * @param {Object} navObj
 */
async function dzh(navObj) {
  console.log("TODO");
}

/**
 * 周边
 * @param {Object} navObj
 */
async function zhoubian(navObj) {
  await chrome.scripting.executeScript({
    target: { tabId: navObj.tabId },
    func: saveInPostList,
  });
}

/**
 * 鱼塘
 * @param {Object} navObj
 */
async function pond(navObj) {
  await chrome.scripting.executeScript({
    target: { tabId: navObj.tabId },
    func: saveInPostList,
  });
}

/* ------------------------------ Procedrual UI ----------------------------- */
/* --- These functions will be executed in target DOM, not background.js !--- */
function saveInArticle() {
  const like = document.querySelector("#content > div > a.jandan-zan");
  like.before(SAVE_BUTTON);
}

function saveInPost() {
  const shares = document.querySelector(
    "#comments > div > div.social-share.share-component"
  );
  shares.setAttribute("style", "float:none");
  shares.appendChild(SAVE_BUTTON);
}

function saveInPostList() {
  const postList = document.querySelectorAll("#comments > ol > li");
  postList.forEach((node) => {
    let voteArea = node.querySelector("div > div.jandan-vote");
    if (voteArea) {
      let linkSpan = savePlus();
      voteArea.appendChild(linkSpan);
      linkSpan.addEventListener("click", (_event) => {
        let parent = linkSpan?.parentElement?.parentElement;
        let author = parent?.querySelector("div.author > strong");
        let text = parent?.querySelector("div.text");
        let postId = text?.querySelector("span > a");
        let textContent = text?.querySelector("p");
        // TODO handle images when it's in /pic page
        console.log({
          authorName: author.innerText,
          authorCode: author.getAttribute("title").substring(4),
          postId: postId.innerText,
          textContent: textContent.innerHTML,
        });
      });
    }
  });
}
