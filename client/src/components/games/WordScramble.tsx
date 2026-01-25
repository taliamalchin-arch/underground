import { useState, useEffect, useCallback } from 'react';

const WORDS = [
  { word: 'ALPINE', hint: 'Mountain type' },
  { word: 'POWDER', hint: 'Fresh snow' },
  { word: 'SUMMIT', hint: 'Top of mountain' },
  { word: 'WINTER', hint: 'Cold season' },
  { word: 'SLOPES', hint: 'Ski runs' },
];

interface WordScrambleProps {
  isPlaying: boolean;
  onGameOver?: (score: number) => void;
}

export const WordScramble = ({ isPlaying, onGameOver }: WordScrambleProps) => {
  const [currentWord, setCurrentWord] = useState(WORDS[0]);
  const [scrambled, setScrambled] = useState('');
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');
  const [solved, setSolved] = useState(false);

  const scrambleWord = useCallback((word: string): string => {
    const arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const result = arr.join('');
    return result === word ? scrambleWord(word) : result;
  }, []);

  const newWord = useCallback(() => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(word);
    setScrambled(scrambleWord(word.word));
    setGuess('');
    setMessage('');
    setSolved(false);
  }, [scrambleWord]);

  useEffect(() => {
    if (isPlaying) {
      setScore(0);
      newWord();
    }
  }, [isPlaying, newWord]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.toUpperCase() === currentWord.word) {
      setScore(s => s + 10);
      setMessage('Correct!');
      setSolved(true);
      setTimeout(newWord, 1500);
    } else {
      setMessage('Try again!');
    }
  };

  if (!isPlaying) return null;

  return (
    <div data-testid="word-scramble-container" className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-white to-pink-100 rounded-[16px]">
      <div className="text-center mb-4">
        <div className="font-['Sora'] font-bold text-xs text-gray-500 mb-2">
          UNSCRAMBLE THE WORD
        </div>
        <div data-testid="scrambled-word" className="font-['Satoshi-Bold'] text-3xl tracking-wider text-black mb-2">
          {scrambled}
        </div>
        <div data-testid="word-hint" className="font-['Sora'] text-xs text-gray-400">
          Hint: {currentWord.hint}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="w-full max-w-[200px]">
        <input
          data-testid="word-input"
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value.toUpperCase())}
          placeholder="Your answer..."
          className="w-full px-4 py-2 rounded-lg border-2 border-pink-200 focus:border-pink-400 outline-none text-center font-['Satoshi-Bold'] text-lg uppercase"
          disabled={solved}
          autoComplete="off"
        />
        <button
          data-testid="guess-button"
          type="submit"
          className="w-full mt-2 px-4 py-2 bg-pink-400 text-white rounded-lg font-['Sora'] font-bold text-sm transition-colors"
          disabled={solved}
        >
          GUESS
        </button>
      </form>
      
      {message && (
        <div className={`mt-3 font-['Sora'] font-bold text-sm ${solved ? 'text-green-500' : 'text-red-400'}`}>
          {message}
        </div>
      )}
      
      <div className="mt-4 font-['Sora'] font-bold text-sm text-gray-600">
        Score: {score}
      </div>
    </div>
  );
};
