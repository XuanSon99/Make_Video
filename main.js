const {app, BrowserWindow, ipcMain, Menu} = require('electron')
const path = require('path')
var mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            // devTools: false,
            nodeIntegration: true,
            enableRemoteModule: true
        },
        icon: __dirname + '/icon/king.png'
    });
    mainWindow.loadFile('render/channel.html');
    mainWindow.setMenuBarVisibility(false)
    mainWindow.webContents.openDevTools()
}

let CauhoiWindow;

function openAccountInterface() {
    CauhoiWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            // devTools: false,
            nodeIntegration: true,
            enableRemoteModule: true
        },
        maxHeight: 600,
        minHeight: 600,
        maxWidth: 1000,
        minWidth: 1000,
        icon: __dirname + '/icon/king.png'
    });
    CauhoiWindow.loadFile('cauhoi.html')
    CauhoiWindow.setMenuBarVisibility(false)
    // Open the DevTools.
    CauhoiWindow.webContents.openDevTools()
}

let ChannelWindow;

function openChannelInterface() {
    ChannelWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            // devTools: false,
            nodeIntegration: true,
            enableRemoteModule: true
        },
        maxHeight: 600,
        minHeight: 600,
        maxWidth: 1000,
        minWidth: 1000,
        icon: __dirname + '/icon/king.png'
    });
    ChannelWindow.loadFile('render/channel.html')
    ChannelWindow.setMenuBarVisibility(false)
    // Open the DevTools.
    ChannelWindow.webContents.openDevTools()
}

let myIpc = require("./server/myIPC");
app.whenReady().then(() => {
    createWindow()
    var menuTemplate = [
        {
            label: 'Chức Năng',
            submenu: [
                {
                    label: 'Channel',
                    click: openChannelInterface
                },
                {
                    label: 'Thoát',
                    accelerator: 'Ctrl+Q',
                    click: function () {
                        app.quit();
                    }
                }
            ]
        },
    ];
    var menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
    myIpc(ipcMain, mainWindow, ChannelWindow);
    app.on('activate', function () {

        if (BrowserWindow.getAllWindows().length === 0) createWindow()

    })
})


app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
});

// while (!mainWindow){
//
//   // console.log({mainWindow});
//   myIpc(ipcMain, mainWindow, ChannelWindow);
// }




