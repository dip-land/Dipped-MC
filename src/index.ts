import axios from 'axios';
import { app, BrowserWindow, ipcMain, dialog, autoUpdater, shell } from 'electron';
import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';
import yauzl from 'yauzl';
import { mkdirp } from 'mkdirp';
import { fabric, forge } from './tomate-loaders/index';
import { Client as mclcClient, Authenticator, IUser } from 'minecraft-launcher-core';
import os from 'os';
// eslint-disable-next-line import/no-unresolved
import { Auth, tokenUtils } from 'msmc';
// eslint-disable-next-line import/no-unresolved
import { MclcUser } from 'msmc/types/types';
import { exec } from 'child_process';

const apiServer = 'https://dipped.dev/api';
const updateServer = 'https://dipped-mc-updater.vercel.app';
const feed = `${updateServer}/update/${process.platform}/${app.getVersion()}`;

autoUpdater.setFeedURL({ url: feed });

const launcher = new mclcClient();

import started from 'electron-squirrel-startup';
if (started) {
    app.quit();
}

const defaultConfigPath = app.getPath('userData');
const defaultPackPath = path.join(app.getPath('userData'), 'packs');
const defaultConfig: Config = {
    configPath: defaultConfigPath,
    appPath: app.getAppPath(),
    installed: Date.now(),
    packPath: defaultPackPath,
    ram: Math.floor(os.totalmem() / 2 / 1e6 > 12000 ? 12000 : os.totalmem() / 2 / 1e6) / 1000,
    packs: [],
};
let config = defaultConfig;
let window: BrowserWindow;
let loadingWindow: BrowserWindow;
let installingPacks: Array<string> = [];
let uninstallingPacks: Array<string> = [];
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

const authManager = new Auth('select_account');
let key: MclcUser | object;
//check if key exists
if (fs.existsSync(path.join(defaultConfigPath, '/k._dmc'))) {
    fs.readFile(path.join(defaultConfigPath, '/k._dmc'), async (err, data) => {
        if (err) throw err;
        key = JSON.parse(data.toString());
        if (Object.prototype.hasOwnProperty.call(key, 'access_token')) {
            const oldKey = await tokenUtils.fromMclcToken(authManager, key as MclcUser);
            const newKey = await oldKey.refresh(true);
            editKey(newKey.mclc(true));
        }
    });
} else {
    try {
        fs.mkdirSync(defaultConfigPath);
    } catch (error) {
        console.log(error);
    }
    fs.writeFile(path.join(defaultConfigPath, '/k._dmc'), JSON.stringify({}, null, 2), (err) => {
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
    packs: Array<{ id: string; path: string; ram: number }>;
}

export interface WebPack {
    id: string;
    status: string;
    online: boolean;
    version: string;
    name: string;
    identifier: string;
    link: { type: 'curseforge' | 'modrinth'; url: string };
}

export interface LocalPack {
    id: string;
    version: string;
    name: string;
    identifier: string;
    launcher: 'forge' | 'fabric';
    gameVersion: string;
    launcherVersion: string;
    installed: boolean;
}

export type Pack<installed> = installed extends false
    ? {
          id: string;
          identifier: string;
          name: string;
          serverVersion: string;
          localVersion: string | undefined;
          status: string;
          online: boolean;
          link: { type: 'curseforge' | 'modrinth'; url: string };
          installed: boolean;
          gameVersion: string | undefined;
          launcher: 'forge' | 'fabric' | undefined;
          launcherVersion: string | undefined;
      }
    : {
          id: string;
          identifier: string;
          name: string;
          serverVersion: string | undefined;
          localVersion: string;
          status: string | undefined;
          online: boolean;
          link: { type: 'curseforge' | 'modrinth' | undefined; url: string | undefined };
          installed: boolean;
          gameVersion: string;
          launcher: 'forge' | 'fabric';
          launcherVersion: string;
      };

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        title: `Dipped MC v.${app.getVersion()}`,
        backgroundColor: '#0f121a',
        width: 1280,
        height: 720,
        minWidth: 854,
        minHeight: 480,
        show: false,
        icon: path.join(process.cwd(), '/public/favicon.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    if (app.isPackaged) mainWindow.removeMenu();
    if (!app.isPackaged) mainWindow.webContents.openDevTools();

    const secondaryWindow = new BrowserWindow({
        title: `Dipped MC v.${app.getVersion()}`,
        backgroundColor: '#0f121a',
        width: 360,
        height: 420,
        resizable: false,
        frame: false,
        icon: path.join(process.cwd(), '/public/favicon.ico'),
        titleBarStyle: 'hidden',
        parent: mainWindow,
    });

    secondaryWindow.removeMenu();

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
        secondaryWindow.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/secondaryWindow.html`);
    } else {
        mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
        secondaryWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/secondaryWindow.html`));
    }
    mainWindow.center();
    secondaryWindow.center();
    secondaryWindow.show();

    mainWindow.once('ready-to-show', () => {
        // wait 2 seconds for css to load
        setTimeout(() => {
            mainWindow.show();
            mainWindow.maximize();
            secondaryWindow.hide();
        }, 2000);
    });

    window = mainWindow;
    loadingWindow = secondaryWindow;
};

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

