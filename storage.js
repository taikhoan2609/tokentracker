function saveToStorage(key, item) {
  localStorage.setItem(key, JSON.stringify(item));
}

function getFromStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}
