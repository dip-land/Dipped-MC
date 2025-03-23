// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';
import { Config, Pack } from './types';

contextBridge.exposeInMainWorld('dmc', {
    deleteConfig: () => ipcRenderer.sendSync('delete-config'),
    editConfig: (newConfig: Config) => ipcRenderer.sendSync('edit-config', newConfig) as Config,
    fetchPacks: () => ipcRenderer.sendSync('fetch-packs'),
    getConfig: () => ipcRenderer.sendSync('get-config') as Config,
    getInstallingPacks: () => ipcRenderer.sendSync('get-installing-packs'),
    getPack: (id: string) => ipcRenderer.sendSync('get-pack', id),
    getPacks: () => ipcRenderer.sendSync('get-packs'),
    getUninstallingPacks: () => ipcRenderer.sendSync('get-uninstalling-packs'),
    getUser: () => ipcRenderer.sendSync('get-user'),
    loadIcon: (id: string) => ipcRenderer.sendSync('load-icon', id),
    login: () => ipcRenderer.sendSync('login'),
    logout: () => ipcRenderer.sendSync('logout'),
    openFolder: (path: string) => ipcRenderer.sendSync('open-folder', path),
    openURL: (url: string) => ipcRenderer.sendSync('open-url', url),
    pathJoin: (...args: string[]) => ipcRenderer.sendSync('load-icon', ...args),
    playPack: (id: string) => ipcRenderer.sendSync('play-pack', id),
    reload: () => ipcRenderer.sendSync('reload'),

    createNotification,
    deleteNotification,
    openPackCtxMenu,
    preInstall,
    preUninstall,
    reloadPacks,
    selectFolder: (type: 'pack') => ipcRenderer.invoke('dialog:openDirectory', type),
    setInstalling,
    setUninstalling,
    updateNotification,
});

function reloadPacks(offline: boolean) {
    const packs = ipcRenderer.sendSync('get-packs') as Array<Pack<boolean>>;
    const packsSection = document.getElementById('servers');
    packsSection.innerHTML = '';
    if (offline) {
        document.getElementById('offlineWarning').classList.toggle('hidden');
        document.getElementById('loginMode').classList.remove('hidden');
        document.getElementById('loginButton').classList.add('hidden');
    }
    for (const pack of packs) {
        const updatable = !offline && pack.installed && pack.localVersion !== pack.serverVersion;
        const worldDownload = false;
        const version = updatable ? `v.${pack.localVersion} ->` : offline ? `v.${pack.localVersion}` : `v.${pack.serverVersion}`;
        const newVersion = updatable ? `v.${pack.serverVersion}` : '';
        packsSection.innerHTML += `<div id="${pack.id}" data-id="${pack.id}" class="server ${pack.installed ? 'downloaded' : 'notDownloaded'} ${updatable ? 'update' : ''} ${
            worldDownload ? 'world' : ''
        }">
                    <div data-id="${pack.id}" class="serverBackground" style="background-image: url(&quot;https://dipped.dev/api/minecraft/icons/${pack.id}&quot;)"></div>
                    <div data-id="${pack.id}" class="serverBackgroundOverlay"></div>
                    <div data-id="${pack.id}" class="serverContent">
                        <img class="serverIcon" src="https://dipped.dev/api/minecraft/icons/${pack.id}" width="140px" height="140px" alt="Pack Icon">
                        <span class="serverName">${pack.name}</span>
                    </div>
                    <div data-id="${pack.id}" class="serverButtons">
                        <button class="playButton" onclick="window.dmc.playPack('${pack.id}')">Play</button>
                        ${
                            offline
                                ? ''
                                : `<button class="updateButton" onclick="window.dmc.updatePack('${pack.id}')">Update Pack</button>
                        <button class="installButton" onclick="window.dmc.preInstall('${pack.id}')">Install Pack</button>
                        <button class="downloadWorldButton" onclick="window.dmc.downloadWorld('${pack.id}')">Download Archived World</button>`
                        }
                        <button class="packCtxMenuButton" onclick="const bb = this.getBoundingClientRect(); window.dmc.openPackCtxMenu({packID: '${
                            pack.id
                        }', posX:bb.left, posY:bb.bottom, offline:${offline}, pack: true}, this);">︙</button>
                    </div>
                    <div data-id="${pack.id}" class="info ${pack.installed && !updatable && !worldDownload ? 'hidden' : ''}">
                        <span>${!pack.installed ? 'Not Installed' : updatable ? 'Requires Update' : worldDownload ? 'World Available' : ''}</span>
                    </div>
                    <div data-id="${pack.id}" class="version">
                        <span class="versionNumber">${version}</span>
                        ${offline ? '' : `<span class="newVersionNumber">${newVersion}</span>`}
                        <img class="modLoaderIcon" />
                    </div>
                </div>`;
    }

    const packElements = document.getElementsByClassName('server');
    for (const element of packElements) {
        (element as HTMLDivElement).oncontextmenu = (event) =>
            openPackCtxMenu({ packID: (event.target as any).parentNode.getAttribute('data-id'), posX: event.pageX, posY: event.pageY, offline });
    }
}

