"use strict";
const historyArr = getFromStorage("historyArr") || [];

// Khai bao shorthand
const saveBtn = document.querySelector("#btn-save");
const searchInput = document.querySelector("#search-input");
const priceInput = document.querySelector("#init-price");
const volInput = document.querySelector("#volume");

let tokenAdded = {};

// Fetch data coin search
const coinSearch = async function (coin) {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/search?query=${coin}`
  );
  const data = await res.json();
  console.log(data);
  return data;
};
let searchArrCopy = [];

// Input event listener (Select token)
document
  .querySelector("#search-input")
  .addEventListener("keyup", async function () {
    document.querySelector(".search-result").innerHTML = "";

    if (searchInput.value.length == 0) {
    } else {
      const result = await coinSearch(searchInput.value);
      const searchArr = result.coins.filter(
        await function (item) {
          return item.symbol
            .toLowerCase()
            .includes(searchInput.value.toLowerCase());
        }
      );
      console.log(searchArr);
      searchArrCopy = searchArr;
      searchArr.forEach((item) => {
        const liTag = document.createElement("li");
        liTag.innerHTML = `
      <img
        class="thumb"
        src=${item.thumb}
        alt="token"
      />${item.symbol}
    `;
        liTag.setAttribute("onclick", `selectToken('${item.id}')`);
        document.querySelector(".search-result").appendChild(liTag);
      });
      console.log(searchArrCopy);
    }
  });

// Select token handler
const selectToken = function (itemId) {
  if (historyArr.some((item) => item.id == itemId)) {
    alert("Token existed! Please choose another token OR edit token");
    saveBtn.setAttribute("disabled", "");
  } else {
    const index = searchArrCopy.findIndex((item) => item.id == itemId);
    const tokenSelected = searchArrCopy[index];
    searchInput.value = tokenSelected.symbol;
    document.querySelector(".search-result").innerHTML = "";
    tokenAdded.id = tokenSelected.id;
    tokenAdded.symbol = tokenSelected.symbol;
    tokenAdded.thumb = tokenSelected.thumb;
  }
};

// Create condition to allow save button
saveBtn.setAttribute("disabled", "");
document.addEventListener("change", function () {
  if (
    searchInput.value.length &&
    priceInput.value.length &&
    volInput.value.length !== 0
  ) {
    saveBtn.removeAttribute("disabled");
  }
});

// SAVE button handler
saveBtn.addEventListener("click", function () {
  //  shallow copy object
  const newToken = { ...tokenAdded };
  const d = new Date();
  newToken.date = `${d.getDate()}-${d.getMonth()}-${d.getFullYear()}`;
  newToken.count = 1;
  newToken.price = priceInput.value;
  newToken.order = true;
  newToken.volume = Number(volInput.value);
  newToken.amount = function () {
    return (this.amount = this.volume / this.price);
  };
  console.log(newToken.order);

  newToken.amount();
  console.log(newToken);
  historyArr.push(newToken);
  console.log(historyArr);
  saveToStorage("historyArr", historyArr);
  document.querySelectorAll("input").forEach((item) => (item.value = ""));
});
