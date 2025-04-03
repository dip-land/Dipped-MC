import { useState } from 'react';
import { Pack } from '../../../main/types';

export default function Modpack({ pack, offline }: { pack: Pack<boolean>; offline: boolean }) {
  const [image, setImage] = useState('');

  async function fetchImage() {
    const image = await window.dmc.loadIcon(pack.id, offline ? 0 : 1);
    setImage(image);
  }
  const updatable = !offline && pack.installed && pack.localVersion !== pack.serverVersion;
  const version = updatable ? `v.${pack.localVersion} ->` : offline ? `v.${pack.localVersion}` : `v.${pack.serverVersion}`;
  const newVersion = updatable ? `v.${pack.serverVersion}` : '';
  fetchImage();
  return (
    <>
      <div id={pack.id} className={'modpack' + (pack.installed ? ' downloaded' : ' notDownloaded') + (updatable ? ' update' : '')}>
        <div className="modpackBackground" style={{ backgroundImage: `url("${image}")` }}></div>
        <div className="modpackContent">
          <img className="modpackIcon" src={image} width="140px" height="140px" alt="Pack Icon" />
          <span className="modpackName">{pack.name}</span>
        </div>
        <div className="modpackButtons">
          {pack.installed ? (
            <button className="playButton" onClick={() => window.dmc.playPack(pack.id)}>
              Play
            </button>
          ) : (
            <button className="installButton" onClick={() => window.dmc.preInstall(pack.id)}>
              Install Pack
            </button>
          )}
          {updatable ? (
            <button className="updateButton" onClick={() => window.dmc.preUpdate(pack.id)}>
              Update Pack
            </button>
          ) : (
            ''
          )}
          <button className="packCtxMenuButton" data-id={pack.id}>
            ︙
          </button>
        </div>
        <div className={'info' + (pack.installed && !updatable ? ' hidden' : '')}>
          <span>{!pack.installed ? 'Not Installed' : updatable ? 'Requires Update' : ''}</span>
        </div>
        <div className="version">
          <span className="versionNumber">{version}</span>
          {offline ? '' : <span className="newVersionNumber">{newVersion}</span>}
          <img className="modLoaderIcon" />
        </div>
      </div>
    </>
  );
}
