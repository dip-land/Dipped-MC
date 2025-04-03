import axios from 'axios';
import fs from 'node:fs';
import path from 'node:path';
import xml2js from 'xml2js';
import type { LaunchConfig } from '..';
export const id = 'forge';
export async function downloadForge(forgeFilePath: string, gameVersion: string, launcherVersion: string): Promise<void> {
    fs.mkdirSync(path.dirname(forgeFilePath), { recursive: true });
    const metadata = await getMavenMetadata();
    const versions = metadata.versioning[0].versions[0].version;
    // Filter versions based on game version
    const filteredVersions = versions.filter((version: string) => version.includes(gameVersion + '-'));
    const latestVersion = launcherVersion ? filteredVersions.filter((v: string) => v.includes(launcherVersion))[0] : filteredVersions[0];
    const downloadLink = `https://maven.minecraftforge.net/net/minecraftforge/forge/${latestVersion}/forge-${latestVersion}-installer.jar`;
    const forgeResponse = await axios.get(downloadLink, {
        responseType: 'stream',
    });
    const writer = fs.createWriteStream(forgeFilePath);
    forgeResponse.data.pipe(writer);
    await new Promise((resolve, reject) => {
        writer.on('finish', () => {
            resolve(true);
        });
        writer.on('error', reject);
    });
}
export async function getMavenMetadata(): Promise<any> {
    const metadataUrl = 'https://maven.minecraftforge.net/net/minecraftforge/forge/maven-metadata.xml';
    const response = await axios.get(metadataUrl);
    const xmlData = response.data;
    const { metadata } = await xml2js.parseStringPromise(xmlData);
    return metadata;
}
/**
 * Downloads the latest forge jar and returns a partial MCLC config
 *
 * @export
 * @param {LaunchConfig} config
 */
export async function getMCLCLaunchConfig(config: LaunchConfig): Promise<{
    root: string;
    clientPackage: never | null;
    version: {
        number: string;
        type: string;
        custom: string;
    };
    forge: string;
}> {
    const versionPath = path.join(config.rootPath, 'versions', `forge-${config.gameVersion}`, 'forge.jar');
    await downloadForge(versionPath, config.gameVersion, config.launcherVersion);
    return {
        root: config.rootPath,
        clientPackage: null,
        version: {
            number: config.gameVersion,
            type: 'release',
            custom: `forge-${config.gameVersion}`,
        },
        forge: versionPath,
    };
}
export async function listSupportedVersions(): Promise<
    {
        version: string;
        stable: boolean;
    }[]
> {
    const metadata = await getMavenMetadata();
    const versions = metadata.versioning[0].versions[0].version;
    const supportedVersions = new Set();
    for (let i = 0; i < versions.length; i++) {
        const version = versions[i].split('-')[0];
        supportedVersions.add(version);
    }
    return Array.from(supportedVersions).map((v) => ({
        version: v as string,
        stable: true,
    }));
}
