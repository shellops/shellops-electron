const { app, BrowserWindow } = require("electron");
const path = require("path");
const express = require("express");
const getPort = require("get-port");

const STATIC = path.resolve(__dirname, "../public");
const INDEX = path.resolve(STATIC, "index.html");

const server = express();

// Static content
server.use(express.static(STATIC));

// All GET request handled by INDEX file
server.get("*", function (req, res) {
  res.sendFile(INDEX);
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = async () => {
  const PORT = await getPort();
  const URL = `http://localhost:${PORT}`;
  // Start server
  server.listen(PORT, async () => {
    console.log("Server up and running on ", URL);
    // Create the browser window.
    const mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: true,
        nativeWindowOpen: true,
        allowRunningInsecureContent:true,
      },
    });

    
    mainWindow.webContents.session.setCertificateVerifyProc((request, callback) => {
      const { hostname } = request
      if (hostname === 'example.com') { //this is blind trust, however you should use the certificate, valdiatedcertifcate, verificationresult as your verification point to call callback
        callback(0); //this means trust this domain
      } else {
        callback(-3); //use chromium's verification result
      }
    })
    // and load the index.html of the app.
    mainWindow.loadURL(URL);
    // mainWindow.webContents.openDevTools({ mode: "undocked" });
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
