const PAN = "[🍳]";
console.log(`${PAN} Generating UI elements`);

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
async function saveInPost() {
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
async function saveInPostList() {
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
        let postId = text?.querySelector("span > a").innerText;
        let htmlContent = "";
        text?.querySelectorAll("p").forEach((p) => {
          // Hidden for unpopularity
          if (!p.getAttribute("class")) {
            htmlContent += p.innerHTML;
          }
        });
        // TODO handle images when it's in /pic page
        console.log({
          authorName: author.innerText,
          authorCode: author.getAttribute("title").substring(4),
          postId,
          htmlContent,
        });
      });
    }
  });
}
