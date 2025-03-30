import path from 'path';
import { Event } from '../classes/event';
import { addUninstalling, editConfig, fetchPacks, getConfig, getPacks, getUninstalling, getWindows, logger, removeUninstalling, validateSender } from '../index';
import { existsSync, mkdirSync, rename } from 'fs';
import { rmdir } from 'fs/promises';

export default new Event(async (event, options: { packID: string; deleteSettings?: boolean; deleteWorlds?: boolean; offline: boolean }) => {
    if (!validateSender(event.senderFrame)) return null;
    const window = getWindows().main;
    const config = getConfig();
    const packs = await getPacks();
    if (getUninstalling().includes(options.packID)) return false;
    addUninstalling(options.packID);
    const packDir = config.packs.find((pack) => pack.id === options.packID)?.path;
    const pack = packs.find((pack) => pack.id === options.packID);
    await window.webContents.executeJavaScript(`window.dmc.createNotification("${options.packID}_uninstall", { title: "Uninstalling", body: "${pack.name}"})`);
    if (!packDir || !pack) return false;
    if (!options.deleteSettings) {
        if (!existsSync(path.join(config.packPath, 'uninstalled', options.packID))) mkdirSync(path.join(config.packPath, 'uninstalled', options.packID), { recursive: true });
        rename(path.join(packDir, 'options.txt'), path.join(config.packPath, 'uninstalled', options.packID, 'options.txt'), (e) => {
            logger.error(e);
        });
    }
    if (!options.deleteWorlds) {
        if (!existsSync(path.join(config.packPath, 'uninstalled', options.packID))) mkdirSync(path.join(config.packPath, 'uninstalled', options.packID), { recursive: true });
        rename(path.join(packDir, 'saves'), path.join(config.packPath, 'uninstalled', options.packID, 'saves'), (e) => {
            logger.error(e);
        });
    }

    rmdir(packDir, { recursive: true })
        .then(async () => {
            const packIndex = config.packs.findIndex((pack) => pack.id === options.packID);
            const shadowConfig = config;
            shadowConfig.packs.splice(packIndex, 1);
            editConfig(shadowConfig);
            await fetchPacks();
            window.webContents.executeJavaScript(`window.dmc.reloadPacks(${options.offline})`);
            removeUninstalling(pack.id);
            window.webContents
                .executeJavaScript(`window.dmc.updateNotification("${options.packID}_uninstall", { title: "Uninstall Successful", body: "${pack.name} Uninstalled"})`)
                .then(() => {
                    setTimeout(() => window.webContents.executeJavaScript(`window.dmc.deleteNotification("${options.packID}_uninstall")`), 3000);
                });
        })
        .catch((e) => {
            logger.error(e);
        });
});
