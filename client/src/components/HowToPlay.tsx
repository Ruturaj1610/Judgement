import React, { useState, useEffect } from 'react';
import { Card as CardType, Suit, Rank, SUIT_SYMBOLS, SUIT_NAMES } from '@judgement/shared';
import { Card } from './Card';
import './HowToPlay.css';

interface HowToPlayProps {
  onClose: () => void;
  startSection?: number;
}

const makeCard = (suit: Suit, rank: Rank): CardType => ({
  suit,
  rank,
  id: `tutorial-${suit}-${rank}`,
});

export const HowToPlay: React.FC<HowToPlayProps> = ({ onClose, startSection = 0 }) => {
  const [currentSection, setCurrentSection] = useState(startSection);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const sections = [
    // 1. What is Judgement?
    {
      title: 'What is Judgement?',
      subtitle: 'The premier strategic card game of prediction and precision',
      content: (
        <>
          <p>
            <strong>JUDGEMENT</strong> is an Indian trick-taking card game played with a standard 52-card deck.
            Unlike ordinary card games where you want to win as many tricks as possible, in Judgement your goal is to win{' '}
            <span style={{ color: 'var(--accent-gold)', fontWeight: 800 }}>EXACTLY the number of tricks you predict</span> before the round starts.
          </p>

          <div className="htp-callout emphasis">
            <span className="htp-callout-icon">🎯</span>
            <div>
              <strong>The Golden Rule:</strong> If you predict 3 tricks and win 3, you earn big points.
              If you win 4 tricks or 2 tricks, you get <strong>0 points</strong>! Precision is everything.
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <span className="htp-slot-label">What is a Trick?</span>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '4px 0 10px' }}>
              Each player plays 1 card clockwise. The group of cards played is called <strong>1 Trick</strong>.
            </p>
            <div className="htp-card-row">
              <div className="htp-card-slot">
                <span className="htp-slot-label">Player A</span>
                <Card card={makeCard('H', '7')} />
              </div>
              <div className="htp-card-slot">
                <span className="htp-slot-label">Player B</span>
                <Card card={makeCard('H', 'K')} />
              </div>
              <div className="htp-card-slot">
                <span className="htp-slot-label">Player C</span>
                <Card card={makeCard('H', '3')} />
              </div>
              <div className="htp-card-slot">
                <span className="htp-slot-label">Player D</span>
                <Card card={makeCard('H', 'A')} />
              </div>
            </div>
            <div className="htp-tag lead" style={{ marginTop: '8px', display: 'inline-block' }}>
              4 Cards Played = 1 Trick (Winner leads next trick!)
            </div>
          </div>
        </>
      ),
    },

    // 2. Game Setup
    {
      title: 'Game Setup',
      subtitle: 'Players, deck shuffling, and dealer rotation',
      content: (
        <>
          <div className="htp-callout">
            <span className="htp-callout-icon">👥</span>
            <div>
              <strong>2 to 6 Players:</strong> Judgement supports 2 to 6 players in real-time online multiplayer.
              A standard 52-card deck is used (no Jokers).
            </div>
          </div>

          <div className="htp-steps-list">
            <div className="htp-step-item">
              <div className="htp-step-num">DECK</div>
              <div className="htp-step-desc">
                The deck is <strong>freshly shuffled every round</strong>. Cards are dealt face-down to each player.
              </div>
            </div>

            <div className="htp-step-item">
              <div className="htp-step-num">DEALER</div>
              <div className="htp-step-desc">
                A dealer is chosen randomly in Round 1. In every subsequent round, the dealer rotates clockwise to the next player.
              </div>
            </div>

            <div className="htp-step-item">
              <div className="htp-step-num">ACTION</div>
              <div className="htp-step-desc">
                The player immediately to the <strong>left of the dealer</strong> (clockwise) makes the first Judgement and leads the first card of the round.
              </div>
            </div>
          </div>

          <div className="htp-callout emphasis" style={{ marginTop: '8px' }}>
            <span className="htp-callout-icon">🔄</span>
            <div>
              <strong>Clockwise Flow:</strong> Bidding and card playing always proceed clockwise around the table.
            </div>
          </div>
        </>
      ),
    },

    // 3. Rounds
    {
      title: 'Rounds',
      subtitle: '8 progressive rounds with decreasing cards and rotating Hukum',
      content: (
        <>
          <p>
            A full match consists of <strong>8 rounds</strong>. Each round, players receive fewer cards, and the Hukum (Trump) suit rotates in order:
          </p>

          <div className="htp-round-timeline">
            <div className="htp-round-box">
              <span className="htp-round-number">ROUND 1</span>
              <span className="htp-round-cards">8 Cards</span>
              <span className="htp-round-hukum black">♠</span>
              <span className="htp-slot-label">Spades</span>
            </div>
            <div className="htp-round-box">
              <span className="htp-round-number">ROUND 2</span>
              <span className="htp-round-cards">7 Cards</span>
              <span className="htp-round-hukum red">♥</span>
              <span className="htp-slot-label">Hearts</span>
            </div>
            <div className="htp-round-box">
              <span className="htp-round-number">ROUND 3</span>
              <span className="htp-round-cards">6 Cards</span>
              <span className="htp-round-hukum black" style={{ color: '#2a9d8f' }}>♣</span>
              <span className="htp-slot-label">Clubs</span>
            </div>
            <div className="htp-round-box">
              <span className="htp-round-number">ROUND 4</span>
              <span className="htp-round-cards">5 Cards</span>
              <span className="htp-round-hukum red" style={{ color: '#e76f51' }}>♦</span>
              <span className="htp-slot-label">Diamonds</span>
            </div>
            <div className="htp-round-box">
              <span className="htp-round-number">ROUND 5</span>
              <span className="htp-round-cards">4 Cards</span>
              <span className="htp-round-hukum black">♠</span>
              <span className="htp-slot-label">Spades</span>
            </div>
            <div className="htp-round-box">
              <span className="htp-round-number">ROUND 6</span>
              <span className="htp-round-cards">3 Cards</span>
              <span className="htp-round-hukum red">♥</span>
              <span className="htp-slot-label">Hearts</span>
            </div>
            <div className="htp-round-box">
              <span className="htp-round-number">ROUND 7</span>
              <span className="htp-round-cards">2 Cards</span>
              <span className="htp-round-hukum black" style={{ color: '#2a9d8f' }}>♣</span>
              <span className="htp-slot-label">Clubs</span>
            </div>
            <div className="htp-round-box">
              <span className="htp-round-number">ROUND 8</span>
              <span className="htp-round-cards">1 Card</span>
              <span className="htp-round-hukum red" style={{ color: '#e76f51' }}>♦</span>
              <span className="htp-slot-label">Diamonds</span>
            </div>
          </div>

          <div className="htp-callout" style={{ marginTop: '10px' }}>
            <span className="htp-callout-icon">✨</span>
            <div>
              <strong>Key Facts:</strong> Fresh shuffle every round • Hand size decreases 8 ➔ 1 • Hukum suit follows ♠ ➔ ♥ ➔ ♣ ➔ ♦ • Dealer rotates clockwise every round.
            </div>
          </div>
        </>
      ),
    },

    // 4. Judgement / Prediction
    {
      title: 'Judgement / Prediction',
      subtitle: 'Predicting how many tricks you can win and secret bidding',
      content: (
        <>
          <p>
            At the start of each round, look at your dealt cards and the round's Hukum suit.
            You must choose your <strong>Judgement</strong>: a number from <strong>0 up to your hand size</strong> (e.g., 0 to 8 in Round 1).
          </p>

          <div className="htp-callout emphasis">
            <span className="htp-callout-icon">🔒</span>
            <div>
              <strong>Judgement Privacy:</strong> Judgements are submitted secretly. Nobody sees anyone else's prediction until <em>all</em> players have locked in!
            </div>
          </div>

          <div className="htp-privacy-container">
            <div className="htp-privacy-phase">
              <div className="htp-phase-header">
                <span>Phase 1: Bidding (Secret)</span>
              </div>
              <div className="htp-player-priv-row">
                <span>Player A</span>
                <span className="htp-priv-pill">3 🔒</span>
              </div>
              <div className="htp-player-priv-row">
                <span>Player B</span>
                <span className="htp-priv-pill">1 🔒</span>
              </div>
              <div className="htp-player-priv-row">
                <span>Player C</span>
                <span className="htp-priv-pill">2 🔒</span>
              </div>
              <div className="htp-player-priv-row">
                <span>Player D</span>
                <span className="htp-priv-pill">4 🔒</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Hidden from other players while deciding
              </span>
            </div>

            <div className="htp-privacy-phase" style={{ borderColor: 'rgba(34, 197, 94, 0.4)' }}>
              <div className="htp-phase-header" style={{ color: '#86efac' }}>
                <span>Phase 2: Simultaneous Reveal</span>
              </div>
              <div className="htp-player-priv-row">
                <span>Player A</span>
                <span className="htp-tag lead">Judged: 3</span>
              </div>
              <div className="htp-player-priv-row">
                <span>Player B</span>
                <span className="htp-tag lead">Judged: 1</span>
              </div>
              <div className="htp-player-priv-row">
                <span>Player C</span>
                <span className="htp-tag lead">Judged: 2</span>
              </div>
              <div className="htp-player-priv-row">
                <span>Player D</span>
                <span className="htp-tag lead">Judged: 4</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#86efac', textAlign: 'center' }}>
                All judgements revealed simultaneously!
              </span>
            </div>
          </div>
        </>
      ),
    },

    // 5. Playing Cards / Follow Suit (MOST IMPORTANT RULE)
    {
      title: 'Playing Cards / Follow Suit',
      subtitle: 'The most fundamental rule of Judgement: You MUST follow suit if you can',
      content: (
        <>
          <div className="htp-callout alert" style={{ borderLeft: '4px solid #ef4444' }}>
            <span className="htp-callout-icon">⚠️</span>
            <div>
              <strong style={{ color: '#fca5a5' }}>THE MOST IMPORTANT RULE IN THE GAME:</strong>
              <br />
              If you hold any card matching the <strong>Lead Suit</strong>, you <strong>MUST</strong> play that suit!
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="htp-slot-label">LEAD CARD:</span>
              <div className="htp-card-slot">
                <Card card={makeCard('H', '8')} />
                <span className="htp-tag lead">Lead: Hearts ♥</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', margin: '6px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              YOUR HAND:
            </div>

            <div className="htp-card-row">
              <div className="htp-card-slot">
                <Card card={makeCard('H', 'K')} isPlayable={true} />
                <span className="htp-tag legal">✅ MUST PLAY (♥)</span>
              </div>
              <div className="htp-card-slot">
                <Card card={makeCard('S', '4')} isDisabled={true} />
                <span className="htp-tag illegal">❌ CANNOT PLAY</span>
              </div>
              <div className="htp-card-slot">
                <Card card={makeCard('C', '2')} isDisabled={true} />
                <span className="htp-tag illegal">❌ CANNOT PLAY</span>
              </div>
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Because your hand contains Hearts ♥, you cannot play Spades ♠ or Clubs ♣.
            </p>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(245, 197, 66, 0.25)', marginTop: '8px' }}>
            <div style={{ textAlign: 'center', marginBottom: '6px' }}>
              <strong style={{ color: 'var(--accent-gold)' }}>WHAT IF YOU HAVE NO HEARTS ♥?</strong>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '2px 0' }}>
                (Suppose Hukum is ♠ Spades)
              </p>
            </div>

            <div className="htp-card-row">
              <div className="htp-card-slot">
                <Card card={makeCard('S', '5')} isPlayable={true} />
                <span className="htp-tag trump">✅ 5♠ (Hukum Trump)</span>
              </div>
              <div className="htp-card-slot">
                <Card card={makeCard('C', '9')} isPlayable={true} />
                <span className="htp-tag legal">✅ 9♣ (Discard)</span>
              </div>
              <div className="htp-card-slot">
                <Card card={makeCard('D', '2')} isPlayable={true} />
                <span className="htp-tag legal">✅ 2♦ (Discard)</span>
              </div>
            </div>

            <div className="htp-callout emphasis" style={{ marginTop: '8px' }}>
              <span className="htp-callout-icon">💡</span>
              <div>
                <strong>HUKUM IS OPTIONAL IF YOU CANNOT FOLLOW THE LEAD SUIT!</strong>
                <br />
                You are <em>never</em> forced to play Hukum. You can choose to play Hukum to win the trick, or discard another card to deliberately avoid winning!
              </div>
            </div>
          </div>
        </>
      ),
    },

    // 6. Hukum / Trump
    {
      title: 'Hukum / Trump',
      subtitle: 'The trump suit that beats all other suits',
      content: (
        <>
          <p>
            <strong>Hukum</strong> is the Hindi/Urdu word for Command or Decree. In card games, it refers to the <strong>Trump Suit</strong>.
          </p>

          <div className="htp-callout emphasis">
            <span className="htp-callout-icon">👑</span>
            <div>
              <strong>Super Power of Hukum:</strong> Any card of the Hukum suit beats ANY non-Hukum card, regardless of how high its rank is!
              <br />
              For example: a <strong>2 of Hukum</strong> beats the <strong>Ace of the Lead Suit</strong>!
            </div>
          </div>

          <div style={{ textAlign: 'center', margin: '14px 0' }}>
            <span className="htp-slot-label">Comparison Example (Hukum is ♠ Spades):</span>
            <div className="htp-card-row" style={{ marginTop: '8px' }}>
              <div className="htp-card-slot">
                <Card card={makeCard('H', 'A')} />
                <span className="htp-slot-label">Ace of Hearts</span>
                <span className="htp-tag lead">Lead Suit (High)</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-gold)' }}>
                &lt;
              </div>
              <div className="htp-card-slot">
                <Card card={makeCard('S', '2')} />
                <span className="htp-slot-label">2 of Spades</span>
                <span className="htp-tag trump">Hukum (Trumps A♥!)</span>
              </div>
            </div>
          </div>

          <div className="htp-callout">
            <span className="htp-callout-icon">🔄</span>
            <div>
              <strong>Hukum Rotates Every Round:</strong> Spades ♠ ➔ Hearts ♥ ➔ Clubs ♣ ➔ Diamonds ♦.
              The active Hukum is always clearly displayed on the top game status bar.
            </div>
          </div>
        </>
      ),
    },

    // 7. How a Trick Is Won
    {
      title: 'How a Trick Is Won',
      subtitle: 'Evaluating cards and determining the winning player',
      content: (
        <>
          <p>
            Once every player has played 1 card, the trick winner is determined following these two simple rules:
          </p>

          <div className="htp-steps-list">
            <div className="htp-step-item">
              <div className="htp-step-num">RULE 1</div>
              <div className="htp-step-desc">
                <strong>Were any Hukum cards played?</strong>
                <br />
                • If <strong>YES</strong>: The <strong>highest Hukum card</strong> played wins the trick!
                <br />
                • If <strong>NO</strong>: The <strong>highest card of the LEAD SUIT</strong> wins the trick!
              </div>
            </div>

            <div className="htp-step-item">
              <div className="htp-step-num">RULE 2</div>
              <div className="htp-step-desc">
                Cards of any other off-suit (not lead suit, not Hukum) have <strong>zero value</strong> and cannot win the trick.
              </div>
            </div>

            <div className="htp-step-item">
              <div className="htp-step-num">RANKS</div>
              <div className="htp-step-desc">
                Card ranks from highest to lowest: <strong>A, K, Q, J, 10, 9, 8, 7, 6, 5, 4, 3, 2</strong>.
                Ace is always the highest.
              </div>
            </div>
          </div>

          <div style={{ marginTop: '12px' }}>
            <span className="htp-slot-label">Example: No Hukum Played (Lead is ♥ Hearts)</span>
            <div className="htp-card-row" style={{ marginTop: '6px' }}>
              <div className="htp-card-slot">
                <Card card={makeCard('H', '7')} />
                <span className="htp-slot-label">Player A</span>
              </div>
              <div className="htp-card-slot">
                <Card card={makeCard('H', 'K')} />
                <span className="htp-slot-label">Player B</span>
              </div>
              <div className="htp-card-slot">
                <Card card={makeCard('H', '3')} />
                <span className="htp-slot-label">Player C</span>
              </div>
              <div className="htp-card-slot">
                <Card card={makeCard('H', 'A')} />
                <span className="htp-slot-label">Player D</span>
                <span className="htp-tag winner">🏆 WINS (High Lead)</span>
              </div>
            </div>
          </div>
        </>
      ),
    },

    // 8. Hukumachi Utri
    {
      title: 'Hukumachi Utri',
      subtitle: 'Leading a trick directly with a Hukum card',
      content: (
        <>
          <div className="htp-callout emphasis" style={{ border: '2px solid var(--accent-gold)' }}>
            <span className="htp-callout-icon">⚡</span>
            <div>
              <strong style={{ fontSize: '1rem', color: 'var(--accent-gold)' }}>HUKUMACHI UTRI (हुकुमाची उतरी)</strong>
              <p style={{ margin: '4px 0 0', fontSize: '0.88rem' }}>
                When a player <strong>leads the trick with a Hukum card</strong>, the lead suit itself IS Hukum!
              </p>
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
              <div className="htp-card-slot">
                <span className="htp-slot-label">FIRST CARD (LEAD)</span>
                <Card card={makeCard('S', '7')} />
                <span className="htp-tag trump">7♠ (Hukum Lead)</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', color: 'var(--accent-gold)', fontWeight: 800, fontSize: '0.95rem' }}>
              Lead Suit = ♠ Spades &nbsp;•&nbsp; Hukum = ♠ Spades
            </div>

            <div className="htp-card-row" style={{ marginTop: '10px' }}>
              <div className="htp-card-slot">
                <span className="htp-slot-label">Player A</span>
                <Card card={makeCard('S', '7')} />
                <span className="htp-tag lead">Leads 7♠</span>
              </div>
              <div className="htp-card-slot">
                <span className="htp-slot-label">Player B</span>
                <Card card={makeCard('S', 'K')} />
                <span className="htp-tag winner">🏆 WINS (K♠)</span>
              </div>
              <div className="htp-card-slot">
                <span className="htp-slot-label">Player C</span>
                <Card card={makeCard('S', '10')} />
                <span className="htp-tag legal">Plays 10♠</span>
              </div>
              <div className="htp-card-slot">
                <span className="htp-slot-label">Player D</span>
                <Card card={makeCard('H', 'A')} />
                <span className="htp-tag illegal">No ♠: Discards A♥</span>
              </div>
            </div>
          </div>

          <div className="htp-callout" style={{ marginTop: '8px' }}>
            <span className="htp-callout-icon">📌</span>
            <div>
              <strong>Rules during Hukumachi Utri:</strong>
              <br />
              1. Everyone who holds Hukum <strong>must follow suit</strong> by playing Hukum.
              <br />
              2. The <strong>highest Hukum played</strong> wins the trick.
              <br />
              3. If a player has no Hukum, they can discard any card (which cannot win).
            </div>
          </div>
        </>
      ),
    },

    // 9. Scoring
    {
      title: 'Scoring',
      subtitle: 'Exact match rewards vs 0 points for missing your target',
      content: (
        <>
          <p>
            Judgement has simple, high-stakes scoring: you are only rewarded if you hit your exact prediction!
          </p>

          <div className="htp-scoring-grid">
            <div className="htp-score-box exact">
              <span className="htp-tag legal">EXACT MATCH</span>
              <div style={{ fontSize: '0.85rem' }}>
                Prediction: <strong>3</strong>
                <br />
                Tricks Won: <strong>3</strong>
              </div>
              <div className="htp-score-points">10 + 3 = 13 PTS</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Formula: 10 + Judged</span>
            </div>

            <div className="htp-score-box miss">
              <span className="htp-tag illegal">MISSED TARGET</span>
              <div style={{ fontSize: '0.85rem' }}>
                Prediction: <strong>3</strong>
                <br />
                Tricks Won: <strong>2</strong> (or 4)
              </div>
              <div className="htp-score-points">0 POINTS</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Too few or too many</span>
            </div>

            <div className="htp-score-box exact">
              <span className="htp-tag legal">ZERO PREDICTION</span>
              <div style={{ fontSize: '0.85rem' }}>
                Prediction: <strong>0</strong>
                <br />
                Tricks Won: <strong>0</strong>
              </div>
              <div className="htp-score-points">10 + 0 = 10 PTS</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Even 0 earns 10 points!</span>
            </div>
          </div>

          <div className="htp-callout emphasis" style={{ marginTop: '12px' }}>
            <span className="htp-callout-icon">🏆</span>
            <div>
              <strong>Match Winner:</strong> Scores accumulate across all 8 rounds. The player with the <strong>highest cumulative score</strong> after Round 8 wins the match!
            </div>
          </div>
        </>
      ),
    },

    // 10. Understanding the Game Screen
    {
      title: 'Understanding the Game Screen',
      subtitle: 'Recognize the actual game interface elements at a glance',
      content: (
        <div className="htp-ui-mockup-wrapper">
          {/* Miniature representation of the actual game screen */}
          <div className="htp-mini-ui">
            {/* Top Bar Mockup */}
            <div className="htp-mock-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--accent-gold)', fontWeight: 800 }}>CODE: AB82K</span>
                <span style={{ background: 'rgba(245, 197, 66, 0.2)', border: '1px solid var(--accent-gold)', borderRadius: '6px', padding: '2px 6px', color: 'var(--accent-gold)' }}>
                  ♠ HUKUM: SPADES
                </span>
                <span className="htp-badge">②</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700 }}>Round 1 / 8</span>
                <span className="htp-badge">①</span>
                <span>🔊</span>
              </div>
            </div>

            {/* Opponents Area Mockup */}
            <div className="htp-mock-opponents">
              <div className="htp-mock-opp-pod">
                <span>👤 Rahul</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-gold)' }}>J: 2 | T: 1</span>
                <span>⭐ 13 pts</span>
                <span className="htp-badge">③</span>
              </div>
              <div className="htp-mock-opp-pod">
                <span>👤 Priya</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-gold)' }}>J: 1 | T: 0</span>
                <span>⭐ 10 pts</span>
              </div>
            </div>

            {/* Center Play Area Mockup */}
            <div className="htp-mock-playarea">
              <span className="htp-badge" style={{ position: 'absolute', top: '6px', right: '6px' }}>④</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Trick #1 • Lead: ♥ Hearts</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ transform: 'scale(0.65)', margin: '-16px -12px' }}>
                  <Card card={makeCard('H', '9')} />
                </div>
                <div style={{ transform: 'scale(0.65)', margin: '-16px -12px' }}>
                  <Card card={makeCard('H', 'K')} />
                </div>
              </div>
            </div>

            {/* Player Hand Mockup */}
            <div className="htp-mock-hand">
              <div className="htp-mock-turn-banner">
                <span>✨ YOUR TURN TO PLAY</span>
                <span className="htp-badge" style={{ marginLeft: '6px' }}>⑥</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ transform: 'scale(0.7)', margin: '-14px -8px' }}>
                  <Card card={makeCard('H', 'A')} isPlayable={true} />
                </div>
                <div style={{ transform: 'scale(0.7)', margin: '-14px -8px' }}>
                  <Card card={makeCard('S', '4')} isDisabled={true} />
                </div>
                <div style={{ transform: 'scale(0.7)', margin: '-14px -8px' }}>
                  <Card card={makeCard('C', '2')} isDisabled={true} />
                </div>
                <span className="htp-badge" style={{ alignSelf: 'center', marginLeft: '6px' }}>⑤</span>
              </div>
              <div className="htp-mock-stats-bar">
                <span>Judged: <strong>2</strong></span>
                <span>Tricks Won: <strong>1</strong></span>
                <span>Total Score: <strong>23</strong></span>
                <span className="htp-badge">⑦</span>
              </div>
            </div>
          </div>

          {/* Numbered Legend */}
          <div className="htp-legend-grid">
            <div className="htp-legend-item">
              <span className="htp-badge">①</span>
              <div>
                <strong>Round Counter:</strong> Current round out of 8 (cards decrease each round).
              </div>
            </div>
            <div className="htp-legend-item">
              <span className="htp-badge">②</span>
              <div>
                <strong>Hukum Badge:</strong> Current round's Trump suit. Rotates ♠ ➔ ♥ ➔ ♣ ➔ ♦.
              </div>
            </div>
            <div className="htp-legend-item">
              <span className="htp-badge">③</span>
              <div>
                <strong>Opponent Pods:</strong> Shows cards remaining, Judged (J), Won (T), and Score.
              </div>
            </div>
            <div className="htp-legend-item">
              <span className="htp-badge">④</span>
              <div>
                <strong>Current Trick:</strong> Center table showing cards played in the active trick & lead suit.
              </div>
            </div>
            <div className="htp-legend-item">
              <span className="htp-badge">⑤</span>
              <div>
                <strong>Your Hand:</strong> Your cards. Glowing border indicates cards you are legally allowed to play.
              </div>
            </div>
            <div className="htp-legend-item">
              <span className="htp-badge">⑥</span>
              <div>
                <strong>Turn Indicator:</strong> Displays when it is your turn to act.
              </div>
            </div>
            <div className="htp-legend-item" style={{ gridColumn: '1 / -1' }}>
              <span className="htp-badge">⑦</span>
              <div>
                <strong>Your Score Bar:</strong> Real-time tracker of what you predicted, how many tricks you've won so far this round, and your cumulative match points.
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // 11. Complete Worked Example
    {
      title: 'Complete Worked Example',
      subtitle: 'A full step-by-step trick with Hukum trumping the lead suit',
      content: (
        <>
          <div className="htp-callout emphasis">
            <span className="htp-callout-icon">♠</span>
            <div>
              <strong>Scenario:</strong> Round 1 (8 cards). Hukum is <strong>♠ Spades</strong>.
            </div>
          </div>

          <div className="htp-steps-list">
            <div className="htp-step-item">
              <div className="htp-step-card-col">
                <Card card={makeCard('H', '9')} style={{ width: '56px', height: '80px' }} />
              </div>
              <div className="htp-step-desc">
                <strong>Player A leads: 9 of Hearts (9♥)</strong>
                <br />
                The Lead Suit for this trick is established as <strong>Hearts ♥</strong>.
              </div>
            </div>

            <div className="htp-step-item">
              <div className="htp-step-card-col">
                <Card card={makeCard('H', 'K')} style={{ width: '56px', height: '80px' }} />
              </div>
              <div className="htp-step-desc">
                <strong>Player B plays: King of Hearts (K♥)</strong>
                <br />
                Player B holds Hearts, so they <em>must follow suit</em>. K♥ is currently highest.
              </div>
            </div>

            <div className="htp-step-item">
              <div className="htp-step-card-col">
                <Card card={makeCard('S', '3')} style={{ width: '56px', height: '80px' }} />
              </div>
              <div className="htp-step-desc">
                <strong>Player C plays: 3 of Spades (3♠)</strong>
                <br />
                Player C has <strong>no Hearts</strong>! They choose to play Hukum (3♠) to trump!
              </div>
            </div>

            <div className="htp-step-item">
              <div className="htp-step-card-col">
                <Card card={makeCard('H', 'A')} style={{ width: '56px', height: '80px' }} />
              </div>
              <div className="htp-step-desc">
                <strong>Player D plays: Ace of Hearts (A♥)</strong>
                <br />
                Player D follows suit with the highest Heart.
              </div>
            </div>
          </div>

          <div className="htp-callout emphasis" style={{ marginTop: '10px' }}>
            <span className="htp-callout-icon">🏆</span>
            <div>
              <strong>Trick Outcome: Player C WINS with 3♠!</strong>
              <br />
              Even though Player D played the powerful Ace of Hearts, Player C's <strong>3♠ was Hukum</strong>.
              Hukum trumps all non-Hukum cards! Player C collects the trick and leads the next card.
            </div>
          </div>
        </>
      ),
    },

    // 12. Common Mistakes
    {
      title: 'Common Mistakes',
      subtitle: 'Avoid these classic errors new players make',
      content: (
        <div className="htp-mistakes-grid">
          <div className="htp-mistake-card">
            <div className="htp-mistake-wrong">
              <span>❌</span> "I can play any card from my hand at any time."
            </div>
            <div className="htp-mistake-right">
              ✅ <strong>Truth:</strong> If you hold any card of the lead suit, you <strong>MUST</strong> play it. You cannot discard or trump if you hold the lead suit.
            </div>
          </div>

          <div className="htp-mistake-card">
            <div className="htp-mistake-wrong">
              <span>❌</span> "If I have no lead suit, I am forced to play Hukum."
            </div>
            <div className="htp-mistake-right">
              ✅ <strong>Truth:</strong> Hukum is <strong>OPTIONAL</strong>. You can play Hukum to win, or discard another off-suit to safely lose the trick.
            </div>
          </div>

          <div className="htp-mistake-card">
            <div className="htp-mistake-wrong">
              <span>❌</span> "The highest rank card always wins."
            </div>
            <div className="htp-mistake-right">
              ✅ <strong>Truth:</strong> A 2 of Hukum beats an Ace of the lead suit. Non-lead, non-Hukum cards can never win.
            </div>
          </div>

          <div className="htp-mistake-card">
            <div className="htp-mistake-wrong">
              <span>❌</span> "I can see what others judge before making my pick."
            </div>
            <div className="htp-mistake-right">
              ✅ <strong>Truth:</strong> Judgements are secret! All predictions are revealed together once everyone has locked in.
            </div>
          </div>

          <div className="htp-mistake-card">
            <div className="htp-mistake-wrong">
              <span>❌</span> "I should try to win as many tricks as possible."
            </div>
            <div className="htp-mistake-right">
              ✅ <strong>Truth:</strong> Winning MORE tricks than your prediction gives you <strong>0 points</strong>! Hit your exact target.
            </div>
          </div>
        </div>
      ),
    },

    // 13. Quick Cheat Sheet
    {
      title: 'Quick Cheat Sheet',
      subtitle: 'Judgement in 30 seconds — your quick-reference pocket guide',
      content: (
        <div className="htp-cheat-sheet">
          <div className="htp-cheat-item">
            <span className="htp-cheat-num">1</span>
            <div><strong>8 Rounds:</strong> Hand sizes decrease from 8 down to 1 card. Fresh shuffle each round.</div>
          </div>
          <div className="htp-cheat-item">
            <span className="htp-cheat-num">2</span>
            <div><strong>Hukum Rotates:</strong> ♠ Spades ➔ ♥ Hearts ➔ ♣ Clubs ➔ ♦ Diamonds.</div>
          </div>
          <div className="htp-cheat-item">
            <span className="htp-cheat-num">3</span>
            <div><strong>Secret Judgement:</strong> Predict 0 to hand size. Revealed simultaneously after all lock in.</div>
          </div>
          <div className="htp-cheat-item">
            <span className="htp-cheat-num">4</span>
            <div><strong>Follow Suit:</strong> If you have the lead suit, you MUST play it. No exceptions.</div>
          </div>
          <div className="htp-cheat-item">
            <span className="htp-cheat-num">5</span>
            <div><strong>Optional Hukum:</strong> If void in the lead suit, you may trump with Hukum OR discard.</div>
          </div>
          <div className="htp-cheat-item">
            <span className="htp-cheat-num">6</span>
            <div><strong>Winner:</strong> Highest Hukum wins; if no Hukum played, highest lead-suit card wins. (Ace high).</div>
          </div>
          <div className="htp-cheat-item">
            <span className="htp-cheat-num">7</span>
            <div><strong>Hukumachi Utri:</strong> Leading with Hukum means everyone must follow Hukum if they have it.</div>
          </div>
          <div className="htp-cheat-item">
            <span className="htp-cheat-num">8</span>
            <div><strong>Exact Scoring:</strong> Hit prediction = <strong>10 + Judged</strong> points. Miss = <strong>0 points</strong>.</div>
          </div>
          <div className="htp-cheat-item">
            <span className="htp-cheat-num">9</span>
            <div><strong>Victory:</strong> The player with the highest total score after 8 rounds wins the match!</div>
          </div>
        </div>
      ),
    },
  ];

  const totalSections = sections.length; // 13
  const section = sections[currentSection];

  const handlePrev = () => {
    if (currentSection > 0) {
      setCurrentSection((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentSection < totalSections - 1) {
      setCurrentSection((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const progressPercent = ((currentSection + 1) / totalSections) * 100;

  return (
    <div className="htp-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="How to Play Judgement">
      <div className="htp-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="htp-header">
          <div className="htp-header-title">
            <span style={{ fontSize: '1.4rem' }}>🎴</span>
            <span className="htp-title-text">HOW TO PLAY</span>
            <span className="htp-progress-pill">
              {currentSection + 1} / {totalSections}
            </span>
          </div>

          <div className="htp-header-actions">
            {currentSection < totalSections - 1 && (
              <button className="htp-skip-btn" onClick={onClose} title="Skip Tutorial">
                Skip
              </button>
            )}
            <button className="htp-close-btn" onClick={onClose} title="Close (Esc)" aria-label="Close tutorial">
              ✕
            </button>
          </div>
        </div>

        {/* Progress Fill Bar */}
        <div className="htp-progress-track">
          <div className="htp-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        {/* Section Body */}
        <div className="htp-body">
          <div className="htp-section-header">
            <h2 className="htp-section-title">{section.title}</h2>
            <p className="htp-section-subtitle">{section.subtitle}</p>
          </div>

          {section.content}
        </div>

        {/* Footer Navigation */}
        <div className="htp-footer">
          <button
            className="htp-nav-btn prev"
            onClick={handlePrev}
            disabled={currentSection === 0}
          >
            ◀ Previous
          </button>

          <button className="htp-nav-btn next" onClick={handleNext}>
            {currentSection === totalSections - 1 ? 'GOT IT — PLAY JUDGEMENT 🎴' : 'Next ▶'}
          </button>
        </div>
      </div>
    </div>
  );
};
