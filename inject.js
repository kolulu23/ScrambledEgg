// Silly log severity emoji mappings
const EGGS = ["[🥚]", "[🐣]", "[🐥]", "[🍳]", "[🐔]"];
const ID_CODE_PREFIX_LEN = 4;
const ID_CODE_DISPLAY_LEN = 9;
const ID_CODE_DISPLAY_END_INDEX = ID_CODE_DISPLAY_LEN + ID_CODE_PREFIX_LEN;
// Could be stored in extension storage
const REMOVE_LOCATION = true;
const DELAY_TIME_100 = 100;
const DELAY_TIME_200 = 200;
const DELAY_TIME_500 = 500;
const DELAY_TIME_1000 = 1000;

console.log(`${EGGS[0]} Generating UI elements`);

/**
 * Create a button-like link that says 'Save Page'
 * @returns {Element} button
 */
function saveBtn() {
  let saveBtn = document.createElement("a");
  let saveBtnInnerSpan = document.createElement("span");
  saveBtnInnerSpan.setAttribute("class", "zan-text");
  saveBtnInnerSpan.append("Save Page");
  saveBtn.appendChild(saveBtnInnerSpan);
  saveBtn.removeAttribute("onClick");
  saveBtn.setAttribute("class", "save-btn");
  saveBtn.setAttribute("id", "save-post");
  // Maybe page agnostic
  saveBtn.addEventListener("click", (_event) => {
    chrome.runtime.sendMessage({ eventType: "saveMHTML" });
  });
  return saveBtn;
}

/**
 * Renders a '++' link
 * @returns {Element} ++ link
 */
function savePlus() {
  let link = document.createElement("a");
  link.setAttribute("title", "Save Me");
  link.setAttribute("class", "save-plus");
  link.setAttribute("href", "javascript:;");
  link.append("++");
  let linkSpan = document.createElement("span");
  linkSpan.setAttribute("class", "save-plus-span");
  linkSpan.appendChild(link);
  return linkSpan;
}

function idCodeTag() {
  let idCodeSpan = document.createElement("span");
  idCodeSpan.setAttribute("class", "id-code-tag");
  return idCodeSpan;
}

/**
 * Inject `Save Page` button to articles and dedicated pages.
 * @returns {Element} The save button it just injected
 */
function saveInPost() {
  let btn = saveBtn();
  const shares = document.querySelector(
    "#comments > div > div.social-share.share-component"
  );
  shares.setAttribute("style", "float:none");
  shares.appendChild(btn);
  return btn;
}

/**
 * Inject `++` into post list like `/pic` and `/treehole`.
 * Also a stripped id code will be appended into op's name.
 */
function saveInPostList(postList) {
  if (!postList) {
    console.log(`${EGGS[3]} Post list not found`);
  }
  postList.forEach((node) => {
    let voteArea = node.querySelector("div > div.jandan-vote");
    if (voteArea) {
      let linkSpan = savePlus();
      let commentLink = voteArea.querySelector(
        "span.tucao-unlike-container > a.tucao-btn"
      );
      linkSpan.addEventListener("click", onClickPlusPlus);
      voteArea.appendChild(linkSpan);
      commentLink.addEventListener("click", onCommentLinkClick);
    }
    let author = node.querySelector("div > div.author");
    if (author) {
      let idCode = author
        .querySelector("strong")
        .getAttribute("title")
        .substring(ID_CODE_PREFIX_LEN, ID_CODE_DISPLAY_END_INDEX);
      let tag = idCodeTag();
      tag.append(idCode);
      author.appendChild(document.createElement("br"));
      author.appendChild(tag);
    }
  });
}

/**
 * Handles click event on `++`.
 * Skips unpopular content. Saves pictures separately.
 *
 * @param {Event} _event
 */
function onClickPlusPlus(_event) {
  let parent = this?.parentElement?.parentElement;
  let { authorName, authorCode } = getAuthorInfoFromPost(parent);
  let text = parent?.querySelector("div.text");
  let postId = text?.querySelector("span > a").innerText;
  let content = "";
  let pics = [];
  text?.querySelectorAll("p").forEach((p) => {
    if (p.getAttribute("class") !== "bad_content") {
      content += p.innerHTML;
      p.querySelectorAll("a").forEach((a) => pics.push(a.getAttribute("href")));
    }
  });
  let post = {
    authorName,
    authorCode,
    postId,
    content,
    pics,
  };
  let postStore = IDB.transaction("posts", "readwrite").objectStore("posts");
  postStore.put(post);
}

/**
 * If user do not want to show location tags, they can always turn it off.
 *
 * @param {Event} event
 */
function onCommentLinkClick(event) {
  let dataId = this.getAttribute("data-id");
  let postIdQuery = `ol > li#comment-${dataId}`;
  const postArea = document.querySelector(postIdQuery);
  let opInfo = getAuthorInfoFromPost(postArea);

  // Delay the event handler logic so that Jandan's original script gets executed first,
  // this does not block the execution of current method though
  setTimeout(() => {
    const submitBtn = postArea.querySelector("div.tucao-form > div > button");
    const authorName = postArea
      .querySelector("div.tucao-form input.tucao-nickname")
      ?.getAttribute("value");
    const authorEmail = postArea
      .querySelector("div.tucao-form input.tucao-email")
      ?.getAttribute("value");
    const content = postArea.querySelector(
      "div.tucao-form > textarea.tucao-content"
    );
    if (!submitBtn || !content) {
      console.log(`${EGGS[3]} Comment element not found`);
      return;
    }
    submitBtn.addEventListener("click", (_event) => {
      let comment = {
        authorName,
        authorEmail,
        authorCode: "",
        opName: opInfo.authorName,
        opCode: opInfo.authorCode,
        postId: dataId,
        content: content.value,
        date: new Date(),
      };
      let commentStore = IDB.transaction("comments", "readwrite").objectStore(
        "comments"
      );
      if (comment.content.length < 3 || comment.content.length > 1000) {
        return;
      }
      commentStore.add(comment);
    });
  }, DELAY_TIME_1000);

  // Hide location tag
  setTimeout(() => {
    removeLocationFromComments(postArea);
  }, DELAY_TIME_200);
}

function removeLocationFromComments(commentElem) {
  if (REMOVE_LOCATION) {
    const locationTags = commentElem.querySelectorAll(
      `div.tucao-row > div.tucao-author .tucao-location`
    );
    if (!locationTags) {
      return;
    }
    locationTags.forEach((elem) => elem.setAttribute("hidden", true));
  }
}

function getAuthorInfoFromPost(postElement) {
  const author = postElement?.querySelector("div.author > strong");
  return {
    authorName: author?.innerText,
    authorCode: author?.getAttribute("title").substring(4),
  };
}
