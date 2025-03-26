import { Event } from '../classes/event';
import { authManager, editKey, validateSender } from '../index';

export default new Event(async (event) => {
    if (!validateSender(event.senderFrame)) return null;
    try {
        const xboxManager = await authManager.launch('raw');
        const token = await xboxManager.getMinecraft();
        editKey(token.mclc(true));
        event.sender.reload();
        return true;
    } catch (error) {
        return false;
    }
});
