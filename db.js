let db;

function openDB() {
  return new Promise(resolve => {
    const req = indexedDB.open("senti-db", 1);
    req.onupgradeneeded = e => {
      db = e.target.result;
      db.createObjectStore("entries", { keyPath: "id", autoIncrement: true });
    };
    req.onsuccess = e => {
      db = e.target.result;
      resolve();
    };
  });
}

function addEntry(entry) {
  return new Promise(resolve => {
    const tx = db.transaction("entries", "readwrite");
    tx.objectStore("entries").add(entry);
    tx.oncomplete = resolve;
  });
}

function getAllEntries() {
  return new Promise(resolve => {
    const tx = db.transaction("entries", "readonly");
    const req = tx.objectStore("entries").getAll();
    req.onsuccess = () => resolve(req.result);
  });
      }
