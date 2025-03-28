import { Event } from '../classes/event';
import { getWindows, validateSender } from '../index';

export default new Event(async (event) => {
    if (!validateSender(event.senderFrame)) return null;
    const window = getWindows().main;
    window.minimize();
});
