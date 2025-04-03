import icon from '../assets/favicon_x256.png';
import TitleBarEnd from './TitleBarEnd';

export default function TitleBar() {
  return (
    <div id="titleBar">
      <img src={icon}></img>
      <div className="dragZone">Dipped MC</div>
      <div id="resizer" className="dragZone"></div>
      <div className="center">
        <button id="openModpacks">Modpacks</button>
        <button id="openServers">Servers</button>
        <button id="openSettings">Settings</button>
      </div>
      <div className="dragZone"></div>
      <TitleBarEnd></TitleBarEnd>
      <div className="dragZone" style={{ maxWidth: '20px' }}></div>
      <div className="windowButtons">
        <button onClick={window.dmc.appMinimize}>
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect fill="currentColor" width="10" height="1" x="1" y="6"></rect>
          </svg>
        </button>
        <button onClick={window.dmc.appMaximize}>
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect width="9" height="9" x="1.5" y="1.5" fill="none" stroke="currentColor"></rect>
          </svg>
        </button>
        <button id="appClose" onClick={window.dmc.appClose}>
          <svg width="12" height="12" viewBox="0 0 12 12">
            <polygon
              fill="currentColor"
              fillRule="evenodd"
              points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1"
            ></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
}
