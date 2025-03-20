import { Event } from '../event';
import { getApp } from '../index';

export default new Event(async () => {
    const app = getApp();
    app.relaunch();
    app.exit();
});
