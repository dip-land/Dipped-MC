import { Event } from '../event';
import { editKey, validateSender } from '../index';

export default new Event(async (event) => {
    if (!validateSender(event.senderFrame)) return null;
    try {
        editKey({});
        event.sender.reload();
        return true;
    } catch (error) {
        return false;
    }
});
