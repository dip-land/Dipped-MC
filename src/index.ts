import axios from 'axios';
import { app, BrowserWindow, ipcMain, dialog, autoUpdater } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import yauzl from 'yauzl';
import { mkdirp } from 'mkdirp';
import { fabric, forge } from './static/tomate-loaders/dist/index';
import { Client, Authenticator } from 'minecraft-launcher-core';
import os from 'os';

const server = 'https://update.electronjs.org';
const feed = `${server}/dip-land/Dipped-MC/${process.platform}-${process.arch}/${app.getVersion()}`;
console.log(feed);
autoUpdater.setFeedURL({ url: feed });
autoUpdater.checkForUpdates();

const launcher = new Client();

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
declare const SECONDARY_WINDOW_WEBPACK_ENTRY: string;
declare const SECONDARY_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
if (require('electron-squirrel-startup')) {
    app.quit();
}
console.log(os.totalmem() / 2 / 1e6);
const defaultConfigPath = app.getPath('userData');
const defaultPackPath = path.join(app.getPath('userData'), 'packs');
const defaultConfig: Config = {
    configPath: defaultConfigPath,
    appPath: app.getAppPath(),
    installed: Date.now(),
    packPath: defaultPackPath,
    ram: Math.floor(os.totalmem() / 2 / 1e6 > 14000 ? 14000 : os.totalmem() / 2 / 1e6),
    packs: [],
};
let config = defaultConfig;
let window: BrowserWindow;
let loadingWindow: BrowserWindow;
const installingPacks: Array<string> = [];
//check if config exists
if (fs.existsSync(path.join(defaultConfigPath, '/config.json'))) {
    fs.readFile(path.join(defaultConfigPath, '/config.json'), (err, data) => {
        if (err) throw err;
        config = JSON.parse(data.toString());
    });
} else {
    try {
        fs.mkdirSync(defaultConfigPath);
    } catch (error) {
        console.log(error);
    }

    fs.writeFile(path.join(defaultConfigPath, '/config.json'), JSON.stringify(defaultConfig, null, 2), (err) => {
        if (err) throw err;
        console.log('Config File Created.');
    });
}

//check if key exists
if (fs.existsSync(path.join(defaultConfigPath, '/k._dmc'))) {
    fs.readFile(path.join(defaultConfigPath, '/k._dmc'), (err, data) => {
        if (err) throw err;
        console.log(JSON.parse(data.toString()));
    });
} else {
    try {
        fs.mkdirSync(defaultConfigPath);
    } catch (error) {
        console.log(error);
    }
    fs.writeFile(path.join(defaultConfigPath, '/k._dmc'), JSON.stringify({ key: null }, null, 2), (err) => {
        if (err) throw err;
        console.log('Key File Created.');
    });
}

//check if packPath exists
if (!fs.existsSync(config.packPath)) {
    fs.mkdirSync(config.packPath);
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

export interface Config {
    configPath: string;
    appPath: string;
    installed: number;
    packPath: string;
    ram: number;
    packs: Array<{ id: string; path: string }>;
}

export interface LocalPack {
    id: string;
    version: string;
    name: string;
    identifier: string;
    launcher: 'forge' | 'fabric';
    gameVersion: string;
    launcherVersion: string;
}

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        title: `Dipped MC v.${app.getVersion()}`,
        backgroundColor: '#0f121a',
        width: 1280,
        height: 720,
        minWidth: 854,
        minHeight: 480,
        show: false,
        icon: path.join(process.cwd(), '/src/static/favicon.ico'),
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    });
    mainWindow.removeMenu();
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    mainWindow.webContents.openDevTools({ mode: 'bottom' });

    mainWindow.on('close', async (e) => {
        e.preventDefault();

        const { response } = await dialog.showMessageBox(mainWindow, {
            type: 'question',
            title: '  Confirm  ',
            message: 'Are you sure that you want to close this window, any downloads or updates will break.',
            buttons: ['Yes', 'No'],
        });

        if (response === 0) {
            mainWindow.destroy();
            app.quit();
        }
    });
    const secondaryWindow = new BrowserWindow({
        title: `Dipped MC v.${app.getVersion()}`,
        backgroundColor: '#0f121a',
        width: 360,
        height: 420,
        resizable: false,
        frame: false,
        icon: path.join(process.cwd(), '/src/static/favicon.ico'),
        titleBarStyle: 'hidden',
        parent: mainWindow,
        webPreferences: {
            preload: SECONDARY_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    });
    secondaryWindow.removeMenu();
    secondaryWindow.loadURL(SECONDARY_WINDOW_WEBPACK_ENTRY);
    mainWindow.center();
    secondaryWindow.center();
    secondaryWindow.show();
    //secondaryWindow.webContents.openDevTools({ mode: 'detach' });

    mainWindow.once('ready-to-show', () => {
        setTimeout(() => {
            mainWindow.maximize();
            mainWindow.show();
            secondaryWindow.hide();
        }, 2000);
    });

    window = mainWindow;
    loadingWindow = secondaryWindow;
};

