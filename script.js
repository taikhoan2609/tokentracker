"use strict";
// Declare shorthand
const historyArr = getFromStorage("historyArr") || [];
const compArr = getFromStorage("compArr") || [];
const tokenArr = getFromStorage("tokenArr") || [];

//
historyArr.forEach((historyItem) => {
  if (historyItem.count == 1) {
    const itemArr = [];
    itemArr.push(historyItem);
    compArr.push(itemArr);
    console.log(compArr);
  } else {
    const compIndex = compArr.findIndex(
      (compItem) => compItem[0].id == historyItem.id
    );
    compArr[compIndex].push(historyItem);
  }
});

console.log(compArr);

// CONVERT ALL ARRAY IN COMPARR INTO OBJECT
// Function for Current Price
async function dataFetch(id) {
  const result = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`)
    .then((res) => res.json())
    .then((token) => token.market_data.current_price.usd);
  return result;
}
// Function for sum up Amount and Volume
function sumCal(arr, key) {
  return arr.reduce((acc, cur) => {
    return acc + Number(cur[`${key}`]);
  }, 0);
}

// Function for cal total Volume
const totalVol = historyArr.reduce(
  (arr, cur) => Number(arr) + Number(cur.volume),
  0
);
document.querySelector("#total-vol").innerHTML = `Total Capital: $${totalVol}`;

const portTable = document.querySelector("#portfolio-table");
// Convert 1 array of many objects into 1 object
// const action = function () {
compArr.forEach(async function (item) {
  const token = {
    id: item[0].id,
    thumb: item[0].thumb,
    symbol: item[0].symbol,
    volume: sumCal(item, "volume"),
    amount: sumCal(item, "amount"),
    dcaPrice: function () {
      return (this.dcaPrice = this.volume / this.amount);
    },
    curPrice: await dataFetch(`${item[0].id}`),
    profit: function () {
      return (this.profit = (this.curPrice - this.dcaPrice) * this.amount);
    },
    proportion: function () {
      return (this.proportion = (this.volume / totalVol) * 100);
    },
  };
  token.proportion();
  token.dcaPrice();
  token.profit();
  tokenArr.push(token);
  console.log(tokenArr);
  portTable.innerHTML = "";
  tokenArr.forEach((item) => {
    const div = document.createElement("div");
    div.classList.add("row", "item");
    div.innerHTML = `<div class="col"><img
    class="thumb"
    src=${item.thumb}
    alt="token"
  />${item.symbol}</div>
      <div class="col">${item.volume}</div>
      <div class="col">${parseFloat(Number(item.dcaPrice).toFixed(4))}</div>
      <div class="col">${parseFloat(Number(item.curPrice).toFixed(4))}</div>
      <div class="col">${parseFloat(Number(item.profit).toFixed(2))}</div>
      <div class="col">${parseFloat(item.proportion.toFixed(2))}%</div>`;
    portTable.appendChild(div);
  });
  const totalProfit = tokenArr.reduce((arr, cur) => arr + cur.profit, 0);
  console.log(totalProfit);
  document.querySelector(
    "#total-balance"
  ).innerHTML = `Current balance: $${parseFloat(
    Number(totalVol + totalProfit).toFixed(2)
  )}`;
  document.querySelector("#total-pnl").innerHTML = `Total PnL: $${parseFloat(
    Number(totalProfit).toFixed(2)
  )}`;
  // Add color for profit
  const itemArr = Array.from(document.querySelectorAll(".item :nth-child(5)"));
  itemArr.forEach((item) => {
    if (Number(item.innerHTML) > 0) {
      item.classList.add("buy");
    } else if (Number(item.innerHTML) < 0) {
      item.classList.add("sell");
    }
  });
});
