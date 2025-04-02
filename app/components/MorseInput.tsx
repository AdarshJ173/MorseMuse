import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

// Reverse map for translation (only needed if displaying translated text live)
const morseCodeMap: { [key: string]: string } = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
  '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.', ' ': '/'
};
// No need for reverse map if parent handles validation/translation
// const reverseMorseCodeMap: { [key: string]: string } = Object.entries(
//   morseCodeMap
// ).reduce((acc, [key, value]) => {
//   acc[value] = key;
//   return acc;
// }, {} as { [key: string]: string });


// Timing constants
const ditDuration = 150; // milliseconds for a dot (adjust sensitivity here)
const dahDuration = ditDuration * 3;
const symbolSpaceThreshold = ditDuration * 1.5; // Time to distinguish dit/dah
const interCharSpace = ditDuration * 3; // Standard space between letters/symbols in sequence
// Word space is not strictly needed here as we validate after each character in letter learning stage
// const wordSpace = ditDuration * 7;

type ValidationState = 'idle' | 'correct' | 'incorrect';

interface MorseInputProps {
  onInputComplete: (morseCode: string) => void;
  validationState: ValidationState;
}

// Define the type for the ref methods
export interface MorseInputHandle {
  clearInput: () => void;
}

// Use forwardRef to allow parent components to call methods on this component
const MorseInput = forwardRef<MorseInputHandle, MorseInputProps>(({ onInputComplete, validationState }, ref) => {
  const [rawInput, setRawInput] = useState(''); // Shows the raw dots and dashes for the current attempt
  const [isPressing, setIsPressing] = useState(false);
  const pressStartTime = useRef<number | null>(null);
  const lastReleaseTime = useRef<number>(Date.now());
  const charTimer = useRef<NodeJS.Timeout | null>(null);
  // const wordTimer = useRef<NodeJS.Timeout | null>(null); // Not needed for letter stage
  const currentMorseChar = useRef('');

  const clearTimers = () => {
    if (charTimer.current) clearTimeout(charTimer.current);
    // if (wordTimer.current) clearTimeout(wordTimer.current); // Not needed
    charTimer.current = null;
    // wordTimer.current = null; // Not needed
  };

  // Expose clearInput method via ref
  useImperativeHandle(ref, () => ({
    clearInput() {
      clearTimers();
      setRawInput('');
      currentMorseChar.current = '';
      pressStartTime.current = null;
      lastReleaseTime.current = Date.now();
      setIsPressing(false); // Ensure pressing state is reset
    }
  }));

  const completeInputSequence = () => {
    if (currentMorseChar.current) {
      onInputComplete(currentMorseChar.current);
      // Don't clear here, parent will call clearInput via ref after handling
    }
  };

  const handlePressStart = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    clearTimers(); // Clear any pending timers
    setIsPressing(true);
    pressStartTime.current = Date.now();

    // Optional: Check time since last release to potentially auto-complete previous char
    // For letter learning, we might want explicit completion via timer only.
    // const timeSinceLastRelease = Date.now() - lastReleaseTime.current;
    // if (timeSinceLastRelease >= interCharSpace) {
    //    completeInputSequence(); // Complete previous if long pause before new press
    // }
  };

  const handlePressEnd = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    if (!pressStartTime.current) return;

    const pressDuration = Date.now() - pressStartTime.current;
    const symbol = pressDuration < symbolSpaceThreshold ? '.' : '-';

    currentMorseChar.current += symbol;
    setRawInput(prev => prev + symbol); // Append the raw symbol for visual feedback

    setIsPressing(false);
    pressStartTime.current = null;
    lastReleaseTime.current = Date.now(); // Record release time

    // Start timer to detect end of character sequence
    clearTimers(); // Clear existing timers before setting new ones

    charTimer.current = setTimeout(() => {
      completeInputSequence(); // Signal completion to parent
      charTimer.current = null; // Timer finished
    }, interCharSpace); // Time gap to signify end of character input attempt
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  // Determine border color based on validation state
  const getBorderColor = () => {
    switch (validationState) {
      case 'correct': return 'border-green-500 dark:border-green-400';
      case 'incorrect': return 'border-red-500 dark:border-red-400';
      default: return 'border-gray-300 dark:border-gray-600';
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md w-full">
      {/* Raw Morse Input Display */}
      <div className={`w-full p-3 border-2 ${getBorderColor()} rounded bg-gray-50 dark:bg-gray-700 min-h-[5rem] font-mono text-2xl text-gray-900 dark:text-gray-200 overflow-y-auto break-words transition-colors duration-300`}>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Input:</p>
        {rawInput || <span className="text-gray-400 dark:text-gray-500 text-lg">Tap or hold the button...</span>}
        {isPressing && <span className="animate-pulse text-blue-500">█</span>} {/* Blinking cursor */}
      </div>

      <div className="flex gap-4 items-center">
        <button
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          className={`select-none px-10 py-5 rounded-full text-white font-bold text-xl transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-offset-2 dark:focus:ring-offset-gray-900 shadow-lg ${
            isPressing
              ? 'bg-red-600 dark:bg-red-700 focus:ring-red-400 dark:focus:ring-red-500 scale-95 shadow-inner'
              : 'bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-blue-400 dark:focus:ring-blue-500 active:scale-95'
          }`}
          aria-label="Morse Input Button"
        >
          Tap / Hold
        </button>
        {/* Clear button is now implicitly handled by parent via ref after validation */}
      </div>

       <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-1 px-4">
         Tap briefly for Dit (.), hold longer for Dah (-). Pause after inputting the sequence for the letter above.
       </p>
    </div>
  );
});

// Add display name for better debugging
MorseInput.displayName = 'MorseInput';

export default MorseInput;
