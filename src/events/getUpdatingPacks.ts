import { Event } from '../classes/event';
import { getUpdating, validateSender } from '../index';

export default new Event(async (event) => {
    if (!validateSender(event.senderFrame)) return null;
    return getUpdating();
});
