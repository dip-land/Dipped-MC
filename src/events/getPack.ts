import { Event } from '../event';
import { getPacks, validateSender } from '../index';

export default new Event(async (event, id) => {
    if (!validateSender(event.senderFrame)) return null;
    return (await getPacks()).find((pack) => pack.id === id);
});
