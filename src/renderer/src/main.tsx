import './assets/index.css';

import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const config = await window.dmc.getConfig();
import(`./assets/${config.theme ?? 'default'}.css`);

ReactDOM.createRoot(document.body as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
