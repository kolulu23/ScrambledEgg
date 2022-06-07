// Silly log severity emoji mappings
const EGGS = ["[🥚]", "[🐣]", "[🐥]", "[🍳]", "[🐔]"];
const ID_CODE_PREFIX_LEN = 4;
const ID_CODE_DISPLAY_LEN = 9;
const ID_CODE_DISPLAY_END_INDEX = ID_CODE_DISPLAY_LEN + ID_CODE_PREFIX_LEN;
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
 *
 * @param {Event} _event
 */
function onClickPlusPlus(_event) {
  let parent = this?.parentElement?.parentElement;
  let author = parent?.querySelector("div.author > strong");
  let text = parent?.querySelector("div.text");
  let postId = text?.querySelector("span > a").innerText;
  let htmlContent = "";
  text?.querySelectorAll("p").forEach((p) => {
    // Hidden for unpopularity
    if (!p.getAttribute("class")) {
      htmlContent += p.innerHTML;
    }
  });
  let post = {
    authorName: author.innerText,
    authorCode: author.getAttribute("title").substring(4),
    postId,
    htmlContent,
  };
  let postStore = IDB.transaction("posts", "readwrite").objectStore("posts");
  postStore.put(post);
}

function onCommentLinkClick(event) {
  let dataId = this.getAttribute("data-id");
  let commentId = "#jandan-tucao-" + dataId;
  // Delay the event handler logic so that Jandan's original script gets executed first,
  // this does not block the execution of current method though
  setTimeout(() => {
    const commentDiv = document.querySelector(commentId);
    const submitBtn = commentDiv?.querySelector(
      "div.tucao-form > div > button"
    );
    const content = commentDiv?.querySelector(
      "div.tucao-form > textarea.tucao-content"
    );
    if (!submitBtn || !content) {
      console.log("Comment element not found");
      return;
    }
    submitBtn.addEventListener("click", (_event) => {
      // Perform the same check
      console.log(`Comment ${dataId}: ${content.value}`);
    });
  }, 1000);
}
