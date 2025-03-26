import { Event } from '../event';
import { authManager, editKey, getConfig, getKey, getPacks, getUpdating, getWindows, validateSender } from '../index';
import { Client, Authenticator, IUser } from 'minecraft-launcher-core';
import { fabric, forge } from '../tomate-loaders/index';
// eslint-disable-next-line import/no-unresolved
import { tokenUtils } from 'msmc';
import { dialog } from 'electron';
import type { MclcUser } from 'msmc/types/types';

const launcher = new Client();

export default new Event(async (event, id) => {
    if (!validateSender(event.senderFrame)) return null;
    const config = getConfig();
    const key = getKey();
    const window = getWindows().main;
    const loadingWindow = getWindows().secondary;
    const pack = (await getPacks()).find((p) => p.id === id);
    const packConfig = config.packs.find((p) => p.id === id);
    const updating = getUpdating();
    if (!pack || updating.includes(pack.id)) return false;
    console.log(`Launching Pack ${pack.name} ${pack.launcher}-${pack.launcherVersion}`);
    window.hide();
    loadingWindow.webContents.executeJavaScript('document.getElementById("infoText").innerText = "Starting Minecraft"');
    loadingWindow.webContents.executeJavaScript('document.getElementById("infoTextLower").innerText = "First time launch may take awhile..."');
    loadingWindow.show();
    const launchConfig =
        pack.launcher === 'forge'
            ? await forge.getMCLCLaunchConfig({
                  gameVersion: pack.gameVersion,
                  rootPath: packConfig.path,
                  launcherVersion: pack.launcherVersion,
              })
            : await fabric.getMCLCLaunchConfig({
                  gameVersion: pack.gameVersion,
                  rootPath: packConfig.path,
                  launcherVersion: pack.launcherVersion,
              });
    launcher.launch({
        ...launchConfig,
        authorization: (key as IUser) ?? Authenticator.getAuth('offline'),
        memory: {
            min: 2000,
            max: packConfig.ram * 1000,
        },
        javaPath: 'javaw',
    });

    let flag = false;
    launcher.on('data', () => {
        if (flag === false) {
            flag = true;
            setTimeout(() => {
                loadingWindow.hide();
            }, 60000 * 5);
        }
    });
    launcher.on('close', async (code) => {
        loadingWindow.hide();
        window.show();
        window.maximize();
        window.focus();
        if (code === 0) {
            console.log('User Exited Minecraft');
        } else {
            console.log('Minecraft Crashed');
            dialog.showErrorBox(`Minecraft Error`, `Minecraft exited with code ${code}, which is considered a crash`);
        }

        //regen key on close
        if (Object.prototype.hasOwnProperty.call(key, 'access_token')) {
            const oldKey = await tokenUtils.fromMclcToken(authManager, key as MclcUser);
            const newKey = await oldKey!.refresh(true);
            editKey(newKey.mclc(true));
        }
    });
});
