import { Event } from '../classes/event';
import { getApp, validateSender } from '../index';

export default new Event(async (event) => {
    if (!validateSender(event.senderFrame)) return null;
    const app = getApp();
    app.relaunch();
    app.exit();
});
