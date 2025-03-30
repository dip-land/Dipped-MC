// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';
import { Config, Pack } from './types';

contextBridge.exposeInMainWorld('dmc', {
    appClose: () => ipcRenderer.invoke('app-close'),
    appMaximize: () => ipcRenderer.invoke('app-maximize'),
    appMinimize: () => ipcRenderer.invoke('app-minimize'),
    appUpdate: () => ipcRenderer.invoke('app-update'),
    deleteConfig: () => ipcRenderer.invoke('delete-config'),
    devTools: (shouldOpen: boolean) => ipcRenderer.invoke('devtools', shouldOpen),
    editConfig: (newConfig: Config) => ipcRenderer.invoke('edit-config', newConfig),
    editPackConfig: (id: string, data: { path?: string; ram?: number }) => ipcRenderer.invoke('edit-pack-config', id, data),
    fetchPacks: () => ipcRenderer.invoke('fetch-packs'),
    getConfig: () => ipcRenderer.invoke('get-config') as Promise<Config>,
    getInstallingPacks: () => ipcRenderer.invoke('get-installing-packs'),
    getPack: (id: string) => ipcRenderer.invoke('get-pack', id),
    getPacks: () => ipcRenderer.invoke('get-packs'),
    getStatus: () => ipcRenderer.invoke('get-status'),
    getUninstallingPacks: () => ipcRenderer.invoke('get-uninstalling-packs'),
    getUser: () => ipcRenderer.invoke('get-user'),
    getVersions: () => ipcRenderer.invoke('get-versions'),
    loadIcon: (id: string, status: { api: boolean; network: boolean }) => ipcRenderer.invoke('load-icon', id, status),
    login: () => ipcRenderer.invoke('login'),
    logout: () => ipcRenderer.invoke('logout'),
    movePack: (id: string, path: string) => ipcRenderer.invoke('move-pack', id, path),
    openFolder: (path: string) => ipcRenderer.invoke('open-folder', path),
    openURL: (url: string) => ipcRenderer.invoke('open-url', url),
    pathJoin: (...args: string[]) => ipcRenderer.invoke('path-join', ...args),
    playPack: (id: string) => ipcRenderer.invoke('play-pack', id),
    reload: () => ipcRenderer.invoke('reload'),
    selectFolder: (type: 'pack') => ipcRenderer.invoke('dialog:openDirectory', type),

    createNotification,
    deleteNotification,
    openPackCtxMenu,
    openSettingsToPack,
    preInstall,
    preUninstall,
    preUpdate,
    reloadPacks,
    setInstalling,
    setUninstalling,
    setUpdating,
    updateNotification,
});

async function reloadPacks() {
    const status = (await ipcRenderer.invoke('get-status')) as { api: boolean; network: boolean };
    const offline = !status.api;
    const packs = (await ipcRenderer.invoke('get-packs')) as Array<Pack<boolean>>;
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
        const image = await ipcRenderer.invoke('load-icon', pack.id, status);
        packsSection.innerHTML += `<div id="${pack.id}" data-id="${pack.id}" class="server ${pack.installed ? 'downloaded' : 'notDownloaded'} ${updatable ? 'update' : ''} ${
            worldDownload ? 'world' : ''
        }">
                    <div data-id="${pack.id}" class="serverBackground" style="background-image: url(&quot;${image}&quot;)"></div>
                    <div data-id="${pack.id}" class="serverContent">
                        <img class="serverIcon" src="${image}" width="140px" height="140px" alt="Pack Icon">
                        <span class="serverName">${pack.name}</span>
                    </div>
                    <div data-id="${pack.id}" class="serverButtons">
                        <button class="playButton" onclick="window.dmc.playPack('${pack.id}')">Play</button>
                        ${
                            offline
                                ? ''
                                : `<button class="updateButton" onclick="window.dmc.preUpdate('${pack.id}')">Update Pack</button>
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

function openSettingsToPack(id: string) {
    document.getElementById('openSettings').click();
    setTimeout(() => {
        window.location.href = `#${id}_Settings`;
    }, 250);
}

async function preInstall(packID: string) {
    const config: Config = await ipcRenderer.invoke('get-config');
    const packs = await ipcRenderer.invoke('get-packs');
    const pack = packs.find((p: Pack<boolean>) => p.id === packID);
    const installingPacks: Array<string> = await ipcRenderer.invoke('get-installing-packs');
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
        if (!folder) return;
        currentFolder.value = await ipcRenderer.invoke('path-join', folder, pack.identifier);
    };

    installButton.onclick = async () => {
        setInstalling(packID);
        config.packs.push({ id: packID, path: await ipcRenderer.invoke('path-join', currentFolder.value), ram: ram.valueAsNumber });
        ipcRenderer.invoke('install-pack', pack.id, config);
        installSettings.classList.add('hidden');
    };

    cancelButton.onclick = () => {
        installSettings.classList.add('hidden');
    };
}

