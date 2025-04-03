import { useState } from 'react';
import Modpack from './Modpack';
import PackContext from './PackContext';

const packs_ = await window.dmc.getPacks();
const status = await window.dmc.getStatus();
let config = await window.dmc.getConfig();
async function editConfig(type: 'sort' | 'filter', value) {
  if (type === 'sort') config.sortAndFilters.modpackSort = value;
  if (type === 'filter') config.sortAndFilters.modpackFilter = value;
  await window.dmc.editConfig(config);
  config = await window.dmc.getConfig();
}

export default function Modpacks() {
  const [packs, setPacks] = useState(loadPacks());
  function loadPacks(options?: { sort?; filter? }) {
    return packs_
      .sort((a, b) => sort({ a, b }, options?.sort))
      .filter((p) => filter(p, options?.filter))
      .map((pack) => <Modpack pack={pack} offline={status === -1 || status === 0}></Modpack>);
  }
  async function handleChange(e) {
    const selectMenu = e.target;
    if (selectMenu.name === 'modpacksSort') {
      await editConfig('sort', selectMenu.value);
      setPacks(loadPacks({ sort: selectMenu.value }));
    } else if (selectMenu.name === 'modpacksFilter') {
      await editConfig('filter', selectMenu.value);
      setPacks(loadPacks({ filter: selectMenu.value }));
    }
  }
  function sort({ a, b }, value?: (typeof config)['sortAndFilters']['modpackSort']) {
    if (!value) value = config.sortAndFilters.modpackSort ?? 'new';
    if (value === 'installed' || value === 'uninstalled') {
      if (value === 'installed') return a.installed ? -1 : 1;
      if (value === 'uninstalled') return a.installed ? 1 : -1;
      return 0;
    }
    if (value === 'new' || value === 'old') {
      const aTime = new Date(a.serverDates.start).getTime();
      const bTime = new Date(b.serverDates.start).getTime();
      if (aTime < bTime) return value === 'new' ? 1 : -1;
      if (aTime > bTime) return value === 'old' ? 1 : -1;
      return 0;
    }
    const valueA = a['name']?.toUpperCase();
    const valueB = b['name']?.toUpperCase();
    if (valueA < valueB) return value === 'asc' ? -1 : 1;
    if (valueA > valueB) return value === 'asc' ? 1 : -1;
    return 0;
  }
  function filter(pack, value?: (typeof config)['sortAndFilters']['modpackFilter']) {
    if (!value) value = config.sortAndFilters.modpackFilter ?? 'all';
    if (value === 'all') return true;
    if (value === 'installed') return pack.installed;
    if (value === 'uninstalled') return !pack.installed;
  }
  return (
    <div id="modpackSection">
      <div id="modpackFilters" className="filter">
        <label htmlFor="modpacksSort">Sort: </label>
        <select name="modpacksSort" onChange={handleChange} defaultValue={config.sortAndFilters.modpackSort ?? 'new'}>
          <option value="installed">Installed</option>
          <option value="uninstalled">Not Installed</option>
          <option value="new">Newest</option>
          <option value="old">Oldest</option>
          <option value="asc">A-Z</option>
          <option value="desc">Z-A</option>
        </select>
        <label htmlFor="modpacksFilter">filter: </label>
        <select name="modpacksFilter" onChange={handleChange} defaultValue={config.sortAndFilters.modpackFilter ?? 'all'}>
          <option value="all">All</option>
          <option value="installed">Installed</option>
          <option value="uninstalled">Not Installed</option>
        </select>
      </div>
      <div id="modpacks">{...packs}</div>
      <PackContext packs={packs_}></PackContext>
    </div>
  );
}
