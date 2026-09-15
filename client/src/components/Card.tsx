import React from 'react';
import { Card as CardType, SUIT_SYMBOLS } from '@judgement/shared';
import './Card.css';

interface CardProps {
  card?: CardType;
  faceDown?: boolean;
  isPlayable?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  card,
  faceDown = false,
  isPlayable = false,
  isDisabled = false,
  onClick,
  className = '',
  style = {},
}) => {
  if (faceDown || !card) {
    return (
      <div
        className={`playing-card card-back ${className}`}
        style={style}
        onClick={onClick}
      >
        <div className="card-back-pattern">
          <span className="card-back-symbol">🎴</span>
        </div>
      </div>
    );
  }

  const isRed = card.suit === 'H' || card.suit === 'D';
  const suitClass = isRed ? 'suit-red' : 'suit-black';
  const symbol = SUIT_SYMBOLS[card.suit];

  const handleClick = () => {
    if (isPlayable && !isDisabled && onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`playing-card ${suitClass} ${isPlayable ? 'is-playable' : ''} ${
        isDisabled ? 'is-disabled' : ''
      } ${className}`}
      style={style}
      onClick={handleClick}
      role="button"
      tabIndex={isPlayable && !isDisabled ? 0 : -1}
      aria-label={`${card.rank} of ${card.suit}`}
    >
      <div className="card-corner top-left">
        <span className="card-rank">{card.rank}</span>
        <span className="card-suit-small">{symbol}</span>
      </div>

      <div className="card-center">
        <span className="card-suit-large">{symbol}</span>
      </div>

      <div className="card-corner bottom-right">
        <span className="card-rank">{card.rank}</span>
        <span className="card-suit-small">{symbol}</span>
      </div>
    </div>
  );
};
