import { Event } from '../event';
import { fetchPacks, validateSender } from '../index';

export default new Event(async (event) => {
    if (!validateSender(event.senderFrame)) return null;
    return fetchPacks();
});
