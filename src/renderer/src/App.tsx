import Footer from './components/Footer';
import TitleBar from './components/TitleBar';
import Modpacks from './components/Modpacks';

function App(): JSX.Element {
  return (
    <>
      <TitleBar></TitleBar>
      <div id="content">
        <div id="contentMargin">
          <Modpacks></Modpacks>
          <Footer></Footer>
        </div>
      </div>
    </>
  );
}

export default App;
