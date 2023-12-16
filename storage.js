function saveToStorage(key, item) {
  localStorage.setItem(key, JSON.stringify(item));
}

function getFromStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}

// export const key =
//   "59eb5d5ca5515338744f9f8aeecd1d5c9075219d947e6757a3bfde80abd3d1e1";
