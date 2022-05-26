const PAN = "[🍳]";
console.log(`${PAN} Generating UI elements`);

function saveBtn() {
  let saveBtn = document.createElement("a");
  let saveBtnInnerSpan = document.createElement("span");
  saveBtnInnerSpan.setAttribute("class", "zan-text");
  saveBtnInnerSpan.append("Save");
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

// This button saves current page as MHTML
const SAVE_BUTTON = saveBtn();

