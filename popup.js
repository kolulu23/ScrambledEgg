let userInfo = document.querySelector("#userInfo");
let searchBtn = document.querySelector("#searchBtn");
let searchKeyword = document.querySelector("#searchKeyword");
const COOKIE_PATTERN = "comment_author_";
const COOKIE_PATTERN_EMAIL = "comment_author_email";

function getUserInfo(cookies) {
  let info = {
    username: "",
    email: "",
    code: "",
  };
  cookies
    .filter((cookie) => cookie.name.startsWith(COOKIE_PATTERN))
    .forEach((cookie) => {
      if (cookie.name?.startsWith(COOKIE_PATTERN_EMAIL)) {
        info.email = decodeURIComponent(cookie.value);
      } else {
        info.username = decodeURIComponent(cookie.value);
        info.code = cookie.name.substring(COOKIE_PATTERN.length);
      }
    });
  chrome.storage.local.set({ ...info });
  return info;
}

async function getJandanCookies(_event) {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let url = new URL(tab?.url);
  let domain = url.hostname;
  let cookies = await chrome.cookies.getAll({ domain });
  if (cookies.length === 0) {
    userInfo.textContent = `No cookies found for ${domain}. \nThis might not be a valid Jandan domain.`;
  } else {
    let info = getUserInfo(cookies);
    userInfo.append(`username: ${info.username}`);
    userInfo.appendChild(document.createElement("br"));
    userInfo.append(`email: ${info.email}`);
    userInfo.appendChild(document.createElement("br"));
    userInfo.append(`code: ${info.code}`);
  }
}

function searchPost(event) {
  event.preventDefault();
  console.log(`TODO ${searchKeyword.value}`);
}

window.addEventListener("DOMContentLoaded", getJandanCookies);
searchBtn.addEventListener("click", searchPost);
