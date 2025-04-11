import icon from './assets/favicon_x256.png';

import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

ReactDOM.createRoot(document.getElementById('main') as HTMLElement).render(
  <StrictMode>
    <img src={icon} />
    <div className="loader"></div>
    <div id="infoText">Starting App</div>
    <div id="infoTextLower"></div>
  </StrictMode>
);
