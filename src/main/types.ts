export interface Config {
  configPath: string;
  installed: number;
  packPath: string;
  theme: string;
  ram: number;
  sortAndFilters: {
    modpackSort: 'installed' | 'uninstalled' | 'new' | 'old' | 'asc' | 'desc';
    modpackFilter: 'all' | 'installed' | 'uninstalled';
  };
  packs: Array<{ id: string; path: string; ram: number }>;
}

export interface WebPack {
  id: string;
  status: string;
  online: boolean;
  version: string;
  name: string;
  identifier: string;
  serverDates: { start: string; end: string };
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
      serverDates: { start: string; end: string };
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
      serverDates: { start: string | undefined; end: string | undefined };
      link: { type: 'curseforge' | 'modrinth' | undefined; url: string | undefined };
      installed: boolean;
      gameVersion: string;
      launcher: 'forge' | 'fabric';
      launcherVersion: string;
      local: { id: string; path: string; ram: number };
    };

export interface Server {
  id: string;
  status: 'archived' | 'current';
  online: boolean;
  ip: string | undefined;
  name: string;
  identifier: string;
  players: number;
  download: boolean;
}
