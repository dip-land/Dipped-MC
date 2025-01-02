"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.totalModsModLoader = exports.getMCLCLaunchConfig = exports.getProfile = exports.getLoaders = exports.id = void 0;
const axios_1 = __importDefault(require("axios"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
exports.id = 'quilt';
const api = axios_1.default.create({
    baseURL: 'https://meta.quiltmc.org/v3/',
});
async function getLoaders() {
    const loaders = await api.get('/versions/loader');
    if (loaders.data.length <= 0)
        throw new Error('Error while fetching quilt metadata; Loader length is zero');
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
    const versionPath = path_1.default.join(config.rootPath, 'versions', `quilt-${config.gameVersion}`, `quilt-${config.gameVersion}.json`);
    fs_1.default.mkdirSync(path_1.default.dirname(versionPath), { recursive: true });
    fs_1.default.writeFileSync(versionPath, JSON.stringify(profile));
    return {
        root: config.rootPath,
        version: {
            number: config.gameVersion,
            type: 'release',
            custom: `quilt-${config.gameVersion}`,
        },
    };
}
exports.getMCLCLaunchConfig = getMCLCLaunchConfig;
exports.totalModsModLoader = {
    overrideMods: {
        P7dR8mSH: 'qvIfYCYJ',
        '308769': '634179',
        Ha28R6CL: 'lwVhp9o5',
        '306612': '720410', // Fabric Language Kotlin -> QKL
    },
    modrinthCategories: ['quilt', 'fabric'],
    curseforgeCategory: '5',
};
//# sourceMappingURL=quilt.js.map