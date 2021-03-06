const i18n = require('i18n')
const hotkey = require("hotkey");

here.on("load", () => {
    // Mini Window
    here.miniWindow.data = {
        title: __("Screen Saver"),
        detail: __("Click to turn on"),
    };

    here.miniWindow.data.accessory = new here.SwitchAccessory({
        isOn: false,
        onValueChange: (isOn) => {
            here.exec(`open -a ScreenSaverEngine`);
        },
    });

    here.miniWindow.reload();

    // Menu Bar
    here.menuBar = new MenuBar();
    here.menuBar.onClick(() => {
        here.exec(`open -a ScreenSaverEngine`);
    });

    here.menuBar.reload();

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
