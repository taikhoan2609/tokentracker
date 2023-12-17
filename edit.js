"use strict";
const historyArr = getFromStorage("historyArr") || [];

// Khai bao shorthand
const tokenInput = document.querySelector("#select-token");
const orderInput = document.querySelector("#select-order");
const priceInput = document.querySelector("#select-price");
const volInput = document.querySelector("#select-volume");
const historyTable = document.querySelector("#order-history");
const addBtn = document.querySelector("#add-btn");
const saveBtn = document.querySelector("#save-btn");
const cancelBtn = document.querySelector("#cancel-btn");
const editBtn = document.querySelector("#edit-btn");
const deletelBtn = document.querySelector("#delete-btn");
const myForm = document.querySelector("#myform");
const volumeLabel = document.querySelector(".volume-label");

// User choose the token and render table
const option = document.createElement("option");
option.innerHTML = "----";
tokenInput.appendChild(option);
historyArr.forEach((item) => {
  if (item.count == 1) {
    const option = document.createElement("option");
    option.innerHTML = `${item.symbol}`;
    tokenInput.appendChild(option);
  }
});

// Create function to render table
let totalVolume;
let currentTokenAmount;
let quickInput;
function renderHistory(tokenName) {
  historyTable.innerHTML = "";
  const filterArr = historyArr.filter(
    (item) => item.symbol == tokenInput.value
  );

  // Thêm mục hiển thị current token amount
  const totalAmount = filterArr.reduce((acc, cur) => acc + cur.amount, 0);
  currentTokenAmount = totalAmount;
  document.querySelector(
    ".total-token"
  ).innerHTML = `Current amount: ${totalAmount.toFixed(3)} ${tokenName}`;

  // Tính tổng volume đã ape in của 1 token
  const totalVol = filterArr.reduce((acc, cur) => acc + cur.volume, 0);
  console.log(totalVol);
  totalVolume = totalVol;

  console.log(filterArr);
  filterArr.forEach((item) => {
    const div = document.createElement("div");
    div.classList.add("row", "item", "align-items-center");
    div.innerHTML = `
            <div class="col">${item.date}</div>
            <div class="col"><img
            class="thumb"
            src=${item.thumb}
            alt="token"
          />${item.symbol}</div>
            <div class="col">${item.order ? "Buy" : "Sell"}</div>
            <div class="col">${item.volume}</div>
            <div class="col">${item.price}</div>
            <div class="col"><img
            class="thumb"
            src=${item.thumb}
            alt="token"
          />${Number(item.amount).toFixed(4)}</div>
            <div class="col-2 d-flex gap-2">
              <button id="edit-btn" onclick="editOrder('${item.count}', '${
      item.id
    }')" class="btn btn-primary col">Edit</button>
              <button id="delete-btn" onclick="deleteOrder('${item.count}', '${
      item.id
    }','${item.symbol}')" class="btn btn-warning col">
                Delete
              </button>
            </div>
          `;
    historyTable.appendChild(div);
    orderColor();
    amountColor();
    volumeColor();
  });
}

// Tùy biến theo lệnh Sell
orderInput.addEventListener("change", () => {
  console.log(orderInput.value);
  if (orderInput.value === "Sell") {
    console.log(orderInput.value === "Sell");
    document.querySelector(".quick-input").removeAttribute("hidden");
    volumeLabel.innerHTML = "Token Amount:";
  } else {
    document.querySelector(".quick-input").setAttribute("hidden", "");
    volumeLabel.innerHTML = "USD Volume:";
  }
});

document.querySelector(".sell50").addEventListener("click", () => {
  quickInput = currentTokenAmount / 2;
  volInput.value = `${currentTokenAmount / 2}`;
});
document.querySelector(".sell100").addEventListener("click", () => {
  quickInput = currentTokenAmount;
  volInput.value = `${currentTokenAmount}`;
});

// Render table when selecting token
tokenInput.addEventListener("change", function () {
  renderHistory(tokenInput.value);
});

// Make volume negative/positive
function volumeColor() {
  document.querySelectorAll(".item :nth-child(4)").forEach((item) => {
    if (Number(item.innerHTML) > 0) {
      item.innerHTML = `$${Number(item.innerHTML).toFixed(2)}`;
      item.classList.add("buy");
    } else if (Number(item.innerHTML) < 0) {
      item.innerHTML = `-$${(Number(item.innerHTML) * -1).toFixed(2)}`;
      item.classList.add("sell");
    }
  });
}

// Make color for order Type
function amountColor() {
  document.querySelectorAll(".item :nth-child(6)").forEach((item) => {
    if (Number(item.innerHTML) > 0) {
      item.innerHTML = `$${Number(item.innerHTML).toFixed(4)}`;
      item.classList.add("buy");
    } else if (Number(item.innerHTML) < 0) {
      item.innerHTML = `-$${(Number(item.innerHTML) * -1).toFixed(4)}`;
      item.classList.add("sell");
    }
  });
}

// Make color and display number for Amount column
function orderColor() {
  document.querySelectorAll(".item :nth-child(3)").forEach((item) => {
    if (item.innerHTML == "Buy") {
      item.classList.add("buy");
    } else if (item.innerHTML == "Sell") {
      item.classList.add("sell");
    }
  });
}

// ADD ORDER
// Check condition and alert error

