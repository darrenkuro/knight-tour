import type { BoardTheme } from "../types";
import { THEMES } from "../themes";
import "./ThemeSelector.css";

type ThemeSelectorProps = {
  current: BoardTheme;
  onSelect: (theme: BoardTheme) => void;
};

export const ThemeSelector = ({ current, onSelect }: ThemeSelectorProps) => (
  <div className="theme-selector">
    <span className="theme-selector__label">Theme</span>
    <div className="theme-selector__options">
      {THEMES.map((theme) => (
        <button
          key={theme.id}
          className={`theme-swatch${theme.id === current.id ? " theme-swatch--active" : ""}`}
          onClick={() => onSelect(theme)}
          title={theme.name}
        >
          <span className="theme-swatch__quadrant" style={{ background: theme.light }} />
          <span className="theme-swatch__quadrant" style={{ background: theme.dark }} />
          <span className="theme-swatch__quadrant" style={{ background: theme.dark }} />
          <span className="theme-swatch__quadrant" style={{ background: theme.light }} />
        </button>
      ))}
    </div>
  </div>
);
