// Silly log severity emoji mappings
const EGGS = ["[🥚]", "[🐣]", "[🐥]", "[🍳]", "[🐔]"];
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
 * Inject `++` into post list like `/pic` and `/treehole`
 */
function saveInPostList() {
  const postList = document.querySelectorAll("#comments > ol > li");
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
  // TODO handle images
  console.log({
    authorName: author.innerText,
    authorCode: author.getAttribute("title").substring(4),
    postId,
    htmlContent,
  });
}

function onCommentLinkClick(_event) {
  let dataId = this.getAttribute("data-id");
  let commentId = "#jandan-tucao-" + dataId;
  const commentDiv = document.querySelector(commentId);
  if (!commentDiv) {
    // Comment not created yet
    return;
  }
  const submitBtn = commentDiv.querySelector("div.tucao-form > div > button");
  const content = commentDiv.querySelector(
    "div.tucao-form > textarea.tucao-content"
  );
  if (!submitBtn || !content) {
    // TODO How do I get noticed when the button is generated?
    console.log("Comment element not found");
    return;
  }
  submitBtn.addEventListener("click", (_event) => {
    // Perform the same check
    console.log(`Comment ${dataId}: ${content.textContent}`);
  });
}
