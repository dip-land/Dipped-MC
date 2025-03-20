import path from 'path';
import { Event } from '../event';
import { addUninstalling, editConfig, fetchPacks, getConfig, getPacks, getUninstalling, getWindows, removeUninstalling } from '../index';
import { existsSync, mkdirSync, rename } from 'fs';
import { rmdir } from 'fs/promises';

export default new Event(async (event, options: { packID: string; deleteAll?: boolean; offline: boolean }) => {
    const window = getWindows().main;
    const config = getConfig();
    const packs = await getPacks();
    if (getUninstalling().includes(options.packID)) return (event.returnValue = false);
    event.returnValue = true;
    addUninstalling(options.packID);
    const packDir = config.packs.find((pack) => pack.id === options.packID)?.path;
    const pack = packs.find((pack) => pack.id === options.packID);
    if (!packDir || !pack) return (event.returnValue = false);
    if (!options.deleteAll) {
        if (!existsSync(path.join(config.packPath, 'uninstalled', options.packID))) mkdirSync(path.join(config.packPath, 'uninstalled', options.packID), { recursive: true });
        rename(path.join(packDir, 'saves'), path.join(config.packPath, 'uninstalled', options.packID, 'saves'), (e) => {
            console.log(e);
        });
        rename(path.join(packDir, 'options.txt'), path.join(config.packPath, 'uninstalled', options.packID, 'options.txt'), (e) => {
            console.log(e);
        });
    }

    rmdir(packDir, { recursive: true })
        .then(async () => {
            window.webContents.executeJavaScript(
                `window.dmc.createNotification("${options.packID}_u_complete", { title: "Uninstall Successful", body: '${pack.name} Uninstalled'})`
            );
            const packIndex = config.packs.findIndex((pack) => pack.id === options.packID);
            const shadowConfig = config;
            shadowConfig.packs.splice(packIndex, 1);
            editConfig(shadowConfig);
            await fetchPacks();
            window.webContents.executeJavaScript(`window.dmc.reloadPacks(${options.offline})`);
            setTimeout(() => window.webContents.executeJavaScript(`window.dmc.deleteNotification("${options.packID}_u_complete")`), 3000);
            removeUninstalling(pack.id);
        })
        .catch((e) => {
            console.log(e);
        });
});
