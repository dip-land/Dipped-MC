import { Event } from '../event';
import { getInstalling, validateSender } from '../index';

export default new Event(async (event) => {
    if (!validateSender(event.senderFrame)) return null;
    return getInstalling();
});
