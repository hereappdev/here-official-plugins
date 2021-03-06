const _ = require("underscore");
const pref = require("pref");
const http = require("http");
const net = require("net");

function updateData() {
    const LIMIT = 10;

    var data = new Date();
    var todayIso = data.toISOString().split("T")[0];
    var apiUrl = "";
    var apiToken = "";

    const json = pref.all();
    if (json == undefined) {
        console.log("No prefs found.");
    }

    // console.log(`json: ${JSON.stringify(json)}`)

    apiUrl = json.apiUrl;

    if (json.apiToken != undefined) {
        apiToken = json.apiToken;
    } else {
        here.miniWindow.data = {
            title: "No API token found",
            detail: "MS App Center",
        };
        here.miniWindow.reload();
        return;
    }

    here.miniWindow.data.title = "Updating…";
    here.miniWindow.reload();

    http.request({
        url: `${apiUrl}${todayIso}`,
        method: "GET",
        headers: {
            accept: "application/json",
            "X-API-Token": apiToken,
        },
    }).then(function (response) {
        const json = response.data;
        // console.log(`JSON: ${JSON.stringify(json)}`)
        const entryList = json.events[0];

        if (entryList == undefined) {
            here.miniWindow.set({ title: "Invalid data.", detail: "MS App Center" });
            return;
        }

        if (entryList.length <= 0) {
            here.miniWindow.set({ title: "Entrylist is empty.", detail: "MS App Center" });
            return;
        }

        if (entryList.length > LIMIT) {
            entryList = entryList.slice(0, LIMIT);
        }

        // Mini Window
        here.miniWindow.data = {
            title: "Device Count(" + todayIso + ")",
            detail: "MS App Center",
            accessory: {
                title: entryList.device_count.toString(),
            },
            onClick: () => {
                here.openURL("https://appcenter.ms/");
            },
        };
        here.miniWindow.reload();

        // Popover
        here.popover.data = _.map(entryList, (entry, key) => {
            return {
                title: key.toString(),
                accessory: {
                    title: entry.toString(),
                },
            };
        });
        here.popover.reload();
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
