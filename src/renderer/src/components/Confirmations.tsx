export function InstallConfirmation(): JSX.Element {
  return (
    <div id="installSettings" className="confirmation hidden">
      <div className="content">
        <h1>Install Settings</h1>
        <label htmlFor="installLocation">Install Location</label>
        <br />
        <input id="installLocation" type="text" name="installLocation" disabled />
        <button id="changeLocation" className="basicButton">
          Change
        </button>
        <br />
        <label htmlFor="ram">
          Pack Ram <i>(GB)</i>
        </label>
        <br />
        <input id="packRam" type="number" name="ram" min="4" max="16" />
        <div className="buttons">
          <button id="installPack">Install</button>
          <button id="cancelPackInstall">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export function UninstallConfirmation(): JSX.Element {
  return (
    <div id="uninstallConfirmation" className="confirmation hidden">
      <div className="content center">
        <h1>Uninstall Pack</h1>
        <h3 className="margin: 0;">
          Are you sure you want to uninstall <b style={{ textDecoration: 'underline' }}></b>?
        </h3>
        <span>
          Uninstalling deletes everything <b style={{ textDecoration: 'underline', fontWeight: 400 }}>except</b> your worlds and settings unless the checkboxes
          below are checked.
        </span>
        <div className="margin: 1rem 0;display: flex; gap: 0.5rem; flex-direction: column;">
          <div style={{ alignItems: 'center', display: 'flex', gap: '0.5rem' }}>
            <input id="deleteWorlds" type="checkbox" name="deleteWorlds" />
            <label htmlFor="deleteWorlds">Delete worlds for this pack</label>
          </div>
          <div style={{ alignItems: 'center', display: 'flex', gap: '0.5rem' }}>
            <input id="deleteSettings" type="checkbox" name="deleteSettings" />
            <label htmlFor="deleteSettings">Delete settings for this pack</label>
          </div>
        </div>
        <div className="buttons">
          <button id="uninstallPack">Uninstall</button>
          <button id="cancelPackUninstall">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export function UpdateConfirmation(): JSX.Element {
  return (
    <div id="updateConfirmation" className="confirmation hidden">
      <div className="content center">
        <h1>Update Pack</h1>
        <h3 style={{ margin: 0 }}>
          Are you sure you want to update <b style={{ textDecoration: 'underline' }}></b>?
        </h3>
        <span>Updating may limit your ability to play on public servers, not updating may limit your ability to play on dipped.dev servers.</span>
        <div className="buttons">
          <button id="updatePack">Update</button>
          <button id="cancelPackUpdate">Cancel</button>
        </div>
      </div>
    </div>
  );
}
