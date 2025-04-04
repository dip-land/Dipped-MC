import path from 'path';
import { Event } from '../classes/event';
import { validateSender } from '../index';

export default new Event(async (event, ...args) => {
    if (!validateSender(event.senderFrame)) return null;
    return path.join(...args);
});
