import { Event } from '../event';
import { addUpdating, apiServer, fetchPacks, getPacks, getUpdating, getWindows, removeUpdating, validateSender } from '../index';
import axios from 'axios';
import type { Pack } from '../types';
import { dialog } from 'electron';
import { rm, rmdirSync, writeFile } from 'node:fs';
import path from 'node:path';
import { mkdirp } from 'mkdirp';
import yauzl from 'yauzl';

export default new Event(async (event, id) => {
    if (!validateSender(event.senderFrame)) return null;
    if (getUpdating().includes(id)) return false;
    await fetchPacks();
    const packs = await getPacks();
    const pack = packs.find((p: Pack<boolean>) => p.id === id);
    if (!pack.localVersion || pack.localVersion === pack.serverVersion) return;
    addUpdating(pack.id);
    const window = getWindows().main;
    window.webContents.executeJavaScript(`window.dmc.createNotification("${id}_update", { title: "Updating", body: "${pack.name}", progress: 0})`);
    const controller = new AbortController();
    axios
        .get(`${apiServer}/minecraft/packs/update/${id}/${pack.serverVersion}`, {
            signal: controller.signal,
            responseType: 'arraybuffer',
            onDownloadProgress: (progressEvent) => {
                const percent = Math.floor((progressEvent.progress as number) * 100);
                window.setProgressBar(percent / 100 / 2);
                window.webContents.executeJavaScript(`window.dmc.updateNotification("${id}_update", { progress: ${percent / 2}})`);
            },
        })
        .then((res) => {
            window.setProgressBar(0.5);
            window.webContents.executeJavaScript(`window.dmc.updateNotification("${id}_update", { progress: 50})`);
            updatePack(window, pack, res.data);
            controller.abort();
        })
        .catch(() => {
            dialog.showErrorBox(`Failed to find server`, 'You are either not connected to the internet or the server is down');
            window.webContents.executeJavaScript(`window.dmc.deleteNotification("${pack.id}_update")`);
            window.setProgressBar(0);
        });
});

async function updatePack(window: Electron.BrowserWindow, pack: Pack<boolean>, data: string) {
    const packPath = pack.local.path;
    const updateFilePath = path.join(packPath, 'update.zip');
    try {
        writeFile(updateFilePath, Buffer.from(data, 'binary'), (err) => {
            if (err) dialog.showErrorBox(`Update Error`, `There was an error updating ${pack.name}. \n${err}`);
            unzip(updateFilePath, path.join(packPath, 'update'), pack.id)
                .then(() => {
                    window.setProgressBar(1);
                    rm(updateFilePath, () => {
                        window.setProgressBar(0);
                        window.webContents.executeJavaScript(
                            `window.dmc.createNotification("${pack.id}_complete", { title: "Update Successful", body: '"${pack.name}" is now ready to play'})`
                        );
                        window.webContents.executeJavaScript(`window.dmc.deleteNotification("${pack.id}_update")`);
                        window.webContents.executeJavaScript(`window.dmc.reloadPacks(false)`);
                        setTimeout(() => window.webContents.executeJavaScript(`window.dmc.deleteNotification("${pack.id}_complete")`), 3000);
                    });
                    rmdirSync(path.join(packPath, 'update'));
                    window.webContents.executeJavaScript(`window.dmc.fetchPacks()`);
                    removeUpdating(pack.id);
                })
                .catch((error) => {
                    console.log(error);
                    dialog.showErrorBox(`Update Error`, `There was an error updating ${pack.name}. \n${error}`);
                });
        });
    } catch (error) {
        console.log(error);
        dialog.showErrorBox(`Update Error`, `There was an error updating ${pack.name}. \n${error}`);
    }
}

async function unzip(zipPath: string, unzipToDir: string, packID: string) {
    const window = getWindows().main;
    const packs = await getPacks();
    const pack = packs.find((p: Pack<boolean>) => p.id === packID);
    return new Promise<void>((resolve, reject) => {
        try {
            mkdirp.sync(unzipToDir);
            yauzl.open(zipPath, { lazyEntries: true }, (err, zipFile) => {
                if (err) return reject(err);

                zipFile.readEntry();
                zipFile.on('entry', (entry) => {
                    const progress = zipFile.entriesRead / zipFile.entryCount / 2 + 0.5;
                    window.setProgressBar(progress);
                    window.webContents.executeJavaScript(`window.dmc.updateNotification("${packID}_update", { title: "Updating", progress: ${progress * 100}})`);
                    const chunks = [];
                    if (/\/$/.test(entry.fileName)) {
                        zipFile.readEntry();
                    } else {
                        zipFile.openReadStream(entry, function (err, readStream) {
                            if (err) throw err;
                            readStream.on('end', async function () {
                                const fileBuffer = Buffer.concat(chunks);
                                if (entry.fileName === 'remove.json') {
                                    const removeArray = JSON.parse(fileBuffer.toString());
                                    for (const target of removeArray) {
                                        rm(path.join(pack.local.path, target), (e) => {
                                            if (e) console.log(e);
                                        });
                                    }
                                } else {
                                    writeFile(path.join(pack.local.path, entry.fileName), fileBuffer.toString(), (e) => {
                                        if (e) console.log(e);
                                    });
                                }
                                zipFile.readEntry();
                            });
                            readStream.on('data', (data) => {
                                if (typeof data === 'string') {
                                    chunks.push(Buffer.from(data, 'utf-8'));
                                } else if (data instanceof Buffer) {
                                    chunks.push(data);
                                } else {
                                    const jsonData = JSON.stringify(data);
                                    chunks.push(Buffer.from(jsonData, 'utf-8'));
                                }
                            });
                        });
                    }
                });
                zipFile.on('end', () => resolve());
                zipFile.on('error', (err) => {
                    zipFile.close();
                    reject(err);
                });
            });
        } catch (e) {
            reject(e);
        }
    });
}
