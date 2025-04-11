import ThemeCard from './ThemeCard';
import icon from '../assets/favicon_x256.png';

export default function Settings(): JSX.Element {
  return (
    <div id="settingsSection" className="hidden">
      <aside id="settingsMenuBar">
        <a href="#appSettings">
          <img src={icon} />
        </a>
      </aside>
      <div id="settingsContent">
        <section id="appSettings">
          <br />
          <h1>App Settings</h1>
          <hr className="thin extraMargin" />
          <h3>Theme</h3>
          <ThemeCard name="Default"></ThemeCard>
          <ThemeCard name="Dark"></ThemeCard>
          <ThemeCard name="Light"></ThemeCard>
          <h3>Pack Defaults</h3>
          <label className="locationLabel" htmlFor="defaultInstallLocation">
            Default Install Location
          </label>
          <input id="defaultInstallLocation" type="text" name="defaultInstallLocation" disabled />
          <button id="changeDefaultLocation" className="basicButton">
            Change
          </button>
          <button id="openDefaultLocation" className="basicButton">
            Open
          </button>
          <label className="ramLabel" htmlFor="defaultRam">
            Default Pack Ram
          </label>
          <select id="defaultPackRam" name="defaultRam"></select>
        </section>
      </div>
    </div>
  );
}
