export interface Config {
    configPath: string;
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
          local: undefined;
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
          local: { id: string; path: string; ram: number };
      };
declare global {
    interface Window {
        dmc: {
            deleteConfig: () => Promise<'success' | Error>;
            editConfig: (newConfig: Config) => Promise<Config>;
            fetchPacks: () => Promise<void>;
            getConfig: () => Promise<Config>;
            getInstallingPacks: () => Promise<Array<string>>;
            getPack: (id: string) => Promise<Pack<boolean>>;
            getPacks: () => Promise<Array<Pack<boolean>>>;
            getUninstallingPacks: () => Promise<Array<string>>;
            getUser: () => Promise<void>;
            loadIcon: (id: string) => Promise<string>;
            login: () => Promise<void>;
            logout: () => Promise<void>;
            openFolder: (path: string) => Promise<true>;
            openURL: (url: string) => Promise<true>;
            pathJoin: (...args: string[]) => Promise<string>;
            playPack: (id: string) => Promise<void>;
            reload: () => Promise<void>;

            createNotification: (id: string, data: { title: string; body: string; progress?: number }) => void;
            deleteNotification: (id: string) => void;
            openPackCtxMenu: (options: { packID: string; posX: number; posY: number; offline: boolean; pack?: boolean }) => Promise<void>;
            preInstall: (packID: string) => Promise<void>;
            preUninstall: (packID: string) => Promise<void>;
            preUpdate: (packID: string) => Promise<void>;
            reloadPacks: (offline: boolean) => Promise<void>;
            selectFolder: (type: 'pack') => string;
            setInstalling: (packID: string) => void;
            setUninstalling: (packID: string) => void;
            setUpdating: (packID: string) => void;
            updateNotification: (id: string, data: { title?: string; body?: string; progress?: number }) => void;
        };
    }
}
