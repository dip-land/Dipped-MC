import { useEffect, useRef, useState } from 'react';
import { Pack } from 'src/main/types';

export default function PackContext({ packs }: { packs: Array<Pack<boolean>> }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pack, setPack] = useState({} as Pack<boolean>);
  useEffect(() => {
    const packElements = document.getElementsByClassName('modpack');
    for (const element of packElements) {
      element?.addEventListener('contextmenu', handleContext);
    }
    const content = document.getElementById('content');
    document.addEventListener('click', handleClick);
    window.addEventListener('resize', hideAll);
    document.addEventListener('contextmenu', handleContext);
    content?.addEventListener('scroll', handleScroll);
    return () => {
      for (const element of packElements) {
        element?.removeEventListener('contextmenu', handleContext);
      }
      document.removeEventListener('click', handleClick);
      window.removeEventListener('resize', hideAll);
      document.removeEventListener('contextmenu', handleContext);
      content?.removeEventListener('scroll', handleScroll);
    };
  }, []);
  function getPack(target) {
    const firstLayer = packs.find((p) => p.id === target?.id);
    const secondLayer = packs.find((p) => p.id === target?.parentElement?.id);
    const thirdLayer = packs.find((p) => p.id === target?.parentElement?.parentElement?.id);
    const forthLayer = packs.find((p) => p.id === target?.parentElement?.parentElement?.parentElement?.id);
    const fifthLayer = packs.find((p) => p.id === target?.getAttribute('data-id'));
    return (firstLayer || secondLayer || thirdLayer || forthLayer || fifthLayer) as Pack<boolean>;
  }
  function moveContext(context, options: { button?: HTMLElement | null; event?: MouseEvent }) {
    const contextBoundingBox = context.getBoundingClientRect();
    const buttonBoundingBox = options.button
      ? options.button.getBoundingClientRect()
      : {
          bottom: (options.event?.y ?? 0) + contextBoundingBox.height - 4,
          x: options.event?.x ?? 0,
          width: -6
        };
    context.style.top = `${buttonBoundingBox.bottom - contextBoundingBox.height + 4}px`;
    context.style.left = `${buttonBoundingBox.x + buttonBoundingBox.width + 6}px`;
    if (document.body.clientWidth - contextBoundingBox.width < contextBoundingBox.x + contextBoundingBox.width) {
      context.style.left = `${buttonBoundingBox.x - contextBoundingBox.width - 3}px`;
    }
  }
  function hideAll() {
    const context = document.getElementById('packContext');
    const packs = document.getElementsByClassName('modpack');
    for (const element of packs) {
      element.classList.remove('active');
    }
    if (!context) return;
    context.classList.add('invisible');
  }
  function unhide(pack) {
    document.getElementById('packContext')?.classList.remove('invisible');
    document.getElementById(pack.id)?.classList.add('active');
  }
  function handleContext(e) {
    if (!ref.current) return;
    const ctx = ref.current;
    const target = e.target;
    const pack = getPack(target);
    if (pack) {
      setPack(pack);
      hideAll();
      unhide(pack);
      setTimeout(() => moveContext(ctx, { event: e }));
      ctx.setAttribute('data-previous-event', e.type);
      ctx.setAttribute('data-previous-opener', pack.id);
    } else {
      hideAll();
    }
  }
  function handleClick(e) {
    if (!ref.current) return;
    const ctx = ref.current;
    const target = e.target;
    const pack = getPack(target);
    const invisible = ctx.classList.contains('invisible');
    if (!ctx.contains(target)) {
      if (target.classList.contains('packCtxMenuButton') && pack) {
        setPack(pack);
        if (
          (!invisible && ctx.getAttribute('data-previous-event') === 'contextmenu') ||
          (!invisible && ctx.getAttribute('data-previous-opener') !== pack.id) ||
          invisible
        ) {
          unhide(pack);
        } else {
          hideAll();
        }
        setTimeout(() => moveContext(ctx, { button: target }));
        ctx.setAttribute('data-previous-event', e.type);
        ctx.setAttribute('data-previous-opener', pack.id);
      } else {
        if (!invisible) {
          hideAll();
        }
      }
    }
  }
  function handleScroll() {
    hideAll();
  }
  return (
    <div id="packContext" className="context invisible" onClick={handleClick} ref={ref} data-previous-event={''} data-previous-opener={''}>
      {pack.installed ? (
        <>
          <button onClick={() => window.dmc.playPack(pack.id)}>Play</button>
          <button onClick={() => window.dmc.preUninstall(pack.id)}>Uninstall</button>
        </>
      ) : (
        <button onClick={() => window.dmc.preInstall(pack.id)}>Install</button>
      )}
      {pack.installed && pack.localVersion !== pack.serverVersion ? <button onClick={() => window.dmc.preUpdate(pack.id)}>Update</button> : ''}
      {pack.installed ? (
        <>
          <hr />
          <button onClick={() => window.dmc.openFolder(pack.local?.path as string)}>Open Folder</button>
          <button onClick={() => window.dmc.openSettingsToPack(pack.id)}>Change Settings</button>
        </>
      ) : (
        ''
      )}
      <hr />
      <button onClick={() => window.dmc.openURL(`https://dipped.dev/minecraft/${pack.identifier}`)}>Visit Website</button>
      <button onClick={() => window.dmc.openURL(pack.link.url ?? '')}>{pack.link?.type === 'curseforge' ? 'Curseforge' : 'Modrinth'}</button>
    </div>
  );
}
