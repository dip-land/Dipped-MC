import { editConfig, validateSender } from '../index';
import { Event } from '../event';

export default new Event(async (event, newConfig) => {
    if (!validateSender(event.senderFrame)) return null;
    return editConfig(newConfig);
});
