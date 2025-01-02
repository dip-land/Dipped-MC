"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.totalModsModLoader = exports.getMCLCLaunchConfig = exports.getProfile = exports.getLoaders = exports.id = void 0;
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
exports.id = 'fabric';
const api = axios_1.default.create({
    baseURL: 'https://meta.fabricmc.net/v2',
});
async function getLoaders() {
    const loaders = await api.get('/versions/loader');
    if (loaders.data.length <= 0)
        throw new Error('Error while fetching fabric metadata; Loader length is zero');
    return loaders.data;
}
exports.getLoaders = getLoaders;
async function getProfile(gameVersion, loaderVersion) {
    const profile = await api.get(`/versions/loader/${gameVersion}/${loaderVersion}/profile/json`);
    return profile.data;
}
exports.getProfile = getProfile;
/**
 * Downloads the latest version json and returns a partial MCLC config
 *
 * @export
 * @param {LaunchConfig} config
 */
async function getMCLCLaunchConfig(config) {
    const loaders = await getLoaders();
    const profile = await getProfile(config.gameVersion, loaders[0].version);
    const versionPath = path_1.default.join(config.rootPath, 'versions', `fabric-${config.gameVersion}`, `fabric-${config.gameVersion}.json`);
    fs_1.default.mkdirSync(path_1.default.dirname(versionPath), { recursive: true });
    fs_1.default.writeFileSync(versionPath, JSON.stringify(profile));
    return {
        root: config.rootPath,
        version: {
            number: config.gameVersion,
            type: 'release',
            custom: `fabric-${config.gameVersion}`,
        },
    };
}
exports.getMCLCLaunchConfig = getMCLCLaunchConfig;
exports.totalModsModLoader = {
    overrideMods: {},
    modrinthCategories: ['fabric'],
    curseforgeCategory: '4',
};
//# sourceMappingURL=fabric.js.map