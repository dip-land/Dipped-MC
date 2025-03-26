import { Event } from '../classes/event';
import { getPacks, validateSender } from '../index';

export default new Event(async (event) => {
    if (!validateSender(event.senderFrame)) return null;
    return await getPacks();
});
