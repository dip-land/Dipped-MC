import '../assets/themeButton.css';

export default function ThemeCard({ name }: { name: string }): JSX.Element {
  return (
    <button className={'themeButton ' + name.toLowerCase()}>
      <div>
        <div className="themeAccentColor"></div>
        <div className="themeFonts">
          <div className="themeFont1Color"></div>
          <div className="themeFont2Color"></div>
        </div>
      </div>
      {name}
    </button>
  );
}
