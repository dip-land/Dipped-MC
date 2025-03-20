import { Event } from '../event';
import { authManager, editKey } from '../index';

export default new Event(async (event) => {
    try {
        const xboxManager = await authManager.launch('raw');
        const token = await xboxManager.getMinecraft();
        event.returnValue = editKey(token.mclc(true));
        event.sender.reload();
    } catch (error) {
        event.returnValue = false;
    }
});
