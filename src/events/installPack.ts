import axios from 'axios';
import { Event } from '../event';
import { apiServer, editConfig, getInstalling, getWindows, removeInstalling } from '../index';
import { dialog } from 'electron';
import { createWriteStream, existsSync, rename, rm, rmdir, writeFile } from 'node:fs';
import path from 'node:path';
import { mkdirp } from 'mkdirp';
import yauzl from 'yauzl';
import type { Config, LocalPack, WebPack } from '../types';

export default new Event(async (event, id, config) => {
    if (getInstalling().includes(id)) return;
    const window = getWindows().main;
    removeInstalling(id);
    editConfig(config);
    const packs = await (await fetch(`${apiServer}/minecraft/servers`)).json();
    const pack = packs.data.find((p: WebPack) => p.id === id);
    window.webContents.executeJavaScript(`window.dmc.createNotification("${id}", { title: "Downloading", body: "${pack.name}", progress: 0})`);
    const controller = new AbortController();
    axios
        .get(`${apiServer}/minecraft/packs/${id}`, {
            signal: controller.signal,
            responseType: 'arraybuffer',
            onDownloadProgress: (progressEvent) => {
                const percent = Math.floor((progressEvent.progress as number) * 100);
                window.setProgressBar(percent / 100 / 2);
                window.webContents.executeJavaScript(`window.dmc.updateNotification("${id}", { progress: ${percent / 2}})`);
            },
        })
        .then((res) => {
            window.setProgressBar(0.5);
            installPack(pack, config, res.data);
            controller.abort();
        })
        .catch(() => {
            dialog.showErrorBox(`Failed to find server`, 'You are either not connected to the internet or the server is down');
            window.webContents.executeJavaScript(`window.dmc.deleteNotification("${pack.id}")`);
            window.setProgressBar(0);
        });
});

async function installPack(pack: LocalPack, config: Config, data: string) {
    const window = getWindows().main;
    try {
        writeFile(path.join(config.packPath, `${pack.identifier}.zip`), Buffer.from(data, 'binary'), (err) => {
            if (err) dialog.showErrorBox(`Install Error`, `There was an error installing that pack. \n${err}`);
            const packDir = config.packs.find((p: Config['packs'][0]) => p.id === pack.id)?.path;
            if (!packDir) return;
            unzip(path.join(config.packPath, `${pack.identifier}.zip`), packDir, pack.id)
                .then(() => {
                    window.setProgressBar(1);
                    if (existsSync(path.join(config.packPath, 'uninstalled', pack.id))) {
                        rmdir(path.join(packDir, 'saves'), (e) => {
                            if (e) return;
                            rename(path.join(config.packPath, 'uninstalled', pack.id, 'saves'), path.join(packDir, 'saves'), (e) => {
                                if (e) console.log(e);
                            });
                        });
                        rm(path.join(packDir, 'options.txt'), (e) => {
                            if (e) return;
                            rename(path.join(config.packPath, 'uninstalled', pack.id, 'options.txt'), path.join(packDir, 'options.txt'), (e) => {
                                console.log(e);
                            });
                        });
                        rmdir(path.join(config.packPath, 'uninstalled', pack.id), (e) => {
                            if (e) return;
                        });
                    }
                    rm(path.join(config.packPath, `${pack.identifier}.zip`), () => {
                        window.setProgressBar(0);
                        window.webContents.executeJavaScript(
                            `window.dmc.createNotification("${pack.id}_complete", { title: "Install Successful", body: '"${pack.name}" is now ready to play'})`
                        );
                        window.webContents.executeJavaScript(`window.dmc.deleteNotification("${pack.id}")`);
                        window.webContents.executeJavaScript(`window.dmc.reloadPacks(false)`);
                        setTimeout(() => window.webContents.executeJavaScript(`window.dmc.deleteNotification("${pack.id}_complete")`), 3000);
                    });
                    window.webContents.executeJavaScript(`window.dmc.fetchPacks()`);
                    removeInstalling(pack.id);
                })
                .catch((error) => {
                    console.log(error);
                    dialog.showErrorBox(`Install Error`, `There was an error installing that pack. \n${error}`);
                });
        });
    } catch (error) {
        console.log(error);
        dialog.showErrorBox(`Install Error`, `There was an error installing that pack. \n${error}`);
    }
}

function unzip(zipPath: string, unzipToDir: string, packID: string) {
    const window = getWindows().main;
    return new Promise<void>((resolve, reject) => {
        try {
            mkdirp.sync(unzipToDir);
            yauzl.open(zipPath, { lazyEntries: true }, (err, zipFile) => {
                if (err) {
                    zipFile.close();
                    reject(err);
                    return;
                }
                zipFile.readEntry();
                zipFile.on('entry', (entry) => {
                    const progress = zipFile.entriesRead / zipFile.entryCount / 2 + 0.5;
                    window.setProgressBar(progress);
                    window.webContents.executeJavaScript(`window.dmc.updateNotification("${packID}", { title: "Installing", progress: ${progress * 100}})`);
                    try {
                        if (/\/$/.test(entry.fileName)) {
                            mkdirp.sync(path.join(unzipToDir, entry.fileName));
                            zipFile.readEntry();
                        } else {
                            zipFile.openReadStream(entry, (readErr, readStream) => {
                                if (readErr) {
                                    zipFile.close();
                                    reject(readErr);
                                    return;
                                }

                                const file = createWriteStream(path.join(unzipToDir, entry.fileName));
                                readStream.pipe(file);
                                file.on('finish', () => {
                                    file.close(() => {
                                        zipFile.readEntry();
                                    });

                                    file.on('error', (err) => {
                                        zipFile.close();
                                        reject(err);
                                    });
                                });
                            });
                        }
                    } catch (e) {
                        zipFile.close();
                        reject(e);
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