function preInstall(packID: string) {
    const config: Config = ipcRenderer.sendSync('get-config');
    const packs = ipcRenderer.sendSync('get-packs');
    const pack = packs.find((p: Pack<boolean>) => p.id === packID);
    const installingPacks: Array<string> = ipcRenderer.sendSync('get-installing-packs');
    if (installingPacks.includes(pack.id)) return;
    const installSettings = document.getElementById('installSettings');
    installSettings.classList.remove('hidden');

    const currentFolder = document.getElementById('installLocation') as HTMLInputElement;
    currentFolder.value = `${config.packPath}\\${pack.identifier}`;

    const ram = document.getElementById('packRam') as HTMLInputElement;
    ram.value = config.ram.toString();

    const changeLocation = document.getElementById('changeLocation') as HTMLButtonElement;
    const installButton = document.getElementById('installPack') as HTMLButtonElement;
    const cancelButton = document.getElementById('cancelPackInstall') as HTMLButtonElement;

    changeLocation.onclick = async () => {
        const folder = await ipcRenderer.invoke('dialog:openDirectory', 'pack');
        if (folder === undefined) return;
        currentFolder.value = ipcRenderer.sendSync('path-join', folder, pack.identifier);
    };

    installButton.onclick = async () => {
        setInstalling(packID);
        config.packs.push({ id: packID, path: ipcRenderer.sendSync('path-join', currentFolder.value), ram: ram.valueAsNumber });
        ipcRenderer.sendSync('install-pack', pack.id, config);
        installSettings.classList.add('hidden');
    };

    cancelButton.onclick = async () => {
        installSettings.classList.add('hidden');
    };
}

function setInstalling(packID: string) {
    const pack = document.getElementById(packID);
    const button = pack.children[3].children[2] as HTMLButtonElement;
    const infoText = pack.children[4].children[0];
    button.style.background = '#1e4d19';
    button.innerText = 'Installing';
    infoText.innerHTML = 'Installing';
    button.style.pointerEvents = 'none';
}

function preUninstall(packID: string, offline: boolean) {
    const uninstallingPacks: Array<string> = ipcRenderer.sendSync('get-uninstalling-packs');
    if (uninstallingPacks.includes(packID)) return;
    const packElement = document.getElementById(packID);
    const uninstallConfirmation = document.getElementById('uninstallConfirmation');
    uninstallConfirmation.classList.remove('hidden');
    const span = uninstallConfirmation.children[0].children[1].children[0];
    span.innerHTML = packElement.children[2].children[1].innerHTML;

    const uninstallButton = document.getElementById('uninstallPack') as HTMLButtonElement;
    const cancelButton = document.getElementById('cancelPackUninstall') as HTMLButtonElement;

    const deleteAll = document.getElementById('deleteWorldsAndSettings') as HTMLInputElement;
    deleteAll.checked = false;
    uninstallButton.onclick = async () => {
        setUninstalling(packID);
        ipcRenderer.sendSync('uninstall-pack', { packID, deleteAll: deleteAll.checked, offline });
        uninstallConfirmation.classList.add('hidden');
    };

    cancelButton.onclick = async () => {
        uninstallConfirmation.classList.add('hidden');
    };
}

