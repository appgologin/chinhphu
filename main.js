const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { main } = require('./app');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('start-process', async(event, { proxy, userList }) => {
    try {
        const results = await main(proxy, userList);
        results.forEach(result => {
            event.reply('user-result', result);
        });
        event.reply('process-completed', 'Quá trình hoàn tất');
    } catch (error) {
        event.reply('process-error', error.message);
    }
});