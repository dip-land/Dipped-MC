import { Event } from '../event';
import { getUninstalling, validateSender } from '../index';

export default new Event(async (event) => {
    if (!validateSender(event.senderFrame)) return null;
    return getUninstalling();
});
