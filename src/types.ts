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

declare global {
    interface Window {
        dmc: {
            deleteConfig: () => 'success' | Error;
            editConfig: (newConfig: Config) => Config;
            fetchPacks: () => void;
            getConfig: () => Config;
            getInstallingPacks: () => Array<string>;
            getPack: (id: string) => Pack<boolean>;
            getPacks: () => Array<Pack<boolean>>;
            getUninstallingPacks: () => Array<string>;
            getUser: () => void;
            loadIcon: (id: string) => string;
            login: () => void;
            logout: () => void;
            openFolder: (path: string) => true;
            openURL: (url: string) => true;
            pathJoin: (...args: string[]) => string;
            playPack: (id: string) => void;
            reload: () => void;

            createNotification: (id: string, data: { title: string; body: string; progress?: number }) => void;
            deleteNotification: (id: string) => void;
            openPackCtxMenu: (options: { packID: string; posX: number; posY: number; offline: boolean; pack?: boolean }) => void;
            preInstall: (packID: string) => void;
            preUninstall: (packID: string) => void;
            reloadPacks: (offline: boolean) => void;
            selectFolder: (type: 'pack') => string;
            setInstalling: (packID: string) => void;
            setUninstalling: (packID: string) => void;
            updateNotification: (id: string, data: { title?: string; body?: string; progress?: number }) => void;
        };
    }
}
