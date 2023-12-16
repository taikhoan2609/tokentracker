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

// Function for sum up Amount and Volume
function sumCal(arr, key) {
  return arr.reduce((acc, cur) => {
    return acc + Number(cur[`${key}`]);
  }, 0);
}
dataFetch().then((priceArr) => {
  // Function for cal total Volume
  const buyOrder = historyArr.filter((item) => item.order === true);
  const totalVol = buyOrder.reduce(
    (arr, cur) => Number(arr) + Number(cur.volume),
    0
  );
  document.querySelector(
    "#total-vol"
  ).innerHTML = `Total Capital: $${totalVol.toFixed(2)}`;

  const portTable = document.querySelector("#portfolio-table");
  // Convert 1 array of many objects into 1 object
  // const action = function () {
  console.log(compArr);
  compArr.forEach(async function (item) {
    const calDcaPrice = () => {};
    const token = {
      id: item[0].id,
      thumb: item[0].thumb,
      symbol: item[0].symbol,
      amount: sumCal(item, "amount"),
      volume: sumCal(item, "volume") > 0 ? sumCal(item, "volume") : 0,
      // Sell ko ảnh hưởng giá dca
      dcaPrice: function () {
        const buyOrder = item.filter((order) => order.order === true);
        const totalBuyVolume = buyOrder.reduce(
          (acc, cur) => acc + cur.volume,
          0
        );
        const totalBuyAmount = buyOrder.reduce(
          (acc, cur) => acc + cur.amount,
          0
        );
        if (this.volume == 0) {
          return (this.dcaPrice = 0);
        }
        return (this.dcaPrice = totalBuyVolume / totalBuyAmount);
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

    tokenArr.forEach((item, index) => {
      // Delete Item
      const deleteToken = (symbol) => {
        console.log("clicked");
        const updateHistoryArr = historyArr.filter(
          (item) => item.symbol !== symbol
        );
        localStorage.setItem("historyArr", JSON.stringify(updateHistoryArr));
        window.location.reload();
      };

      if (item.amount !== 0) {
        const div = document.createElement("div");
        div.classList.add(
          "row",
          "item",
          "my-2",
          "align-items-center",
          "each-token"
        );
        div.innerHTML = `
        <div class="col">${index}</div>
        <div class="col-2"><img
        class="thumb"
        src=${item.thumb}
        alt="token"
        />${item.symbol}</div>
        <div class="col">${item.volume.toFixed(1)}</div>
        <div class="col-2">${parseFloat(Number(item.dcaPrice).toFixed(4))}</div>
        <div class="col">${parseFloat(Number(item.curPrice()).toFixed(4))}</div>
        <div class="col-2">${parseFloat(Number(item.amount).toFixed(3))}</div>
        <div class="col">${parseFloat(Number(item.profit).toFixed(2))}</div>
        <div class="col">${parseFloat(item.proportion.toFixed(2))}%</div>
        
        </div>`;
        // <div class="col button-placeholder"></div>
        const deleteButton = document.createElement("button");
        deleteButton.classList.add(
          "col",
          "delete-button",
          "bg-danger",
          "text-white"
        );
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function () {
          deleteToken(item.symbol);
        });
        div.appendChild(deleteButton);
        // const deleteButtonHTML = deleteButton.outerHTML;

        portTable.appendChild(div);
        // document.querySelector(".button-placeholder").innerHTML =
        //   deleteButtonHTML;
        // document.querySelector(".button-placeholder").appendChild(deleteButton);
      }
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
      document.querySelectorAll(".item :nth-child(7)")
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
