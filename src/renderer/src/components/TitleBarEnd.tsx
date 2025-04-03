import { useEffect, useRef } from 'react';

const user = await window.dmc.getUser();
const status = await window.dmc.getStatus();
const offline = status === -1 || status === 0;
const loggedIn = user.status === 'valid';
export default function TitleBar() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        document.getElementById('resizer')?.setAttribute('style', `max-width: ${entry.contentRect.width + 20}px;`);
      }
    });
    resizeObserver.observe(ref.current);
  }, [ref]);
  return (
    <div id="end" ref={ref}>
      <div id="loginMode" className={'login' + (offline ? '' : ' hidden')}>
        Offline Mode
      </div>
      <button id="loginButton" className={'login' + (loggedIn ? ' hidden' : '')} onClick={window.dmc.login}>
        Login
      </button>
      <div id="user" className={'user' + (loggedIn ? '' : ' hidden')}>
        <img id="userAvatar" src={`https://mc-heads.net/avatar/${user.uuid}/100`}></img>
        <span id="username">{user.name}</span>
      </div>
      <div className="popout hidden" id="nav_popout">
        <div id="logout" onClick={window.dmc.logout}>
          Logout
        </div>
      </div>
      <button id="updateAppButton" title="Update Available" onClick={window.dmc.appUpdate} className="hidden">
        <svg width="16" height="16" viewBox="0 0 9.0000019 10.750252">
          <defs id="defs2" />
          <g transform="matrix(0.01666667,0,0,-0.01666667,-3.5000006,13.375128)" fill="currentColor" id="g2">
            <g id="g3" transform="translate(0,202.5)">
              <path
                d="m 450,161.0075 c -52.62225,55.03345 -105.82835,109.49906 -159,164 -14.97037,-15.37329 -30.49689,-30.17094 -46,-45 l 235,-235 235,235 c -15.7018,14.62524 -30.83026,29.83026 -46,45 -53.37732,-54.30143 -106.172,-109.16588 -159,-164 v 439 h -60 z"
                id="path1"
              />
              <path d="m 210,-45.0075 h 540 v 60 H 210 Z" id="path2" />
            </g>
          </g>
        </svg>
      </button>
    </div>
  );
}
