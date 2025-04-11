import { useState } from 'react';
import { Config, Server as ServerType } from '../../../main/types';

export default function Server({ server, local }: { server: ServerType; local: Config['packs'][0] | undefined }) {
  const [image, setImage] = useState('');

  async function fetchImage() {
    const image = await window.dmc.loadIcon(server.id, 1);
    setImage(image);
  }
  fetchImage();
  const serverStatus = server.status === 'current' ? (server.online ? 'Online' : 'Offline') : 'Archived';
  return (
    <>
      <div id={server.id + '_Server'} className={'server ' + serverStatus.toLowerCase()}>
        <img className="serverIcon" src={image}></img>
        <div className="serverInfoContainer">
          <h1 className="serverName">{server.name}</h1>
          <div className="serverInfo">
            <div className="serverStatusIndicator"></div>
            <h3 className="serverStatus">{serverStatus}</h3>
            <div className={'playerCount' + serverStatus !== 'Online' ? 'hidden' : ''}>0 Player(s)</div>
          </div>
        </div>
        <div className="serverButtons">
          {serverStatus === 'Online' && local ? <button onClick={() => window.dmc.playPack(server.id, server.ip)}>Join Server</button> : ''}
          {!local ? <button onClick={() => window.dmc.preInstall(server.id)}>Install Pack</button> : ''}
          {/* window.dmc.downloadWorld(server.id) */}
          {server.download && local ? <button onClick={() => ''}>Download Archived World</button> : ''}
        </div>
      </div>
    </>
  );
}