app.on('ready', async () => {
    createWindow();
    ipcMain.on('load-icon', (event, id) => {
        const pack = config.packs.find((p) => p.id === id);
        const data = fs.readFileSync(path.join(pack.path, 'packIcon.png'));
        event.returnValue = `data:image/png;base64,${Buffer.from(data).toString('base64')}`;
    });
    ipcMain.on('path-join', (event, ...args) => {
        event.returnValue = path.join(...args);
    });
    ipcMain.on('get-config', (event) => {
        event.returnValue = config;
    });
    ipcMain.on('edit-config', (event, newConfig: Config) => {
        event.returnValue = editConfig(newConfig);
    });
    ipcMain.on('delete-config', async (event) => {
        fs.rm(config.configPath, { recursive: true, force: true }, (err) => {
            if (err) return (event.returnValue = err);
            event.returnValue = 'success';
            app.quit();
        });
    });
    ipcMain.on('get-packs', async (event) => {
        event.returnValue = await getPacks();
    });
    ipcMain.handle('dialog:openDirectory', async (event, type) => {
        const { canceled, filePaths } = await dialog.showOpenDialog(window, {
            properties: ['openDirectory'],
        });
        if (canceled) {
            return;
        } else {
            return filePaths[0];
        }
    });
    ipcMain.on('install-pack', async (event, id) => {
        if (installingPacks.includes(id)) return;
        installingPacks.push(id);
        window.webContents.executeJavaScript(`window.dmc.setInstalling("${id}")`);
        const packs = await (await fetch('https://dipped.dev/api/minecraft/servers')).json();
        const pack = packs.data.filter((p: any) => p.id === id)[0];
        const controller = new AbortController();
        axios
            .get(`https://dipped.dev/api/minecraft/packs/${id}`, {
                signal: controller.signal,
                responseType: 'arraybuffer',
                onDownloadProgress: (progressEvent) => {
                    const percent = Math.floor(progressEvent.progress * 100);
                    const secondsLeft = Math.round(progressEvent.estimated);
                    const rawRate = isNaN(progressEvent.rate) ? 0 : progressEvent.rate;
                    const rate = Math.floor(rawRate / 8000 / 1000) === 0 ? Math.floor(rawRate / 8000) : Math.floor(rawRate / 8000 / 1000);
                    const rateType = Math.floor(rawRate / 8000 / 1000) === 0 ? 'KB/s' : 'MB/s';
                    window.setProgressBar(percent / 100 / 2);
                    console.log(progressEvent.progress * 50);
                },
            })
            .then((res) => {
                console.log('Download Complete');
                console.log('init install');
                window.setProgressBar(0.5);
                installPack(pack, config, res.data);
                controller.abort();
            })
            .catch((error) => {
                dialog.showErrorBox(`Download Error`, `There was an error downloading that pack.`);
            });
    });
    ipcMain.on('play-pack', async (event, id) => {
        const pack = (await getPacks()).localPacks.filter((p: any) => p.id === id)[0];
        const packDir = config.packs.find((p) => p.id === id).path;
        console.log(`Launching Pack ${pack.name} ${pack.launcher}-${pack.launcherVersion}`);
        window.hide();
        loadingWindow.webContents.executeJavaScript('document.getElementById("infoText").innerText = "Starting Minecraft"');
        loadingWindow.webContents.executeJavaScript('document.getElementById("infoTextLower").innerText = "First time launch may take awhile..."');
        loadingWindow.show();
        if (pack.launcher === 'forge') {
            const launchConfig = await forge.getMCLCLaunchConfig({
                gameVersion: pack.gameVersion,
                rootPath: packDir,
                launcherVersion: pack.launcherVersion,
            });
            launcher.launch({
                ...launchConfig,
                authorization: Authenticator.getAuth('username'),
                memory: {
                    min: 2000,
                    max: 5000,
                },
                javaPath: 'javaw',
            });

            let flag = false;
            launcher.on('data', (e) => {
                if (flag === false) {
                    flag = true;
                    setTimeout(() => {
                        loadingWindow.hide();
                    }, 60000);
                }
            });
            launcher.on('close', (code) => {
                if (code === 0) {
                    console.log('User Exited Minecraft');
                    loadingWindow.hide();
                    window.show();
                    window.focus();
                } else {
                    console.log('Minecraft Crashed');
                }
            });
        } else if (pack.launcher === 'fabric') {
            const launchConfig = await forge.getMCLCLaunchConfig({
                gameVersion: pack.gameVersion,
                rootPath: packDir,
                launcherVersion: pack.launcherVersion,
            });
            launcher.launch({
                ...launchConfig,
                authorization: Authenticator.getAuth('username'),
                memory: {
                    min: 2000,
                    max: 5000,
                },
                javaPath: 'javaw',
            });

            let flag = false;
            launcher.on('data', (e) => {
                if (flag === false) {
                    flag = true;
                    setTimeout(() => {
                        loadingWindow.hide();
                    }, 60000);
                }
            });
            launcher.on('close', (code) => {
                if (code === 0) {
                    console.log('User Exited Minecraft');
                    loadingWindow.hide();
                    window.show();
                    window.focus();
                } else {
                    console.log('Minecraft Crashed');
                }
            });
        }
    });
});

