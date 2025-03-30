import { editPackConfig, validateSender } from '../index';
import { Event } from '../classes/event';

export default new Event(async (event, id, data) => {
    if (!validateSender(event.senderFrame)) return null;
    return editPackConfig(id, data);
});
