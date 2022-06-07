// The IndexedDB instance
let IDB;
const DB_VERSION = 1;
// IndexedDB open request
const IDBREQ = indexedDB.open("jandan", DB_VERSION);

IDBREQ.onerror = (event) => {
  console.error(IDBREQ.error);
};

IDBREQ.onsuccess = (event) => {
  IDB = IDBREQ.result;
  IDB.onversionchange = () => {
    IDB.close();
    console.log(`${EGGS[2]} IndexedDB instance must be closed now`);
  };
};

IDBREQ.onupgradeneeded = (event) => {
  let idb = event.target.result;
  idb.onerror = () => {
    console.log(`${EGGS[2]} Failed to upgrade IndexedDB v${DB_VERSION}`);
  };
  let postStore = idb.createObjectStore("posts", { keyPath: "postId" });
  postStore.createIndex("code", "authorCode", { unique: false });
  postStore.createIndex("name", "authorName", { unique: false });
};