function editConfig(newConfig: Config) {
    fs.writeFile(path.join(config.configPath, '/config.json'), JSON.stringify(newConfig, null, 2), (err) => {
        if (err) throw err;
        console.log('Config File Edited.');
        config = newConfig;
        return config;
    });
}

async function getPacks() {
    const localPacks: Array<LocalPack> = [];

    for (const pack of config.packs) {
        const index = config.packs.findIndex((p) => p.id === pack.id);
        const packPath = pack.path;
        fs.readdir(packPath, (err, packDir) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    config.packs.splice(index, 1);
                    editConfig(config);
                }
                console.log(err.code);
            } else if (packDir.includes('packInfo.json')) {
                const packInfoBuffer = fs.readFileSync(path.join(packPath, 'packInfo.json'));
                const packInfo = JSON.parse(packInfoBuffer.toString()) as LocalPack;
                localPacks.push(packInfo);
                console.log(path.join(packPath, 'packInfo.json'));
            }
        });
    }
    try {
        const servers = await (await fetch('https://dipped.dev/api/minecraft/servers')).json();
        return { packs: servers.data, localPacks };
    } catch (error) {
        return { packs: [], localPacks };
    }
}

async function installPack(pack: any, config: any, data: any) {
    try {
        fs.writeFile(path.join(config.packPath, `${pack.identifier}.zip`), Buffer.from(data, 'binary'), (err) => {
            if (err) dialog.showErrorBox(`Install Error`, `There was an error installing that pack. \n${err}`);
            unzip(path.join(config.packPath, `${pack.identifier}.zip`), config.packs.find((p: any) => p.id === pack.id).path)
                .then(() => {
                    window.setProgressBar(1);
                    fs.rm(path.join(config.packPath, `${pack.identifier}.zip`), (err) => {
                        window.setProgressBar(0);
                        window.webContents.executeJavaScript(`window.dmc.reloadPacks(false)`);
                    });
                })
                .catch((error) => {
                    console.log(error);
                    dialog.showErrorBox(`Install Error`, `There was an error installing that pack. \n${error}`);
                });
        });
    } catch (error) {
        console.log(error);
        dialog.showErrorBox(`Install Error`, `There was an error installing that pack. \n${error}`);
    }
}

function unzip(zipPath: string, unzipToDir: string) {
    return new Promise<void>((resolve, reject) => {
        try {
            mkdirp.sync(unzipToDir);
            yauzl.open(zipPath, { lazyEntries: true }, (err, zipFile) => {
                if (err) {
                    zipFile.close();
                    reject(err);
                    return;
                }
                zipFile.entryCount;
                console.log(zipFile);
                zipFile.readEntry();
                zipFile.on('entry', (entry) => {
                    window.setProgressBar(zipFile.entriesRead / zipFile.entryCount / 2 + 0.5);
                    console.log((zipFile.entriesRead / zipFile.entryCount) * 50 + 50);
                    try {
                        if (/\/$/.test(entry.fileName)) {
                            mkdirp.sync(path.join(unzipToDir, entry.fileName));
                            zipFile.readEntry();
                        } else {
                            zipFile.openReadStream(entry, (readErr, readStream) => {
                                if (readErr) {
                                    zipFile.close();
                                    reject(readErr);
                                    return;
                                }

                                const file = fs.createWriteStream(path.join(unzipToDir, entry.fileName));
                                readStream.pipe(file);
                                file.on('finish', () => {
                                    file.close(() => {
                                        zipFile.readEntry();
                                    });

                                    file.on('error', (err) => {
                                        zipFile.close();
                                        reject(err);
                                    });
                                });
                            });
                        }
                    } catch (e) {
                        zipFile.close();
                        reject(e);
                    }
                });
                zipFile.on('end', (err) => {
                    resolve();
                });
                zipFile.on('error', (err) => {
                    zipFile.close();
                    reject(err);
                });
            });
        } catch (e) {
            reject(e);
        }
    });
}

setInterval(() => {
    autoUpdater.checkForUpdates();
}, 10 * 60 * 1000);
