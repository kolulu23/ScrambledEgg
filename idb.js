// The IndexedDB instance
let IDB;
const DB_NAME = "jandan";
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
    console.log(`${EGGS[1]} Upcoming version change, closing idb`);
  };
  console.log(`${EGGS[1]} Idb has been opened with the name of ${DB_NAME}`);
};

// We don't have version changes very often for now
IDBREQ.onupgradeneeded = (event) => {
  let idb = event.target.result;
  idb.onerror = () => {
    console.log(`${EGGS[1]} Failed to upgrade idb v${DB_VERSION}`);
  };
  if (!idb.objectStoreNames.contains("posts")) {
    let postStore = idb.createObjectStore("posts", { keyPath: "postId" });
    postStore.createIndex("code", "authorCode", { unique: false });
    postStore.createIndex("name", "authorName", { unique: false });
  }
  if (!idb.objectStoreNames.contains("comments")) {
    let postStore = idb.createObjectStore("comments", { autoIncrement: true });
    postStore.createIndex("op", "opName", { unique: false });
    postStore.createIndex("postId", "postId", { unique: false });
    postStore.createIndex("date", "date", { unique: false });
  }
};
