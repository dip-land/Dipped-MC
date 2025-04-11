import { contextBridge, ipcRenderer } from 'electron';
import { Config, Pack } from '../main/types';

const api = {
  appClose: () => ipcRenderer.invoke('app-close'),
  appMaximize: () => ipcRenderer.invoke('app-maximize'),
  appMinimize: () => ipcRenderer.invoke('app-minimize'),
  appUpdate: () => ipcRenderer.invoke('app-update'),
  deleteConfig: () => ipcRenderer.invoke('delete-config'),
  devTools: (shouldOpen: boolean) => ipcRenderer.invoke('devtools', shouldOpen),
  editConfig: (newConfig: Config) => ipcRenderer.invoke('edit-config', newConfig),
  editPackConfig: (id: string, data: { path?: string; ram?: number }) => ipcRenderer.invoke('edit-pack-config', id, data),
  fetchPacks: () => ipcRenderer.invoke('fetch-packs'),
  functions: [{ name: '', function: null }],
  getConfig: () => ipcRenderer.invoke('get-config') as Promise<Config>,
  getInstallingPacks: () => ipcRenderer.invoke('get-installing-packs'),
  getPack: (id: string) => ipcRenderer.invoke('get-pack', id),
  getPacks: () => ipcRenderer.invoke('get-packs'),
  getServers: () => ipcRenderer.invoke('get-servers'),
  getStatus: () => ipcRenderer.invoke('get-status'),
  getUninstallingPacks: () => ipcRenderer.invoke('get-uninstalling-packs'),
  getUser: () => ipcRenderer.invoke('get-user'),
  getVersions: () => ipcRenderer.invoke('get-versions'),
  loadIcon: (id: string, status: -1 | 0 | 1) => ipcRenderer.invoke('load-icon', id, status),
  login: () => ipcRenderer.invoke('login'),
  logout: () => ipcRenderer.invoke('logout'),
  movePack: (id: string, path: string) => ipcRenderer.invoke('move-pack', id, path),
  openFolder: (path: string) => ipcRenderer.invoke('open-folder', path),
  openURL: (url: string) => ipcRenderer.invoke('open-url', url),
  pathJoin: (...args: string[]) => ipcRenderer.invoke('path-join', ...args),
  playPack: (id: string, ip?: string) => ipcRenderer.invoke('play-pack', id, ip),
  reload: () => ipcRenderer.invoke('reload'),
  selectFolder: (type: 'pack') => ipcRenderer.invoke('dialog:openDirectory', type),

  createNotification,
  deleteNotification,
  openSettingsToPack,
  preInstall,
  preUninstall,
  preUpdate,
  reloadPacks,
  setInstalling,
  setUninstalling,
  setUpdating,
  updateNotification
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('dmc', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.dmc = api;
}

async function reloadPacks() {
  const status = (await ipcRenderer.invoke('get-status')) as -1 | 0 | 1;
  const offline = status === 0 || status === -1;
  const dataNode = document.getElementById('data');
  if (!dataNode) return;
  if (offline) {
    document.getElementById('offlineWarning')?.classList.remove('hidden');
    document.getElementById('loginMode')?.classList.remove('hidden');
    document.getElementById('loginButton')?.classList.add('hidden');
  }
  dataNode.setAttribute('data-reload-packs', 'true');
}

function openSettingsToPack(id: string) {
  document.getElementById('openSettings')?.click();
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
  installSettings?.classList.remove('hidden');

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
    config.packs.push({
      id: packID,
      path: await ipcRenderer.invoke('path-join', currentFolder.value),
      ram: ram.valueAsNumber
    });
    ipcRenderer.invoke('install-pack', pack.id, config);
    installSettings?.classList.add('hidden');
  };

  cancelButton.onclick = () => {
    installSettings?.classList.add('hidden');
  };
}

function setInstalling(packID: string) {
  const pack = document.getElementById(packID);
  if (!pack) return;
  const button = [...pack.children[2].children].find((e) => e.classList.contains('installButton')) as HTMLButtonElement | undefined;
  const infoText = pack.children[3].children[0];
  if (!button || !infoText) return;
  button.style.background = '#1e4d19';
  button.innerText = 'Installing';
  infoText.innerHTML = 'Installing';
  button.style.pointerEvents = 'none';
}

