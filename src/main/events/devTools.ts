import { Event } from '../classes/event';
import { getWindows, validateSender } from '../index';

export default new Event(async (event, shouldOpen) => {
    if (!validateSender(event.senderFrame)) return null;
    const window = getWindows().main;
    if (shouldOpen) {
        window.webContents.openDevTools({ mode: 'detach' });
    } else {
        window.webContents.closeDevTools();
    }
});
