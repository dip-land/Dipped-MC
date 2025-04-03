import { Config, Pack, WebPack, LocalPack, Server } from '../main/types';

declare global {
  interface Window {
    dmc: {
      appClose: () => Promise<void>;
      appMaximize: () => Promise<void>;
      appMinimize: () => Promise<void>;
      appUpdate: () => Promise<void>;
      deleteConfig: () => Promise<'success' | Error>;
      devTools: (shouldOpen: boolean) => void;
      editConfig: (newConfig: Config) => Promise<void>;
      editPackConfig: (id: string, data: { path?: string; ram?: number }) => Promise<void>;
      fetchPacks: () => Promise<void>;
      getConfig: () => Promise<Config>;
      getInstallingPacks: () => Promise<Array<string>>;
      getPack: (id: string) => Promise<Pack<boolean>>;
      getPacks: () => Promise<Array<Pack<boolean>>>;
      getServers: () => Promise<Array<Server>>;
      getStatus: () => Promise<-1 | 0 | 1>;
      getUninstallingPacks: () => Promise<Array<string>>;
      getUser: () => Promise<{
        name?: string;
        status: 'valid' | 'invalid' | 'offline';
        textures?: {
          CAPE: {
            url: string;
          };
          SKIN: {
            url: string;
          };
        };
        uuid?: string;
      }>;
      getVersions: () => Promise<{
        app: string;
        electron: string;
        chrome: string;
        node: string;
        v8: string;
      }>;
      loadIcon: (id: string, status: -1 | 0 | 1) => Promise<string>;
      login: () => Promise<void>;
      logout: () => Promise<void>;
      movePack: (id: string, path: string) => Promise<void>;
      openFolder: (path: string) => Promise<true>;
      openURL: (url: string) => Promise<true>;
      pathJoin: (...args: string[]) => Promise<string>;
      playPack: (id: string, ip?: string) => Promise<void>;
      reload: () => Promise<void>;
      selectFolder: (type: 'pack') => Promise<string>;

      createNotification: (id: string, data: { title: string; body: string; progress?: number }) => void;
      deleteNotification: (id: string) => void;
      openSettingsToPack: (packID: string) => void;
      preInstall: (packID: string) => Promise<void>;
      preUninstall: (packID: string) => Promise<void>;
      preUpdate: (packID: string) => Promise<void>;
      reloadPacks: () => Promise<void>;
      setInstalling: (packID: string) => void;
      setUninstalling: (packID: string) => void;
      setUpdating: (packID: string) => void;
      updateNotification: (id: string, data: { title?: string; body?: string; progress?: number }) => void;
    };
  }
}