// Disable "Save changes" & "Cancel button" (only for edit purpose)
saveBtn.setAttribute("disabled", "");
cancelBtn.setAttribute("disabled", "");

// Start listening to Add Order Button
addBtn.addEventListener("click", function () {
  if (
    tokenInput.value == tokenInput.firstElementChild.value ||
    orderInput.value == orderInput.firstElementChild.value ||
    priceInput.value.length == 0 ||
    volInput.value.length == 0
  ) {
    return alert("Please fill all the empty blank");
  }

  if (orderInput.value == "Sell" && volInput > currentTokenAmount) {
    return alert("Số lượng token bán vượt số lượng bạn đang có");
  }
  // Buy order
  const index = historyArr.findLastIndex(
    (item) => item.symbol == tokenInput.value
  );
  const newOrder = { ...historyArr[index] };
  const d = new Date();
  newOrder.date = `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
  newOrder.order = orderInput.value == "Buy" ? true : false;
  newOrder.count++;
  newOrder.price = Number(priceInput.value);
  newOrder.volume = newOrder.order
    ? Number(volInput.value)
    : Number(volInput.value) * Number(priceInput.value) * -1;
  // newOrder.amount = function () {
  //   return Number((this.amount = this.volume / this.price));
  // };
  newOrder.amount =
    orderInput.value == "Buy"
      ? Number(newOrder.volume / newOrder.price)
      : Number(volInput.value * -1);
  console.log(newOrder.amount);
  historyArr.push(newOrder);
  renderHistory(newOrder.symbol);
  orderColor();
  document.querySelector("form").reset();
  saveToStorage("historyArr", historyArr);
});

// EDIT ORDER (use onclick)

// onclick edit function (display data onto form)
const editOrder = function (itemCount, itemId) {
  // Enable "Save changes" & "Cancel button" and Disable "Add order"
  saveBtn.removeAttribute("disabled");
  cancelBtn.removeAttribute("disabled");
  addBtn.setAttribute("disabled", "");
  // Display value on Edit Order form
  const index = historyArr.findIndex(
    (item) => item.count == itemCount && item.id == itemId
  );
  tokenInput.setAttribute("disabled", "");
  console.log(historyArr[index]);
  // Display token
  document.querySelectorAll("option").forEach((option) => {
    if (option.innerHTML == historyArr[index].symbol) {
      option.setAttribute("selected", "");
    }
  });
  // Display order type
  if (historyArr[index].order == true) {
    document.querySelector(".buy").setAttribute("selected", "");
  } else {
    document.querySelector(".sell").setAttribute("selected", "");
  }
  priceInput.value = historyArr[index].price;
  volInput.value = Math.abs(historyArr[index].volume);
  placeholder = index;
};

// Create a var to store the edit item
let placeholder = {};

// Event "Save changes" handler
saveBtn.addEventListener("click", function () {
  // Save new data form edited form
  const saveChanges = function () {
    // Deep copy object (NOT Change original)
    const tokenEdited = { ...historyArr[placeholder] };
    tokenEdited.order = orderInput.value == "Buy" ? true : false;
    tokenEdited.price = priceInput.value;
    tokenEdited.volume =
      tokenEdited.order == true
        ? Number(volInput.value)
        : Number(volInput.value) * Number(priceInput.value) * -1;
    tokenEdited.amount =
      orderInput.value == "Buy"
        ? Number(tokenEdited.volume / tokenEdited.price)
        : Number(volInput.value * -1);

    historyArr[placeholder] = { ...tokenEdited };
    renderHistory(historyArr[placeholder].symbol);
    amountColor();
    saveToStorage("historyArr", historyArr);
    document.querySelector("form").reset();
  };
  // Check condition and alert error
  if (
    tokenInput.value == tokenInput.firstElementChild.value ||
    orderInput.value == orderInput.firstElementChild.value ||
    priceInput.value.length == 0 ||
    volInput.value.length == 0
  ) {
    alert("Please fill all the empty blank");
  } else saveChanges();

  myForm.reset();
  document.querySelectorAll("option").forEach((option) => {
    option.removeAttribute("selected", "disabled");
  });
  addBtn.removeAttribute("disabled");
  saveBtn.setAttribute("disabled", "");
  cancelBtn.setAttribute("disabled", "");
});

// CANCEL BUTTON
cancelBtn.addEventListener("click", function () {
  myForm.reset();
  document.querySelectorAll("option").forEach((option) => {
    option.removeAttribute("selected", "disabled");
  });
  addBtn.removeAttribute("disabled");
  saveBtn.setAttribute("disabled", "");
  cancelBtn.setAttribute("disabled", "");
  tokenInput.removeAttribute("disabled");
});

// DELETE BUTTON
const deleteOrder = function (orderCount, orderId, orderSymbol) {
  const i = historyArr.findIndex(
    (item) => item.count == orderCount && item.id == orderId
  );
  console.log(i);
  console.log(historyArr[i].symbol);
  historyArr.splice(i, 1);
  renderHistory(orderSymbol);

  if (historyArr.findIndex((item) => item.id == orderId) == -1) {
    const optionArr = Array.from(document.querySelectorAll("option"));
    const index = optionArr.findIndex((item) => item.innerHTML == orderSymbol);
    document.querySelector(`#select-token :nth-child(${index + 1})`).remove();
  }
  saveToStorage("historyArr", historyArr);
};

const e = new Date();
console.log(e.getDate(), e.getMonth(), e.getFullYear());
