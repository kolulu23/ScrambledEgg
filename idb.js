const idb = indexedDB.open("jandan", 1);

idb.onupgradeneeded = (event) => {
  console.log(event);
};

idb.onerror = (event) => {
  console.error(idb.error);
};

idb.onsuccess = (event) => {
  let db = idb.result;
  db.onversionchange = function () {
    db.close();
    console.log(`${EGGS[2]} IndexedDB instance must be closed now`);
  };
};
