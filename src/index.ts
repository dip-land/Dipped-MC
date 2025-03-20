import axios from 'axios';
import { app, BrowserWindow, ipcMain, dialog, autoUpdater } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import os from 'os';
// eslint-disable-next-line import/no-unresolved
import { Auth, tokenUtils } from 'msmc';
import type { MclcUser } from 'msmc/types/types';

export const apiServer = 'https://dipped.dev/api';
const updateServer = 'https://dipped-mc-updater.vercel.app';
const feed = `${updateServer}/update/${process.platform}/${app.getVersion()}`;

autoUpdater.setFeedURL({ url: feed });

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
let key: MclcUser | object;
let window: BrowserWindow;
let loadingWindow: BrowserWindow;
const installingPacks: Array<string> = [];
const uninstallingPacks: Array<string> = [];
let packs: Array<Pack<boolean>> = [];
let webPacks: Array<WebPack> = [];
let localPacks: Array<LocalPack> = [];
export const authManager = new Auth('select_account');

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
if (!fs.existsSync(config.packPath)) fs.mkdirSync(config.packPath);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

const createWindow = () => {
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

import deleteConfig from './events/deleteConfig';
import editConfigEvent from './events/editConfig';
import fetchPacksEvent from './events/fetchPacks';
import getConfigEvent from './events/getConfig';
import getInstallingPacksEvent from './events/getInstallingPacks';
import getPackEvent from './events/getPack';
import getPacksEvent from './events/getPacks';
import getUninstallingPacksEvent from './events/getUninstallingPacks';
import getUserEvent from './events/getUser';
import installPackEvent from './events/installPack';
import loadIconEvent from './events/loadIcon';
import loginEvent from './events/login';
import logoutEvent from './events/logout';
import openFolderEvent from './events/openFolder';
import openUrlEvent from './events/openUrl';
import pathJoinEvent from './events/pathJoin';
import playPackEvent from './events/playPack';
import reloadEvent from './events/reload';
import uninstallPackEvent from './events/uninstallPack';
import { Config, LocalPack, Pack, WebPack } from './types';

app.on('ready', async () => {
    createWindow();
    ipcMain.on('delete-config', deleteConfig.fn);
    ipcMain.on('edit-config', editConfigEvent.fn);
    ipcMain.on('fetch-packs', fetchPacksEvent.fn);
    ipcMain.on('get-config', getConfigEvent.fn);
    ipcMain.on('get-installing-packs', getInstallingPacksEvent.fn);
    ipcMain.on('get-pack', getPackEvent.fn);
    ipcMain.on('get-packs', getPacksEvent.fn);
    ipcMain.on('get-uninstalling-packs', getUninstallingPacksEvent.fn);
    ipcMain.on('get-user', getUserEvent.fn);
    ipcMain.on('install-pack', installPackEvent.fn);
    ipcMain.on('load-icon', loadIconEvent.fn);
    ipcMain.on('login', loginEvent.fn);
    ipcMain.on('logout', logoutEvent.fn);
    ipcMain.on('open-folder', openFolderEvent.fn);
    ipcMain.on('open-url', openUrlEvent.fn);
    ipcMain.on('path-join', pathJoinEvent.fn);
    ipcMain.on('play-pack', playPackEvent.fn);
    ipcMain.on('reload', reloadEvent.fn);
    ipcMain.on('uninstall-pack', uninstallPackEvent.fn);

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
});

export function getApp() {
    return app;
}
export function getWindows() {
    return { main: window, secondary: loadingWindow };
}

export function getConfig() {
    return config;
}
export function editConfig(newConfig: Config) {
    fs.writeFile(path.join(config.configPath, '/config.json'), JSON.stringify(newConfig, null, 2), (err) => {
        if (err) throw err;
        console.log('Config File Edited.');
        config = newConfig;
        return config;
    });
}

export function getKey() {
    return key;
}
export function editKey(newKey: MclcUser | object) {
    fs.writeFile(path.join(config.configPath, '/k._dmc'), JSON.stringify(newKey, null, 2), (err) => {
        if (err) throw err;
        console.log('Key Edited.');
        key = newKey;
        return key;
    });
}

export function getInstalling() {
    return installingPacks;
}
export function addInstalling(id: string) {
    installingPacks.push(id);
    return installingPacks;
}
export function removeInstalling(id: string) {
    const index = installingPacks.findIndex((packID) => packID === id);
    installingPacks.splice(index, 1);
    return installingPacks;
}

export function getUninstalling() {
    return uninstallingPacks;
}
export function addUninstalling(id: string) {
    uninstallingPacks.push(id);
    return uninstallingPacks;
}
export function removeUninstalling(id: string) {
    const index = uninstallingPacks.findIndex((packID) => packID === id);
    uninstallingPacks.splice(index, 1);
    return uninstallingPacks;
}

export async function fetchPacks() {
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

export async function getPacks() {
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

export function newAbortSignal(timeoutMs: number) {
    const abortController = new AbortController();
    setTimeout(() => abortController.abort(), timeoutMs || 0);

    return abortController.signal;
}

setInterval(() => {
    if (app.isPackaged) {
        autoUpdater.checkForUpdates();
    }
}, 60000);
