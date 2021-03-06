const os = require("os");
const _ = require("underscore");
const i18n = require('i18n');

function formatBytes(bytes) {
    if (bytes === 0) return "0.0K";

    const k = 1000;

    const sizes = ["B", "K", "M", "G", "T", "P", "E", "Z", "Y"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const n = bytes / Math.pow(k, i);
    const dm = n > 10 ? 0 : 1;
    return (Math.floor(n * Math.pow(10, dm)) / Math.pow(10, dm)).toFixed(dm) + sizes[i];
}

function updateMenuBar(deltain, deltaout) {
    const inStr = formatBytes(deltain) + "/s";
    const outStr = formatBytes(deltaout) + "/s";

    here.menuBar.data = {
        title: {
            text: outStr.padStart(6, " "),
            useMonospaceFont: true,
        },
        detail: {
            text: inStr.padStart(6, " "),
            useMonospaceFont: true,
        },
    };
    here.menuBar.reload();
}

function netUsage() {
    // console.log("netUsage")
    os.netStat()
        .then((json) => {
            console.verbose(json);

            const totalin = json["totalin_string"];

            // Menu Bar
            const deltain = Number(json["deltain"]);
            const deltaout = Number(json["deltaout"]);
            updateMenuBar(deltain, deltaout);

            // Mini Window
            here.miniWindow.data = {
                title: __("Network Speed"),
                detail: __("Total Download: ") + totalin,
                accessory: {
                    title: "⇣" + formatBytes(deltain),
                    detail: "⇡" + formatBytes(deltaout),
                },
            };
            here.miniWindow.reload();

            // Dock
            here.dock.data = {
                title: "⇣" + formatBytes(deltain),
                detail: "⇡" + formatBytes(deltaout),
            };
            here.dock.reload();
        })
        .catch((error) => {
            console.error(`err: ${JSON.stringify(error)}`);
            updateMenuBar(0, 0);
            here.miniWindow.set({ title: JSON.stringify(error) });
        });
}

here.on("load", () => {
    netUsage();
    setInterval(netUsage, 3000);
});