function setUninstalling(packID: string) {
    const pack = document.getElementById(packID);
    const button = pack.children[3].children[2] as HTMLButtonElement;
    const infoText = pack.children[4].children[0];
    button.style.background = '#952f2f';
    button.innerText = 'Uninstalling';
    infoText.innerHTML = 'Uninstalling';
    button.style.pointerEvents = 'none';
}

function createNotification(id: string, data: { title: string; body: string; progress?: number }) {
    const notificationBar = document.getElementById('notifications');
    let progress = +(data.progress ? data.progress : 0);
    if (progress >= 100) progress = 100;
    if (progress <= 0) progress = 0;
    notificationBar.innerHTML += `
        <div class="notification" id="notification_${id}">
                <div class="notificationText">
                    <h2>${data.title}</h2>
                    <h3>${data.body}</h3>
                </div>
                ${
                    typeof data.progress === 'number'
                        ? `<div class="notificationProgress">
                    <div class="notificationPercent">${progress}%</div>
                    <div role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100" style="--value: ${progress}"></div>
                </div>`
                        : ''
                }
            </div>
        `;

    setTimeout(() => {
        document.getElementById(`notification_${id}`).classList.add('fadeIn');
    }, 10);
}

function updateNotification(id: string, data: { title?: string; body?: string; progress?: number }) {
    const notification = document.getElementById(`notification_${id}`);
    if (!notification) return;
    const notificationTitle = notification.children[0].children[0].innerHTML;
    const notificationBody = notification.children[0].children[1].innerHTML;
    const notificationProgress = notification.children[1].children[1].ariaValueNow;
    let progress = +(data.progress ? data.progress : notificationProgress);
    if (progress >= 100) progress = 100;
    if (progress <= 0) progress = 0;
    notification.innerHTML = `
                <div class="notificationText">
                    <h2>${data.title ? data.title : notificationTitle}</h2>
                    <h3>${data.body ? data.body : notificationBody}</h3>
                </div>
                ${
                    typeof data.progress === 'number'
                        ? `<div class="notificationProgress">
                    <div class="notificationPercent">${Math.floor(progress)}%</div>
                    <div role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100" style="--value: ${progress}"></div>
                </div>`
                        : ''
                }
                
        `;
}

function deleteNotification(id: string) {
    const notification = document.getElementById(`notification_${id}`);
    if (!notification) return;
    setTimeout(() => notification.classList.remove('fadeIn'), 3000);
    setTimeout(() => notification.remove(), 500);
}

