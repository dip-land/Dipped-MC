// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';
import { Config, LocalPack } from './index';
import path from 'path';
//import { fabric } from 'tomate-loaders';

contextBridge.exposeInMainWorld('dmc', {
    loadIcon: (id: string) => ipcRenderer.sendSync('load-icon', id),
    pathJoin: (...args: string[]) => ipcRenderer.sendSync('load-icon', ...args),
    getConfig: () => ipcRenderer.sendSync('get-config') as Config,
    editConfig: (newConfig: Config) => ipcRenderer.sendSync('edit-config', newConfig) as Config,
    deleteConfig: () => ipcRenderer.sendSync('delete-config'),
    getPacks: () => ipcRenderer.sendSync('get-packs'),
    reloadPacks: reloadPacks,
    preInstall: preInstall,
    installPack: (id: string) => ipcRenderer.sendSync('install-pack', id),
    setInstalling: setInstalling,
    selectFolder: (type: 'pack') => ipcRenderer.invoke('dialog:openDirectory', type),
    playPack: (id: string) => ipcRenderer.sendSync('play-pack', id),
});

declare global {
    interface Window {
        dmc: {
            loadIcon: (id: string) => string;
            pathJoin: (...args: string[]) => string;
            getConfig: () => Config;
            editConfig: (newConfig: Config) => Config;
            deleteConfig: () => 'success' | Error;
            getPacks: () => {
                packs: Array<{ id: string; status: string; online: boolean; version: string; name: string; identifier: string }>;
                localPacks: Array<LocalPack>;
            };
            reloadPacks: (offline: boolean) => void;
            preInstall: (packID: string) => void;
            installPack: (id: string) => void;
            setInstalling: (packID: string) => void;
            selectFolder: (type: 'pack') => string;
            playPack: (id: string) => void;
        };
    }
}

function reloadPacks(offline: boolean) {
    const packs = ipcRenderer.sendSync('get-packs');
    const packsSection = document.getElementById('servers');
    packsSection.innerHTML = '';
    if (offline) {
        document.getElementById('offlineWarning').classList.toggle('hidden');
        for (const pack of packs.localPacks) {
            const installed = true;
            window.dmc.loadIcon(pack.id);
            packsSection.innerHTML += `<div id="${pack.id}" class="server ${installed ? 'downloaded' : 'notDownloaded'}">
                    <div class="serverBackground" style="background-image: url(&quot;${window.dmc.loadIcon(pack.identifier)}&quot;)"></div>
                    <div class="serverBackgroundOverlay"></div>
                    <div class="serverContent">
                        <img class="serverIcon" src="${window.dmc.loadIcon(pack.id)}" width="140px" height="140px" alt="">
                        <span class="serverName">${pack.name}</span>
                    </div>
                    <div class="serverButtons">
                        <button class="playButton" onclick="window.dmc.play('${pack.id}')">Play</button>
                    </div>
                    <div class="info hidden">
                        <span></span>
                    </div>
                    <div class="version">
                        <span class="versionNumber">v.${pack.version}</span>
                        <span class="newVersionNumber"></span>
                        <img class="modLoaderIcon" />
                    </div>
                </div>`;
        }
    } else {
        for (const pack of packs.packs) {
            const installed = packs.localPacks.some((e: any) => e.id === pack.id);
            const localPack = packs.localPacks.filter((e: any) => e.id === pack.id)[0];
            const updatable = localPack && localPack.version !== pack.version ? true : false;
            const worldDownload = false;
            const version = localPack && localPack.version !== pack.version ? `v.${localPack.version} ->` : `v.${pack.version}`;
            const newVersion = localPack && localPack.version !== pack.version ? `v.${pack.version}` : '';
            packsSection.innerHTML += `<div id="${pack.id}" class="server ${installed ? 'downloaded' : 'notDownloaded'} ${updatable ? 'update' : ''}">
                    <div class="serverBackground" style="background-image: url(&quot;https://dipped.dev/api/minecraft/icons/${pack.id}&quot;)"></div>
                    <div class="serverBackgroundOverlay"></div>
                    <div class="serverContent">
                        <img class="serverIcon" src="https://dipped.dev/api/minecraft/icons/${pack.id}" width="140px" height="140px" alt="Pack Icon">
                        <span class="serverName">${pack.name}</span>
                    </div>
                    <div class="serverButtons">
                        <button class="playButton" onclick="window.dmc.playPack('${pack.id}')">Play</button>
                        <button class="updateButton" onclick="window.dmc.updatePack('${pack.id}')">Update Pack</button>
                        <button class="installButton" onclick="window.dmc.preInstall('${pack.id}')">Install Pack</button>
                        <button class="downloadWorldButton" onclick="window.dmc.downloadWorld('${pack.id}')">Download Archived World</button>
                    </div>
                    <div class="info ${installed && !updatable && !worldDownload ? 'hidden' : ''}">
                        <span>${!installed ? 'Not Installed' : updatable ? 'Requires Update' : worldDownload ? 'World Available' : ''}</span>
                    </div>
                    <div class="version">
                        <span class="versionNumber">${version}</span>
                        <span class="newVersionNumber">${newVersion}</span>
                        <img class="modLoaderIcon" />
                    </div>
                </div>`;
        }
    }
}

function preInstall(packID: string) {
    const config: Config = ipcRenderer.sendSync('get-config');
    const packs = ipcRenderer.sendSync('get-packs');
    const pack = packs.packs.filter((e: any) => e.id === packID)[0];
    console.log(pack, packs);
    const locationSelect = document.getElementById('locationSelect');
    locationSelect.classList.toggle('hidden');

    const currentFolder = locationSelect.children[0].children[1].children[1];
    currentFolder.innerHTML = `${config.packPath}\\${pack.identifier}`;

    const buttons = locationSelect.children[0].children[2].children;
    const changeLocation = buttons[0] as HTMLButtonElement;
    const keepDefault = buttons[1] as HTMLButtonElement;

    changeLocation.onclick = async () => {
        const folder = await ipcRenderer.invoke('dialog:openDirectory', 'pack');
        config.packs.push({ id: packID, path: ipcRenderer.sendSync('path-join', folder, pack.identifier) });
        ipcRenderer.sendSync('edit-config', config);
        ipcRenderer.sendSync('install-pack', pack.id);
        locationSelect.classList.toggle('hidden');
    };

    keepDefault.onclick = async () => {
        config.packs.push({ id: packID, path: ipcRenderer.sendSync('path-join', config.packPath, pack.identifier) });
        ipcRenderer.sendSync('edit-config', config);
        ipcRenderer.sendSync('install-pack', pack.id);
        locationSelect.classList.toggle('hidden');
    };

    console.log('init preinstall');
}

//window.dmc.installPack(pack.id)

function setInstalling(packID: string) {
    const pack = document.getElementById(packID);
    const button = pack.children[3].children[2] as HTMLButtonElement;
    const infoText = pack.children[4].children[0];
    button.style.background = '#1e4d19';
    button.innerText = 'Installing';
    infoText.innerHTML = 'Installing';
    pack.classList.add('installing');
}
//window.dmc.setInstalling('2087399f-7b2c-458d-b246-6a3dea881311')
//win.webContents.executeJavaScript()

console.log('Preload Loaded.');
