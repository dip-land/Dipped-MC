"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSupportedVersions = exports.getVersionManifest = exports.getMCLCLaunchConfig = exports.id = void 0;
const axios_1 = __importDefault(require("axios"));
exports.id = 'vanilla';
/**
 * Downloads the latest version json and returns a partial MCLC config
 *
 * @export
 * @param {LaunchConfig} config
 */
async function getMCLCLaunchConfig(config) {
    return {
        root: config.rootPath,
        version: {
            number: config.gameVersion,
            type: 'release',
        },
    };
}
exports.getMCLCLaunchConfig = getMCLCLaunchConfig;
async function getVersionManifest() {
    return (await axios_1.default.get('https://piston-meta.mojang.com/mc/game/version_manifest_v2.json')).data;
}
exports.getVersionManifest = getVersionManifest;
async function listSupportedVersions() {
    const versionManifest = await getVersionManifest();
    return versionManifest.versions.map((version) => ({
        version: version.id,
        stable: version.type === 'release',
    }));
}
exports.listSupportedVersions = listSupportedVersions;
//# sourceMappingURL=vanilla.js.map