const versions = await window.dmc.getVersions();
const config = await window.dmc.getConfig();

export default function Footer(): JSX.Element {
  const openLogs = () => {
    window.dmc.openFolder(`${config.configPath.replaceAll('\\', '/')}/logs`);
  };
  return (
    <footer>
      <hr />
      <div>
        App Version: <b>{versions.app}</b>
      </div>
      <div>
        Chrome Version: <b>{versions.chrome}</b>
      </div>
      <div>
        Electron Version: <b>{versions.electron}</b>
      </div>
      <div>
        Node Version: <b>{versions.node}</b>
      </div>
      <div>
        V8 Version: <b>{versions.v8}</b>
      </div>
      <button onClick={openLogs}>View Logs Folder</button>
    </footer>
  );
}
