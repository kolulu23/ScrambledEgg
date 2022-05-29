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

/* ----------------------------- Event Handlers ----------------------------- */
chrome.runtime.onMessage.addListener((message, sender, respFunc) => {
  if (message.eventType === "nav") {
    dispatchUrl(message?.navObj);
  }
  respFunc();
});

/**
 * Dynamically execute scripts on par with `manifest`'s static matche rules.
 *
 * @param {Object} navObj
 * @returns Early return if dispatch has failed
 */
function dispatchUrl(navObj) {
  let matches = NAV_URL_REG.exec(navObj.path);
  if (!matches) {
    console.log(`${EGGS[3]} No implementation for ${navObj.path}`);
    return;
  }
  navObj.navToken = matches[1];
  navObj.trialUri = matches[2];
  let f = FUNC_MAP.get(navObj.navToken);
  if (!f) {
    console.log(`${EGGS[3]} No function mapping for '${navObj.navToken}'`);
    return;
  }
  console.log(`${EGGS[1]} Injecting UI elements into this page`);
  try {
    f(navObj);
  } catch (err) {
    console.error(`${EGGS[4]} Chrome probably doesn't happy about this:`);
    console.error(err);
  }
}

/**
 * 单个文章
 * @param {Object} navObj
 */
function article(navObj) {
  if (!ARTICLE_PATH_REG.test(navObj.path)) {
    console.log(`${EGGS[0]} No implementation for ${navObj.path}`);
    return;
  }
  const like = document.querySelector("#content > div > a.jandan-zan");
  like.before(saveBtn());
}

/**
 * 单个帖子
 * @param {Object} navObj
 */
function post(navObj) {
  saveInPost();
}

/**
 * 无聊图
 * @param {Object} navObj
 */
function pic(navObj) {
  saveInPostList();
}

/**
 * 树洞
 * @param {Object} navObj
 */
function treehole(navObj) {
  saveInPostList();
}

/**
 * 问答
 * @param {Object} navObj
 */
function qa(navObj) {
  saveInPostList();
}

/**
 * 动物园
 * @param {Object} navObj
 */
function zoo(navObj) {
  saveInPostList();
}

/**
 * 随手拍
 * @param {Object} navObj
 */
function ooxx(navObj) {
  saveInPostList();
}

/**
 * 热榜
 * @param {Object} navObj
 */
function hot(navObj) {
  console.log("TODO");
}

/**
 * 大杂烩
 * @param {Object} navObj
 */
function dzh(navObj) {
  console.log("TODO");
}

/**
 * 周边
 * @param {Object} navObj
 */
function zhoubian(navObj) {
  saveInPostList();
}

/**
 * 鱼塘
 * @param {Object} navObj
 */
function pond(navObj) {
  saveInPostList();
}
