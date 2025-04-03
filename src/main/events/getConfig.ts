import { Event } from '../classes/event';
import { getConfig, validateSender } from '../index';

export default new Event(async (event) => {
    if (!validateSender(event.senderFrame)) return null;
    return getConfig();
});
