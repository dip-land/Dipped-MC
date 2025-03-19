import axios from 'axios';
import fs from 'node:fs';
import path from 'node:path';
import { type LaunchConfig } from '..';
export const id = 'fabric';
export type Loader = {
    separator: string;
    build: number;
    maven: string;
    version: string;
    stable: boolean;
};
const api = axios.create({
    baseURL: 'https://meta.fabricmc.net/v2',
});
export async function getLoaders(): Promise<Loader[]> {
    const loaders = await api.get('/versions/loader');
    if (loaders.data.length <= 0) throw new Error('Error while fetching fabric metadata; Loader length is zero');
    return loaders.data;
}
export async function getProfile(gameVersion: string, loaderVersion: string): Promise<unknown> {
    const profile = await api.get(`/versions/loader/${gameVersion}/${loaderVersion}/profile/json`);
    return profile.data;
}
/**
 * Downloads the latest version json and returns a partial MCLC config
 *
 * @export
 * @param {LaunchConfig} config
 */
export async function getMCLCLaunchConfig(config: LaunchConfig): Promise<{
    root: string;
    version: {
        number: string;
        type: string;
        custom: string;
    };
}> {
    const loaders = await getLoaders();
    const launcherVersion = config.launcherVersion;
    const profile = await getProfile(config.gameVersion, launcherVersion ? launcherVersion : loaders[0].version);
    const versionPath = path.join(config.rootPath, 'versions', `fabric-${config.gameVersion}`, `fabric-${config.gameVersion}.json`);
    fs.mkdirSync(path.dirname(versionPath), { recursive: true });
    fs.writeFileSync(versionPath, JSON.stringify(profile));
    return {
        root: config.rootPath,
        version: {
            number: config.gameVersion,
            type: 'release',
            custom: `fabric-${config.gameVersion}`,
        },
    };
}
export async function listSupportedVersions(): Promise<
    {
        version: string;
        stable: boolean;
    }[]
> {
    return (await api.get('/versions/game')).data;
}
