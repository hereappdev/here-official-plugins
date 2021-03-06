const _ = require("underscore");
const http = require("http");
const pref = require("pref");
const net = require("net");

function updateData() {
    // Stock code sample

    // gb_aapl Apple
    // gb_googl Google

    // hk00700 Tencent
    // hk09988 Alibaba

    // sh600519 贵州茅台
    // sh601398 工商银行

    // sz300750 宁德时代
    // sz300418 昆仑万维

    var stockCode = "gb_aapl";
    var stockName = "Apple Inc.";

    here.miniWindow.data = { title: "Updating…" };
    here.miniWindow.reload();

    const json = pref.all();
    if (json == undefined) {
        console.log("No prefs found.");
    }

    if (json["stockCode"] != undefined) {
        stockCode = json["stockCode"].toLowerCase();
    }
    if (json["stockName"] != undefined) {
        stockName = json["stockName"];
    }

    http.request(`https://hq.sinajs.cn/list=${stockCode}`)
        .then((response) => {
            const json = response.data;
            if (json == undefined) {
                console.error("JSON result undefined");
                return;
            }

            console.verbose(json);

            var arr = json.split(",");
            var arrIndex = [];

            console.verbose(stockCode.substring(0, 2));

            switch (stockCode.substring(0, 2)) {
                case "gb":
                    arrIndex = [1, 2, 4, 5, 26, 24];
                    break;
                case "hk":
                    arrIndex = [9, 8, 7, 3, 4, 17];
                    break;
                case "sz" || "sh":
                    arr[10] = arr[3] - arr[2];
                    arr[11] = (arr[10] / arr[2]) * 100;
                    arrIndex = [3, 11, 10, 2, 3, 30];
                    break;
                default:
                    arr[10] = arr[3] - arr[2];
                    arr[11] = (arr[10] / arr[2]) * 100;
                    arrIndex = [3, 11, 10, 2, 3, 30];
                    break;
            }

            const curPrice = Number(arr[arrIndex[0]]).toFixed(2);
            const percentage = (arr[arrIndex[1]] < 0 ? "" : "+") + Number(arr[arrIndex[1]]).toFixed(2) + "%";
            const diff = (arr[arrIndex[2]] < 0 ? "" : "+") + Number(arr[arrIndex[2]]).toFixed(2);
            const open = Number(arr[arrIndex[3]]).toFixed(2);
            const previousClose = Number(arr[arrIndex[4]]).toFixed(2);
            const date = arr[arrIndex[5]];

            let popovers = [];

            popovers.push(
                {
                    title: "Current Price",
                    accessory: {
                        title: curPrice,
                    },
                },
                {
                    title: "Rise Percent",
                    accessory: {
                        title: percentage,
                    },
                },
                {
                    title: "Rise",
                    accessory: {
                        title: diff,
                    },
                },
                {
                    title: "Open",
                    accessory: {
                        title: open,
                    },
                },
                {
                    title: "Previous Close",
                    accessory: {
                        title: previousClose,
                    },
                },
                {
                    title: "Date",
                    accessory: {
                        title: date,
                    },
                }
            );

            // Menu Bar
            here.menuBar.data = {
                title: curPrice,
                detail: percentage,
            };
            // Set menu bar icon based on + / - 
            if(percentage.indexOf("+") != -1){
                here.menuBar.setIcon("./menuBarIcon.png")

            }else{
                here.menuBar.setIcon("./menuBarIcon-down.png")
            }

            here.menuBar.reload();

            // Mini Window
            here.miniWindow.data = {
                title: stockName,
                detail: diff,
                accessory: {
                    title: curPrice,
                    detail: percentage,
                },
            };
            here.miniWindow.reload();

            // popover
            here.popover.data = popovers;
            here.popover.reload();

            // Dock
            here.dock.data = {
                title: curPrice,
                detail: percentage,
            };
            here.dock.reload();
        })
        .catch((error) => {
            console.error("Error: " + JSON.stringify(error));
        });
}

here.on("load", () => {
    updateData();
    // Update every 2 hours
    setInterval(updateData, 2 * 3600 * 1000);
});

net.onChange((type) => {
    console.verbose("Connection type changed:", type);
    if (net.isReachable()) {
        updateData();
    }
});