function openPackCtxMenu(options: { packID: string; posX: number; posY: number; offline: boolean; pack?: boolean }, element?: HTMLButtonElement) {
    const contextMenu = document.getElementById('context');
    const elements = document.getElementsByClassName('activePack');
    for (const element of elements) {
        element.classList.remove('activePack');
    }

    if (element && element.classList.contains('packCtxMenuButton')) {
        if (contextMenu.getAttribute('data-id') === options.packID) {
            contextMenu.setAttribute('data-id', '');
            return contextMenu.classList.add('hidden');
        }
        contextMenu.setAttribute('data-id', options.packID);
    } else {
        contextMenu.setAttribute('data-id', '');
    }
    const packs = ipcRenderer.sendSync('get-packs');

    contextMenu.classList.add('hidden');
    const packElement = document.getElementById(options.packID);
    packElement.classList.add('activePack');
    const pack = packs.find((pack: Pack<boolean>) => pack.id === options.packID);
    contextMenu.classList.add('invisible');
    contextMenu.classList.remove('hidden');
    for (const child of contextMenu.children) {
        child.classList.add('hidden');
    }

    const playButton = contextMenu.children[0];
    const updateButton = contextMenu.children[1];
    const installButton = contextMenu.children[2];
    const uninstallButton = contextMenu.children[3];
    const downloadWorldButton = contextMenu.children[4];
    const firstHR = contextMenu.children[5];
    const openFolderButton = contextMenu.children[6];
    const settingsButton = contextMenu.children[7];
    const secondHR = contextMenu.children[8];
    const websiteButton = contextMenu.children[9];
    const curseforgeButton = contextMenu.children[10];
    const modrinthButton = contextMenu.children[11];
    if (packElement.classList.contains('downloaded')) {
        const packDir = new URL((ipcRenderer.sendSync('get-config') as Config).packs.find((pack) => pack.id === options.packID).path);
        if (packElement.classList.contains('update')) {
            updateButton.classList.remove('hidden');
            updateButton.setAttribute('onclick', `window.dmc.updatePack('${options.packID}')`);
        } else {
            playButton.classList.remove('hidden');
            playButton.setAttribute('onclick', `window.dmc.playPack('${options.packID}')`);
        }
        uninstallButton.classList.remove('hidden');
        uninstallButton.setAttribute('onclick', `window.dmc.preUninstall('${options.packID}', ${options.offline})`);
        if (packElement.classList.contains('world')) {
            downloadWorldButton.classList.remove('hidden');
            downloadWorldButton.setAttribute('onclick', `window.dmc.downloadWorld('${options.packID}')`);
        }
        firstHR.classList.remove('hidden');
        openFolderButton.classList.remove('hidden');
        openFolderButton.setAttribute('onclick', `window.dmc.openFolder('${packDir}')`);
        settingsButton.classList.remove('hidden');
    }
    if (packElement.classList.contains('notDownloaded')) {
        installButton.classList.remove('hidden');
        installButton.setAttribute('onclick', `window.dmc.preInstall('${options.packID}')`);
    }
    if (!options.offline) {
        secondHR.classList.remove('hidden');
        websiteButton.classList.remove('hidden');
        websiteButton.setAttribute('onclick', `window.dmc.openURL('https://dipped.dev/minecraft/${pack.identifier}')`);
        if (pack.link.type === 'curseforge') {
            curseforgeButton.classList.remove('hidden');
            curseforgeButton.setAttribute('onclick', `window.dmc.openURL('${pack.link.url}')`);
        } else {
            modrinthButton.classList.remove('hidden');
            modrinthButton.setAttribute('onclick', `window.dmc.openURL('${pack.link.url}')`);
        }
    }

    contextMenu.style.top = `${options.pack ? options.posY - contextMenu.clientHeight + window.scrollY : options.posY}px`;
    contextMenu.style.left = `${options.pack ? options.posX + 30 : options.posX}px`;
    if (+contextMenu.style.top.replace('px', '') + contextMenu.clientHeight + 10 > document.body.clientHeight)
        contextMenu.style.top = document.body.clientHeight - contextMenu.clientHeight - 10 + 'px';
    if (+contextMenu.style.left.replace('px', '') + contextMenu.clientWidth + 10 > document.body.clientWidth)
        contextMenu.style.left = pack ? options.posX - contextMenu.clientWidth - 20 + 'px' : options.posX - contextMenu.clientWidth + 'px';

    contextMenu.classList.remove('invisible');
}

const deepMergeObjects = (...objects: any) => {
    const deepCopyObjects = objects.map((object: any) => JSON.parse(JSON.stringify(object)));
    return deepCopyObjects.reduce((merged: any, current: any) => ({ ...merged, ...current }), {});
};

setInterval(() => {
    ipcRenderer.sendSync('fetch-packs');
}, 1000 * 60);