app.on('ready', async () => {
    createWindow();
    ipcMain.on('load-icon', (event, id) => {
        const pack = config.packs.find((p) => p.id === id);
        if (!pack) return (event.returnValue = false);
        const data = fs.readFileSync(path.join(pack.path, 'packIcon.png'));
        event.returnValue = `data:image/png;base64,${data.toString('base64')}`;
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
    ipcMain.on('get-pack', async (event, id) => {
        const packs = await getPacks();
        const pack = packs.find((pack) => pack.id === id);
        event.returnValue = pack;
    });
    ipcMain.on('open-url', async (event, url) => {
        shell.openExternal(url);
        event.returnValue = true;
    });
    let lastOpen = 0;
    ipcMain.on('open-folder', async (event, path) => {
        if (lastOpen + 2000 > Date.now()) return (event.returnValue = false);
        exec(`start "" "${path}"`);
        lastOpen = Date.now();
        event.returnValue = true;
    });
    ipcMain.handle('dialog:openDirectory', async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog(window, {
            properties: ['openDirectory'],
        });
        if (canceled) {
            return;
        } else {
            return filePaths[0];
        }
    });
    ipcMain.on('reload', () => {
        app.relaunch();
        app.exit();
    });

    ipcMain.on('login', async (event) => {
        try {
            const xboxManager = await authManager.launch('raw');
            const token = await xboxManager.getMinecraft();
            event.returnValue = editKey(token.mclc(true));
            event.sender.reload();
        } catch (error) {
            event.returnValue = false;
        }
    });
    ipcMain.on('logout', async (event) => {
        try {
            event.returnValue = editKey({});
            event.sender.reload();
        } catch (error) {
            event.returnValue = false;
        }
    });
    ipcMain.on('get-user', async (event) => {
        axios
            .get(`https://sessionserver.mojang.com/session/minecraft/profile/${(key as MclcUser)?.uuid}`, {
                validateStatus: function (status) {
                    return status >= 200 && status < 500;
                },
            })
            .then((response) => {
                if (response.data.errorMessage) {
                    event.returnValue = { status: 'invalid' };
                } else {
                    const user = JSON.parse(atob(response.data.properties.find((v: { name: string }) => v.name === 'textures').value));
                    event.returnValue = {
                        status: 'valid',
                        name: user.profileName,
                        uuid: user.profileId,
                        textures: user.textures,
                    };
                }
            })
            .catch((e) => {
                event.returnValue = {
                    status: 'offline',
                    name: (key as MclcUser)?.name,
                    uuid: (key as MclcUser)?.uuid,
                };
            });
    });

    ipcMain.on('install-pack', async (event, id, config: Config) => {
        if (installingPacks.includes(id)) return;
        installingPacks.push(id);
        editConfig(config);
        const packs = await (await fetch(`${apiServer}/minecraft/servers`)).json();
        const pack = packs.data.find((p: WebPack) => p.id === id);
        window.webContents.executeJavaScript(`window.dmc.createNotification("${id}", { title: "Downloading", body: "${pack.name}", progress: 0})`);
        const controller = new AbortController();
        axios
            .get(`${apiServer}/minecraft/packs/${id}`, {
                signal: controller.signal,
                responseType: 'arraybuffer',
                onDownloadProgress: (progressEvent) => {
                    const percent = Math.floor((progressEvent.progress as number) * 100);
                    window.setProgressBar(percent / 100 / 2);
                    window.webContents.executeJavaScript(`window.dmc.updateNotification("${id}", { progress: ${percent / 2}})`);
                },
            })
            .then((res) => {
                window.setProgressBar(0.5);
                installPack(pack, config, res.data);
                controller.abort();
            })
            .catch(() => {
                dialog.showErrorBox(`Failed to find server`, 'You are either not connected to the internet or the server is down');
                window.webContents.executeJavaScript(`window.dmc.deleteNotification("${pack.id}")`);
                window.setProgressBar(0);
            });
    });

    ipcMain.on('play-pack', async (event, id) => {
        const pack = (await getPacks()).find((p) => p.id === id) as Pack<true>;
        const packConfig = config.packs.find((p) => p.id === id) as Config['packs'][0];
        if (!pack) return (event.returnValue = false);
        console.log(`Launching Pack ${pack.name} ${pack.launcher}-${pack.launcherVersion}`);
        window.hide();
        loadingWindow.webContents.executeJavaScript('document.getElementById("infoText").innerText = "Starting Minecraft"');
        loadingWindow.webContents.executeJavaScript('document.getElementById("infoTextLower").innerText = "First time launch may take awhile..."');
        loadingWindow.show();
        const launchConfig =
            pack.launcher === 'forge'
                ? await forge.getMCLCLaunchConfig({
                      gameVersion: pack.gameVersion,
                      rootPath: packConfig.path,
                      launcherVersion: pack.launcherVersion,
                  })
                : await fabric.getMCLCLaunchConfig({
                      gameVersion: pack.gameVersion,
                      rootPath: packConfig.path,
                      launcherVersion: pack.launcherVersion,
                  });
        launcher.launch({
            ...launchConfig,
            authorization: (key as IUser) ?? Authenticator.getAuth('offline'),
            memory: {
                min: 2000,
                max: packConfig.ram * 1000,
            },
            javaPath: 'javaw',
        });

        let flag = false;
        launcher.on('data', (data) => {
            if (flag === false) {
                flag = true;
                setTimeout(() => {
                    loadingWindow.hide();
                }, 60000 * 5);
            }
        });
        launcher.on('close', async (code) => {
            loadingWindow.hide();
            window.show();
            window.maximize();
            window.focus();
            if (code === 0) {
                console.log('User Exited Minecraft');
            } else {
                console.log('Minecraft Crashed');
                dialog.showErrorBox(`Minecraft Error`, `Minecraft exited with code ${code}, which is considered a crash`);
            }

            //regen key on close
            if (Object.prototype.hasOwnProperty.call(key, 'access_token')) {
                const oldKey = await tokenUtils.fromMclcToken(authManager, key as MclcUser);
                const newKey = await oldKey!.refresh(true);
                editKey(newKey.mclc(true));
            }
        });
    });

    ipcMain.on('fetch-packs', async (event) => {
        event.returnValue = true;
        fetchPacks();
    });

    let packs: Array<Pack<boolean>> = [];
    let webPacks: Array<WebPack> = [];
    let localPacks: Array<LocalPack> = [];
    async function getPacks() {
        if (!packs[0]) await fetchPacks();
        const _packs: Array<Pack<boolean>> = [];
        for (const pack of webPacks) {
            _packs.push({
                id: pack.id,
                identifier: pack.identifier,
                name: pack.name,
                serverVersion: pack.version,
                localVersion: undefined,
                status: pack.status,
                online: pack.online,
                link: pack.link,
                installed: false,
                gameVersion: undefined,
                launcher: undefined,
                launcherVersion: undefined,
            });
        }
        for (const pack of localPacks) {
            const index = _packs.findIndex((p) => p.id === pack.id);
            const target = _packs[index];
            if (index === -1) {
                _packs.push({
                    id: pack.id,
                    identifier: pack.identifier,
                    name: pack.name,
                    serverVersion: undefined,
                    localVersion: pack.version,
                    status: undefined,
                    online: false,
                    link: { type: undefined, url: undefined },
                    installed: true,
                    gameVersion: pack.gameVersion,
                    launcher: pack.launcher,
                    launcherVersion: pack.launcherVersion,
                });
            } else {
                target.localVersion = pack.version;
                target.installed = true;
                target.gameVersion = pack.gameVersion;
                target.launcher = pack.launcher;
                target.launcherVersion = pack.launcherVersion;
                _packs.splice(index, 1, target);
            }
        }
        packs = _packs;
        return _packs;
    }

    async function fetchPacks() {
        localPacks = [];
        for (const pack of config.packs) {
            const index = config.packs.findIndex((p) => p.id === pack.id);
            const packPath = pack?.path;
            if (localPacks.find((p) => p.id === pack.id) || installingPacks.includes(pack.id)) continue;
            fs.readdir(packPath, (err, packDir) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        config.packs.splice(index, 1);
                        editConfig(config);
                    }
                } else if (packDir.includes('packInfo.json')) {
                    const packInfoBuffer = fs.readFileSync(path.join(packPath, 'packInfo.json'));
                    const packInfo = JSON.parse(packInfoBuffer.toString()) as LocalPack;
                    packInfo['installed'] = true;
                    localPacks.push(packInfo);
                }
            });
        }
        try {
            webPacks = (await axios(`${apiServer}/minecraft/servers`, { signal: newAbortSignal(10000) })).data.data as Array<WebPack>;
        } catch (error) {
            return;
        }
    }

    ipcMain.on('uninstall-pack', async (event, options: { packID: string; deleteAll?: boolean; offline: boolean }) => {
        if (uninstallingPacks.includes(options.packID)) return (event.returnValue = false);
        event.returnValue = true;
        uninstallingPacks.push(options.packID);
        const packDir = config.packs.find((pack) => pack.id === options.packID)?.path;
        const pack = packs.find((pack) => pack.id === options.packID);
        if (!packDir || !pack) return (event.returnValue = false);
        if (!options.deleteAll) {
            if (!fs.existsSync(path.join(config.packPath, 'uninstalled', options.packID)))
                fs.mkdirSync(path.join(config.packPath, 'uninstalled', options.packID), { recursive: true });
            fs.rename(path.join(packDir, 'saves'), path.join(config.packPath, 'uninstalled', options.packID, 'saves'), (e) => {
                console.log(e);
            });
            fs.rename(path.join(packDir, 'options.txt'), path.join(config.packPath, 'uninstalled', options.packID, 'options.txt'), (e) => {
                console.log(e);
            });
        }

        fsPromises
            .rmdir(packDir, { recursive: true })
            .then(async () => {
                window.webContents.executeJavaScript(
                    `window.dmc.createNotification("${options.packID}_u_complete", { title: "Uninstall Successful", body: '${pack.name} Uninstalled'})`
                );
                const packIndex = config.packs.findIndex((pack) => pack.id === options.packID);
                const shadowConfig = config;
                shadowConfig.packs.splice(packIndex, 1);
                editConfig(shadowConfig);
                await fetchPacks();
                window.webContents.executeJavaScript(`window.dmc.reloadPacks(${options.offline})`);
                setTimeout(() => window.webContents.executeJavaScript(`window.dmc.deleteNotification("${options.packID}_u_complete")`), 3000);
                uninstallingPacks = uninstallingPacks.filter((e) => e !== options.packID);
            })
            .catch((e) => {
                console.log(e);
            });
    });

    ipcMain.on('get-installing-packs', (event) => {
        event.returnValue = installingPacks;
    });
    ipcMain.on('get-uninstalling-packs', (event) => {
        event.returnValue = uninstallingPacks;
    });
});

