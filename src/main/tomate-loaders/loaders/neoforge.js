"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tomateModsModLoader = exports.listSupportedVersions = exports.getMCLCLaunchConfig = exports.getMavenMetadata = exports.downloadNeoForge = exports.id = void 0;
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const xml2js_1 = __importDefault(require("xml2js"));
exports.id = 'neoforge';
async function downloadNeoForge(neoForgeFilePath, gameVersion) {
    fs_1.default.mkdirSync(path_1.default.dirname(neoForgeFilePath), { recursive: true });
    const metadata = await getMavenMetadata();
    const versions = metadata.versioning[0].versions[0].version;
    const [_major, minor, patch] = gameVersion.split('.');
    // Filter versions based on game version
    const filteredVersions = versions.filter((version) => !version.includes('-beta') && version.includes(`${minor}.${patch}.`));
    const latestVersion = filteredVersions[0];
    const downloadLink = `https://maven.neoforged.net/releases/net/neoforged/neoforge/${latestVersion}/neoforge-${latestVersion}-installer.jar`;
    const neoForgeResponse = await axios_1.default.get(downloadLink, {
        responseType: 'stream',
    });
    const writer = fs_1.default.createWriteStream(neoForgeFilePath);
    neoForgeResponse.data.pipe(writer);
    await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}
exports.downloadNeoForge = downloadNeoForge;
async function getMavenMetadata() {
    const metadataUrl = 'https://maven.neoforged.net/releases/net/neoforged/neoforge/maven-metadata.xml';
    const response = await axios_1.default.get(metadataUrl);
    const xmlData = response.data;
    const { metadata } = await xml2js_1.default.parseStringPromise(xmlData);
    return metadata;
}
exports.getMavenMetadata = getMavenMetadata;
/**
 * Downloads the latest neoforge jar and returns a partial MCLC config
 *
 * @export
 * @param {LaunchConfig} config
 */
async function getMCLCLaunchConfig(config) {
    const versionPath = path_1.default.join(config.rootPath, 'versions', `neoforge-${config.gameVersion}`, 'neoforge.jar');
    await downloadNeoForge(versionPath, config.gameVersion);
    return {
        root: config.rootPath,
        clientPackage: null,
        version: {
            number: config.gameVersion,
            type: 'release',
            custom: `neoforge-${config.gameVersion}`,
        },
        forge: versionPath,
    };
}
exports.getMCLCLaunchConfig = getMCLCLaunchConfig;
async function listSupportedVersions() {
    const metadata = await getMavenMetadata();
    const versions = metadata.versioning[0].versions[0].version;
    const supportedVersions = new Set();
    for (let i = 0; i < versions.length; i++) {
        const version = versions[i];
        // Filter out beta versions
        if (version.includes('-beta')) {
            continue;
        }
        const [major, minor] = version.split('.');
        supportedVersions.add(`1.${major}.${minor}`);
    }
    return Array.from(supportedVersions).map((v) => ({
        version: v,
        stable: true,
    }));
}
exports.listSupportedVersions = listSupportedVersions;
exports.tomateModsModLoader = {
    overrideMods: {},
    modrinthCategories: ['neoforge'],
    curseforgeCategory: '6',
};
//# sourceMappingURL=neoforge.js.map