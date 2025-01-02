'use strict';
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
exports.totalModsModLoader = exports.getMCLCLaunchConfig = exports.downloadForge = exports.id = void 0;
const axios_1 = __importDefault(require('axios'));
const fs_1 = __importDefault(require('fs'));
const path_1 = __importDefault(require('path'));
const xml2js_1 = __importDefault(require('xml2js'));
exports.id = 'forge';
async function downloadForge(forgeFilePath, gameVersion, launcherVersion) {
    fs_1.default.mkdirSync(path_1.default.dirname(forgeFilePath), { recursive: true });
    const metadataUrl = 'https://maven.minecraftforge.net/net/minecraftforge/forge/maven-metadata.xml';
    const response = await axios_1.default.get(metadataUrl);
    const xmlData = response.data;
    const { metadata } = await xml2js_1.default.parseStringPromise(xmlData);
    const versions = metadata.versioning[0].versions[0].version;
    // Filter versions based on game version
    const filteredVersions = versions.filter((version) => version.includes(gameVersion));
    console.log(filteredVersions);
    // Sort filtered versions to get the latest one
    const latestVersion = launcherVersion ? launcherVersion : filteredVersions[0];
    const downloadLink = `https://maven.minecraftforge.net/net/minecraftforge/forge/${latestVersion}/forge-${latestVersion}-installer.jar`;
    const forgeResponse = await axios_1.default.get(downloadLink, {
        responseType: 'stream',
    });
    const writer = fs_1.default.createWriteStream(forgeFilePath);
    forgeResponse.data.pipe(writer);
    await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}
exports.downloadForge = downloadForge;
/**
 * Downloads the latest forge jar and returns a partial MCLC config
 *
 * @export
 * @param {LaunchConfig} config
 */
async function getMCLCLaunchConfig(config) {
    console.log(config);
    const versionPath = path_1.default.join(config.rootPath, 'versions', `forge-${config.gameVersion}`, 'forge.jar');
    await downloadForge(versionPath, config.gameVersion, config.launcherVersion);
    return {
        root: config.rootPath,
        clientPackage: null,
        version: {
            number: config.gameVersion,
            type: 'release',
        },
        forge: versionPath,
    };
}
exports.getMCLCLaunchConfig = getMCLCLaunchConfig;
exports.totalModsModLoader = {
    overrideMods: {},
    modrinthCategories: ['forge'],
    curseforgeCategory: '1',
};
//# sourceMappingURL=forge.js.map
