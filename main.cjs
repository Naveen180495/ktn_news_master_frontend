const { app, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');

let mainWindow;
let javaProcess;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // In production, we load the built Svelte files
    mainWindow.loadFile(path.join(app.getAppPath(), 'build', 'index.html'));
}

app.whenReady().then(() => {
    // 1. Start the Java Backend (The Sidecar)
    // We assume the JAR is named 'backend.jar' and placed in the same folder
    javaProcess = exec('java -jar backend.jar', (err) => {
        if (err) console.error("Java failed to start:", err);
    });

    createWindow();
});

// Kill the Java process when the app closes
app.on('window-all-closed', () => {
    if (javaProcess) javaProcess.kill();
    if (process.platform !== 'darwin') app.quit();
});