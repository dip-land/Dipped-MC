import { Event } from '../classes/event';
import { getWindows, validateSender } from '../index';
import { dialog } from 'electron';

export default new Event(async (event) => {
    if (!validateSender(event.senderFrame)) return null;
    const window = getWindows().main;
    const { canceled, filePaths } = await dialog.showOpenDialog(window, {
        properties: ['openDirectory'],
    });
    if (canceled) {
        return null;
    } else {
        return filePaths[0];
    }
});
