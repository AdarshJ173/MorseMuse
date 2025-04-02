import React, { useState, useEffect, useCallback, useRef } from 'react'; // Added useRef
import MorseInput, { MorseInputHandle } from './MorseInput'; // Import handle type

// Basic Morse code mapping (uppercase only for now)
const morseCodeMap: { [key: string]: string } = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  // Add numbers later if needed
};

const learningSequence = Object.keys(morseCodeMap); // Learn A-Z

type ValidationState = 'idle' | 'correct' | 'incorrect';

export default function LearningInterface() {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [validationState, setValidationState] = useState<ValidationState>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const morseInputRef = useRef<MorseInputHandle>(null); // Use imported handle type
  const [isMounted, setIsMounted] = useState(false); // State to track client mount

  // Set mounted state only on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);


  const currentItem = learningSequence[currentItemIndex];
  const expectedMorse = morseCodeMap[currentItem];

  const handleInputComplete = useCallback((inputMorse: string) => {
    if (!currentItem) return; // End of sequence

    console.log(`Input Complete: ${inputMorse}, Expected: ${expectedMorse}`); // Debug log

    if (inputMorse === expectedMorse) {
      setValidationState('correct');
      setFeedbackMessage('Correct!');
      // Automatically move to the next item after a short delay
      setTimeout(() => {
        if (currentItemIndex < learningSequence.length - 1) {
          setCurrentItemIndex(prevIndex => prevIndex + 1);
          setValidationState('idle');
          setFeedbackMessage('');
          morseInputRef.current?.clearInput(); // Clear input for the next item
        } else {
          // Handle completion of the learning sequence
          setFeedbackMessage('Congratulations! You completed all letters.');
          // Maybe disable input or show a summary
        }
      }, 800); // 0.8 second delay
    } else {
      setValidationState('incorrect');
      setFeedbackMessage(`Incorrect. Expected: ${expectedMorse}`);
      // Clear input after a delay so user can see the error
       setTimeout(() => {
           setValidationState('idle'); // Reset validation state visually
           setFeedbackMessage(''); // Clear feedback message
           morseInputRef.current?.clearInput(); // Clear input for retry
       }, 1500); // 1.5 second delay
    }
  }, [currentItemIndex, currentItem, expectedMorse]);

   // Reset feedback when the item changes, only if mounted
   useEffect(() => {
    if (isMounted) {
        setValidationState('idle');
        setFeedbackMessage('');
        morseInputRef.current?.clearInput();
    }
   }, [currentItemIndex, isMounted]); // Add isMounted dependency

  // Render loading or null on the server and initial client render
  if (!isMounted) {
    // You can return null or a simple loading indicator
    // Returning null is often sufficient to prevent hydration mismatch
    return null;
    // Or: return <div className="text-center p-8">Loading Interface...</div>;
  }


  // --- Rest of the component logic remains the same, but now runs only after mount ---

  if (!currentItem) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">Sequence Complete!</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mt-2">You've learned all the letters!</p>
        {/* Add options to restart or move to the next stage */}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 p-4 md:p-8 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="w-full text-center">
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
          Learning Letters ({currentItemIndex + 1} / {learningSequence.length})
        </p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
          <div
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentItemIndex + 1) / learningSequence.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Current Item Display */}
      <div className="text-center bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">Enter the Morse code for:</p>
        <p className="text-6xl md:text-8xl font-bold text-gray-900 dark:text-gray-100 tracking-wider">{currentItem}</p>
        <p className="text-md text-gray-500 dark:text-gray-400 mt-3 font-mono">({expectedMorse})</p>
      </div>

      {/* Morse Input Component */}
      <MorseInput
        ref={morseInputRef}
        onInputComplete={handleInputComplete}
        validationState={validationState}
        key={currentItemIndex} // Force re-render with new state when item changes
      />

      {/* Feedback Area */}
      <div className="h-6 mt-2 text-center">
        {feedbackMessage && (
          <p className={`text-lg font-semibold ${
            validationState === 'correct' ? 'text-green-600 dark:text-green-400' :
            validationState === 'incorrect' ? 'text-red-600 dark:text-red-400' :
            'text-gray-700 dark:text-gray-300' // Idle state (or general messages)
          }`}>
            {feedbackMessage}
          </p>
        )}
      </div>
    </div>
  );
}
