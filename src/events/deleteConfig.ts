import { getApp, getConfig, validateSender } from '../index';
import { Event } from '../event';
import { rm } from 'fs';

export default new Event(async (event) => {
    if (!validateSender(event.senderFrame)) return null;
    rm(getConfig().configPath, { recursive: true, force: true }, (err) => {
        if (err) return err;
        getApp().quit();
    });
});
