let db;

function openDB() {
  return new Promise((resolve) => {
    const request = indexedDB.open("senti", 1);

    request.onupgradeneeded = () => {
      db = request.result;
      db.createObjectStore("entries", { keyPath: "id", autoIncrement: true });
    };

    request.onsuccess = () => {
      db = request.result;
      resolve();
    };
  });
}

function addEntry(entry) {
  const tx = db.transaction("entries", "readwrite");
  tx.objectStore("entries").add(entry);
}

function getAllEntries() {
  return new Promise((resolve) => {
    const tx = db.transaction("entries", "readonly");
    const req = tx.objectStore("entries").getAll();
    req.onsuccess = () => resolve(req.result);
  });
                     }