function setInstalling(packID: string) {
    const pack = document.getElementById(packID);
    const button = pack.children[2].children[2] as HTMLButtonElement;
    const infoText = pack.children[3].children[0];
    button.style.background = '#1e4d19';
    button.innerText = 'Installing';
    infoText.innerHTML = 'Installing';
    button.style.pointerEvents = 'none';
}

async function preUninstall(packID: string, offline: boolean) {
    const uninstallingPacks: Array<string> = await ipcRenderer.invoke('get-uninstalling-packs');
    if (uninstallingPacks.includes(packID)) return;
    const packElement = document.getElementById(packID);
    const uninstallConfirmation = document.getElementById('uninstallConfirmation');
    uninstallConfirmation.classList.remove('hidden');
    const span = uninstallConfirmation.children[0].children[1].children[0];
    span.innerHTML = packElement.children[2].children[1].innerHTML;

    const uninstallButton = document.getElementById('uninstallPack') as HTMLButtonElement;
    const cancelButton = document.getElementById('cancelPackUninstall') as HTMLButtonElement;

    const deleteSettings = document.getElementById('deleteSettings') as HTMLInputElement;
    const deleteWorlds = document.getElementById('deleteWorlds') as HTMLInputElement;
    deleteSettings.checked = false;
    deleteWorlds.checked = false;
    uninstallButton.onclick = () => {
        setUninstalling(packID);
        ipcRenderer.invoke('uninstall-pack', { packID, deleteSettings: deleteSettings.checked, deleteWorlds: deleteWorlds.checked, offline });
        uninstallConfirmation.classList.add('hidden');
    };

    cancelButton.onclick = () => {
        uninstallConfirmation.classList.add('hidden');
    };
}

function setUninstalling(packID: string) {
    const pack = document.getElementById(packID);
    const button = pack.children[2].children[0] as HTMLButtonElement;
    const infoText = pack.children[3].children[0];
    button.style.background = '#952f2f';
    button.innerText = 'Uninstalling';
    infoText.innerHTML = 'Uninstalling';
    button.style.pointerEvents = 'none';
}

async function preUpdate(packID: string) {
    const updatingPacks: Array<string> = await ipcRenderer.invoke('get-updating-packs');
    if (updatingPacks.includes(packID)) return;
    const packElement = document.getElementById(packID);
    const updateConfirmation = document.getElementById('updateConfirmation');
    updateConfirmation.classList.remove('hidden');
    const span = updateConfirmation.children[0].children[1].children[0];
    span.innerHTML = packElement.children[2].children[1].innerHTML;

    const updateButton = document.getElementById('updatePack') as HTMLButtonElement;
    const cancelButton = document.getElementById('cancelPackUpdate') as HTMLButtonElement;
    updateButton.onclick = () => {
        setUpdating(packID);
        ipcRenderer.invoke('update-pack', packID);
        updateConfirmation.classList.add('hidden');
    };

    cancelButton.onclick = () => {
        updateConfirmation.classList.add('hidden');
    };
}

function setUpdating(packID: string) {
    const pack = document.getElementById(packID);
    const button = pack.children[2].children[0] as HTMLButtonElement;
    const infoText = pack.children[3].children[0];
    button.style.background = '#1e4d19';
    button.innerText = 'Updating';
    infoText.innerHTML = 'Updating';
    button.style.pointerEvents = 'none';
    pack.children[2].children[1].remove();
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
    const notificationProgress = notification.children[1]?.children[1].ariaValueNow;
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
    setTimeout(() => {
        notification.classList.remove('fadeIn');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

async function openPackCtxMenu(options: { packID: string; posX: number; posY: number; offline: boolean; pack?: boolean }, element?: HTMLButtonElement) {
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
    const packs = await ipcRenderer.invoke('get-packs');

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
        const packDir = new URL(((await ipcRenderer.invoke('get-config')) as Config).packs.find((pack) => pack.id === options.packID).path);
        playButton.classList.remove('hidden');
        playButton.setAttribute('onclick', `window.dmc.playPack('${options.packID}')`);
        if (packElement.classList.contains('update')) {
            updateButton.classList.remove('hidden');
            updateButton.setAttribute('onclick', `window.dmc.preUpdate('${options.packID}')`);
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
        settingsButton.setAttribute('onclick', `window.dmc.openSettingsToPack('${options.packID}')`);
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
