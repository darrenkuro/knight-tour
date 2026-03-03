import type { BoardSize } from "../types";
import "./SizeSelector.css";

const SIZES: BoardSize[] = [5, 6, 7, 8, 9, 10, 11, 12];

type SizeSelectorProps = {
  current: BoardSize;
  onSelect: (size: BoardSize) => void;
};

export const SizeSelector = ({ current, onSelect }: SizeSelectorProps) => (
  <div className="size-selector">
    <span className="size-selector__label">Board Size</span>
    <div className="size-selector__options">
      {SIZES.map((size) => (
        <button
          key={size}
          className={`size-selector__btn${size === current ? " size-selector__btn--active" : ""}`}
          onClick={() => onSelect(size)}
        >
          {size}
        </button>
      ))}
    </div>
  </div>
);
