const hotkey = require("hotkey");

here.on("load", () => {
    // Mini Window
    here.miniWindow.data = {
        title: "Screen Saver",
        detail: "Click to Start",
    };
    here.miniWindow.onClick(function () {
        here.exec(`open -a ScreenSaverEngine`).then(() => {
            console.log("Done.");
        });
    });
    here.miniWindow.reload();

    // Bind hotkey
    const aHotKey = ["cmd", "shift", "esc"];
    let aID = hotkey.bind(aHotKey, () => {
        // console.log("hot key fired!")
        here.exec(`open -a ScreenSaverEngine`);
    });

    if (aID == undefined) {
        console.error("Failed to register hotkey.");
    }
});
