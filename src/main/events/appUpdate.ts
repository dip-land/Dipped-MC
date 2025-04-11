import { Event } from '../classes/event';
import { autoUpdater, validateSender } from '../index';

export default new Event(async (event) => {
  if (!validateSender(event.senderFrame)) return null;
  autoUpdater.quitAndInstall();
});
