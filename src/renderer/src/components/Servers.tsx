import { useEffect, useState } from 'react';
import Server from './Server';
import { Server as ServerType } from 'src/main/types';

let servers_: Array<ServerType> = [];
let config = await window.dmc.getConfig();
// async function editConfig(type: 'sort' | 'filter', value) {
//   if (type === 'sort') config.sortAndFilters.serversSort = value;
//   if (type === 'filter') config.sortAndFilters.serversFilter = value;
//   await window.dmc.editConfig(config);
//   config = await window.dmc.getConfig();
// }

export default function Servers() {
  const [servers, setServers] = useState([<h1>Loading...</h1>]);
  useEffect(() => {
    window.dmc.getServers().then((servers) => {
      servers_ = servers;
      setServers(loadServers());
    });
    setInterval(
      async () => {
        if (!document.getElementById('serverSection')?.classList.contains('hidden')) {
          servers_ = await window.dmc.getServers();
          setServers(loadServers());
        }
      },
      1000 * 60 * 15
    );
  }, []);
  function loadServers() {
    const sortBy = 'status';
    return servers_
      .sort((a, b) => {
        const valueA = a[sortBy].toUpperCase();
        const valueB = b[sortBy].toUpperCase();
        if (valueA < valueB) return 1;
        if (valueA > valueB) return -1;
        return 0;
      })
      .map((server) => <Server server={server} local={config.packs.find((p) => p.id === server.id)}></Server>);
  }
  //   async function handleChange(e) {
  //     const selectMenu = e.target;
  //     if (selectMenu.name === 'serversSort') {
  //       await editConfig('sort', selectMenu.value);
  //       setServers(loadServers());
  //     } else if (selectMenu.name === 'serversFilter') {
  //       await editConfig('filter', selectMenu.value);
  //       setServers(loadServers());
  //     }
  //   }
  return (
    <div id="serverSection" className="hidden">
      <div id="servers">{...servers}</div>
      <div className="packsUpdatedAt">
        <span>Last Updated At: {new Date().toLocaleString()}</span>
        <button onClick={() => setServers(loadServers())} className="basicButton">
          Refresh Servers
        </button>
      </div>
    </div>
  );
}
