"use strict";

// Declare shorthand
const historyArr = getFromStorage("historyArr") || [];
const compArr = [];
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

const idsArr = compArr.map((coinArr) => {
  return coinArr[0].id;
});
console.log(idsArr);
let idsParam = "";
idsArr.forEach((id) => {
  idsParam = idsParam.concat(`${id}%2C`);
});
console.log(idsParam);

// saveToStorage("compArr", compArr);

// CONVERT ALL ARRAY IN COMPARR INTO OBJECT
// Function for Current Price
let priceArr = [];
async function dataFetch(id) {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${idsParam}&vs_currencies=usd`
    );
    // setTimeout(() => {}, 2000);

    const data = await res.json();
    priceArr = Object.entries(data).map(([key, value]) => ({
      [key]: value,
    }));

    // console.log(priceArr);

    // const price = data.market_data.current_price.usd;
    return priceArr;
  } catch (err) {
    console.log(err.message);
  }
}

dataFetch().then((priceArr) => {
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
  document.querySelector(
    "#total-vol"
  ).innerHTML = `Total Capital: $${totalVol}`;

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

      curPrice: function () {
        const tokenInPriceArr = priceArr.find((item) => {
          const tokenIdArr = Object.getOwnPropertyNames(item);
          // console.log(tokenIdArr);
          const tokenId = tokenIdArr[0];
          return tokenId === this.id;
        });
        // console.log(tokenInPriceArr);
        return tokenInPriceArr[`${this.id}`].usd;
      },

      profit: function () {
        return (this.profit = (this.curPrice() - this.dcaPrice) * this.amount);
      },
      proportion: function () {
        return (this.proportion = (this.volume / totalVol) * 100);
      },
    };

    token.proportion();
    token.dcaPrice();

    token.profit();

    tokenArr.push(token);
    // console.log(tokenArr);
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
      <div class="col">${parseFloat(Number(item.curPrice()).toFixed(4))}</div>
      <div class="col">${parseFloat(Number(item.profit).toFixed(2))}</div>
      <div class="col">${parseFloat(item.proportion.toFixed(2))}%</div>`;
      portTable.appendChild(div);
    });

    // Taoj total profit overview
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
    const itemArr = Array.from(
      document.querySelectorAll(".item :nth-child(5)")
    );
    itemArr.forEach((item) => {
      if (Number(item.innerHTML) > 0) {
        item.classList.add("buy");
      } else if (Number(item.innerHTML) < 0) {
        item.classList.add("sell");
      }
    });
  });
});