const deepMergeObjects = (...objects: any) => {
    const deepCopyObjects = objects.map((object: any) => JSON.parse(JSON.stringify(object)));
    return deepCopyObjects.reduce((merged: any, current: any) => ({ ...merged, ...current }), {});
};

function editConfig(newConfig: Config) {
    fs.writeFile(path.join(config.configPath, '/config.json'), JSON.stringify(newConfig, null, 2), (err) => {
        if (err) throw err;
        console.log('Config File Edited.');
        config = newConfig;
        return config;
    });
}

function editKey(newKey: MclcUser | object) {
    fs.writeFile(path.join(config.configPath, '/k._dmc'), JSON.stringify(newKey, null, 2), (err) => {
        if (err) throw err;
        console.log('Key Edited.');
        key = newKey;
        return key;
    });
}

async function installPack(pack: LocalPack, config: Config, data: string) {
    try {
        fs.writeFile(path.join(config.packPath, `${pack.identifier}.zip`), Buffer.from(data, 'binary'), (err) => {
            if (err) dialog.showErrorBox(`Install Error`, `There was an error installing that pack. \n${err}`);
            const packDir = config.packs.find((p: Config['packs'][0]) => p.id === pack.id)?.path;
            if (!packDir) return;
            unzip(path.join(config.packPath, `${pack.identifier}.zip`), packDir, pack.id)
                .then(() => {
                    window.setProgressBar(1);
                    if (fs.existsSync(path.join(config.packPath, 'uninstalled', pack.id))) {
                        fs.rmdir(path.join(packDir, 'saves'), (e) => {
                            if (e) return;
                            fs.rename(path.join(config.packPath, 'uninstalled', pack.id, 'saves'), path.join(packDir, 'saves'), (e) => {
                                if (e) console.log(e);
                            });
                        });
                        fs.rm(path.join(packDir, 'options.txt'), (e) => {
                            if (e) return;
                            fs.rename(path.join(config.packPath, 'uninstalled', pack.id, 'options.txt'), path.join(packDir, 'options.txt'), (e) => {
                                console.log(e);
                            });
                        });
                        fs.rmdir(path.join(config.packPath, 'uninstalled', pack.id), (e) => {
                            if (e) return;
                        });
                    }
                    fs.rm(path.join(config.packPath, `${pack.identifier}.zip`), () => {
                        window.setProgressBar(0);
                        window.webContents.executeJavaScript(
                            `window.dmc.createNotification("${pack.id}_complete", { title: "Install Successful", body: '"${pack.name}" is now ready to play'})`
                        );
                        window.webContents.executeJavaScript(`window.dmc.deleteNotification("${pack.id}")`);
                        window.webContents.executeJavaScript(`window.dmc.reloadPacks(false)`);
                        setTimeout(() => window.webContents.executeJavaScript(`window.dmc.deleteNotification("${pack.id}_complete")`), 3000);
                    });
                    window.webContents.executeJavaScript(`window.dmc.fetchPacks()`);
                    installingPacks = installingPacks.filter((e) => e !== pack.id);
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

function unzip(zipPath: string, unzipToDir: string, packID: string) {
    return new Promise<void>((resolve, reject) => {
        try {
            mkdirp.sync(unzipToDir);
            yauzl.open(zipPath, { lazyEntries: true }, (err, zipFile) => {
                if (err) {
                    zipFile.close();
                    reject(err);
                    return;
                }
                zipFile.readEntry();
                zipFile.on('entry', (entry) => {
                    const progress = zipFile.entriesRead / zipFile.entryCount / 2 + 0.5;
                    window.setProgressBar(progress);
                    window.webContents.executeJavaScript(`window.dmc.updateNotification("${packID}", { title: "Installing", progress: ${progress * 100}})`);
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
                zipFile.on('end', () => resolve());
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

function newAbortSignal(timeoutMs: number) {
    const abortController = new AbortController();
    setTimeout(() => abortController.abort(), timeoutMs || 0);

    return abortController.signal;
}

setInterval(() => {
    if (app.isPackaged) {
        autoUpdater.checkForUpdates();
    }
}, 60000);