async function preUninstall(packID: string) {
  const uninstallingPacks: Array<string> = await ipcRenderer.invoke('get-uninstalling-packs');
  if (uninstallingPacks.includes(packID)) return;
  const packElement = document.getElementById(packID);
  const uninstallConfirmation = document.getElementById('uninstallConfirmation');
  uninstallConfirmation?.classList.remove('hidden');
  const span = uninstallConfirmation?.children[0].children[1].children[0];
  if (span) span.innerHTML = packElement?.children[2].children[1].innerHTML ?? '';

  const uninstallButton = document.getElementById('uninstallPack') as HTMLButtonElement;
  const cancelButton = document.getElementById('cancelPackUninstall') as HTMLButtonElement;

  const deleteSettings = document.getElementById('deleteSettings') as HTMLInputElement;
  const deleteWorlds = document.getElementById('deleteWorlds') as HTMLInputElement;
  deleteSettings.checked = false;
  deleteWorlds.checked = false;
  uninstallButton.onclick = () => {
    setUninstalling(packID);
    ipcRenderer.invoke('uninstall-pack', {
      packID,
      deleteSettings: deleteSettings.checked,
      deleteWorlds: deleteWorlds.checked
    });
    uninstallConfirmation?.classList.add('hidden');
  };

  cancelButton.onclick = () => {
    uninstallConfirmation?.classList.add('hidden');
  };
}

function setUninstalling(packID: string) {
  const pack = document.getElementById(packID);
  if (!pack) return;
  const button = [...pack.children[2].children].find((e) => e.classList.contains('playButton')) as HTMLButtonElement | undefined;
  const infoText = pack.children[3].children[0];
  if (!button || !infoText) return;
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
  updateConfirmation?.classList.remove('hidden');
  const span = updateConfirmation?.children[0].children[1].children[0];
  if (span) span.innerHTML = packElement?.children[2].children[1].innerHTML ?? '';

  const updateButton = document.getElementById('updatePack') as HTMLButtonElement;
  const cancelButton = document.getElementById('cancelPackUpdate') as HTMLButtonElement;
  updateButton.onclick = () => {
    setUpdating(packID);
    ipcRenderer.invoke('update-pack', packID);
    updateConfirmation?.classList.add('hidden');
  };

  cancelButton.onclick = () => {
    updateConfirmation?.classList.add('hidden');
  };
}

function setUpdating(packID: string) {
  const pack = document.getElementById(packID);
  if (!pack) return;
  const button = [...pack.children[2].children].find((e) => e.classList.contains('playButton')) as HTMLButtonElement | undefined;
  const infoText = pack.children[3].children[0];
  if (!button || !infoText) return;
  button.style.background = '#1e4d19';
  button.innerText = 'Updating';
  infoText.innerHTML = 'Updating';
  button.style.pointerEvents = 'none';
  pack.children[2].children[1].remove();
}

function createNotification(id: string, data: { title: string; body: string; progress?: number }) {
  const notificationBar = document.getElementById('notifications') as HTMLElement;
  let progress = +(data.progress ? data.progress : 0);
  if (progress >= 100) progress = 100;
  if (progress <= 0) progress = 0;
  notificationBar.innerHTML += `
      <div class="notification" id="notification_${id}">
              <div class="notificationText">
                  <h2 id="notification_${id}_title">${data.title}</h2>
                  <h3 id="notification_${id}_body">${data.body}</h3>
              </div>
              ${
                typeof data.progress === 'number'
                  ? `<div class="notificationProgress" id="notification_${id}_progress">
                  <div class="notificationPercent">${progress}%</div>
                  <div role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100" style="--value: ${progress}"></div>
              </div>`
                  : ''
              }
          </div>
      `;

  setTimeout(() => {
    document.getElementById(`notification_${id}`)?.classList.add('fadeIn');
  }, 10);
}

function updateNotification(id: string, data: { title?: string; body?: string; progress?: number }) {
  const notificationTitle = document.getElementById(`notification_${id}_title`);
  const notificationBody = document.getElementById(`notification_${id}_body`);
  const notificationProgress = document.getElementById(`notification_${id}_progress`);
  if (!notificationTitle || !notificationBody) return;
  notificationTitle.innerText = data.title ? data.title : notificationTitle.innerText;
  notificationBody.innerText = data.body ? data.body : notificationBody.innerText;
  if (notificationProgress) {
    let progress = +(data.progress ? data.progress : (notificationProgress.children[1]?.getAttribute('aria-valuenow') ?? 0));
    if (progress >= 100) progress = 100;
    if (progress <= 0 || !progress) progress = 0;
    notificationProgress.children[0].innerHTML = `${Math.floor(progress)}%`;
    notificationProgress.children[1].setAttribute('aria-valuenow', `${progress}`);
    notificationProgress.children[1].setAttribute('style', `--value: ${progress}`);
  }
}

function deleteNotification(id: string) {
  const notification = document.getElementById(`notification_${id}`);
  if (!notification) return;
  setTimeout(() => {
    notification.classList.remove('fadeIn');
    setTimeout(() => notification.remove(), 240);
  }, 3000);
}
