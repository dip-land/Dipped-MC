import { autoUpdater } from 'electron';
import { Event } from '../classes/event';
import { validateSender } from '../index';

export default new Event(async (event) => {
    if (!validateSender(event.senderFrame)) return null;
    autoUpdater.quitAndInstall();
});
