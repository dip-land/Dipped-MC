import Footer from './components/Footer';
import TitleBar from './components/TitleBar';
import Modpacks from './components/Modpacks';
import Servers from './components/Servers';
import { InstallConfirmation, UninstallConfirmation, UpdateConfirmation } from './components/Confirmations';
import Settings from './components/Settings';

function App(): JSX.Element {
  return (
    <>
      <TitleBar></TitleBar>
      <div id="data" style={{ display: 'none' }} data-reload-packs="false"></div>
      <div id="content">
        <div id="contentMargin">
          <Modpacks></Modpacks>
          <Servers></Servers>
          <Settings></Settings>
          <InstallConfirmation></InstallConfirmation>
          <UninstallConfirmation></UninstallConfirmation>
          <UpdateConfirmation></UpdateConfirmation>
          <div id="notifications"></div>
          <Footer></Footer>
        </div>
      </div>
    </>
  );
}

export default App;
