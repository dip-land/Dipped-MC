import path from 'path';
import { Event } from '../event';
import { readFileSync } from 'fs';
import { getConfig } from '../index';

export default new Event(async (event, id) => {
    const pack = getConfig().packs.find((p) => p.id === id);
    if (!pack) return (event.returnValue = false);
    const data = readFileSync(path.join(pack.path, 'packIcon.png'));
    event.returnValue = `data:image/png;base64,${data.toString('base64')}`;
});
