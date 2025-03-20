import { getApp, getConfig } from '../index';
import { Event } from '../event';
import { rm } from 'fs';

export default new Event(async (event) => {
    rm(getConfig().configPath, { recursive: true, force: true }, (err) => {
        if (err) return (event.returnValue = err);
        event.returnValue = 'success';
        getApp().quit();
    });
});
