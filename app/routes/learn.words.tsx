import { useState, useEffect } from 'react';
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { wordToMorse } from '~/utils/morseConverter'; // Import the utility
import { ArrowLeft, HelpCircle, RefreshCw, Send } from 'lucide-react'; // Icons

export const meta: MetaFunction = () => {
  return [
    { title: "MorseMuse - Learn Words" },
    { name: "description", content: "Practice translating words into Morse code." },
  ];
};

// --- Server-Side Loader ---
export async function loader({ request }: LoaderFunctionArgs) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set in the environment variables.");
    // Return a default word or error state for the frontend to handle
    return json({ word: "ERROR", error: "API key not configured." });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Configuration for the API call (optional, adjust as needed)
    // const generationConfig = {
    //   temperature: 0.9,
    //   topK: 1,
    //   topP: 1,
    //   maxOutputTokens: 20, // Limit output size
    // };

     const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE, },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE, },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE, },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE, },
     ];


    const prompt = "Generate a single, common, simple English word between 4 and 8 letters long, suitable for Morse code practice. Only return the word itself, nothing else. Ensure it contains only standard English letters.";

    // Pass safety settings to generateContent
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        // generationConfig, // Add back if needed
        safetySettings,
      });

    const response = result.response;
    const text = response.text().trim().toUpperCase(); // Ensure uppercase

     // **Stricter Validation:** Check if it's a single word with only letters
     if (!text || !/^[A-Z]+$/.test(text) || text.includes(' ')) {
       console.error("Gemini API returned invalid format or non-letter characters:", text);
       // Fallback or retry logic could go here
       return json({ word: "HELLO", error: "Received invalid word format, using default." }); // Default fallback
     }


    console.log("Generated word:", text); // Log server-side
    return json({ word: text, error: null }); // Success

  } catch (error: any) {
    console.error("Error fetching word from Gemini API:", error);
     // Provide a slightly more informative error message if possible
     const errorMessage = error.message?.includes('API key not valid')
       ? "Invalid API Key."
       : "Failed to fetch word from API.";
    // Return a default word or error state
    return json({ word: "MORSE", error: errorMessage }); // Default fallback
  }
}
// --- End Server-Side Loader ---

type ValidationState = 'idle' | 'correct' | 'incorrect' | 'hinted';
type LoaderData = { word: string; error: string | null };

export default function LearnWords() {
  const initialData = useLoaderData<typeof loader>();
  const fetcher = useFetcher<LoaderData>(); // Fetcher for client-side reload trigger

  const [currentWord, setCurrentWord] = useState(initialData.word);
  const [apiError, setApiError] = useState(initialData.error);
  const [userInput, setUserInput] = useState('');
  const [correctMorse, setCorrectMorse] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [validationState, setValidationState] = useState<ValidationState>('idle');

  const isLoading = fetcher.state === 'loading' || fetcher.state === 'submitting';

  // Update state when fetcher loads new data (after "Next Word")
  // This handles both successful fetches and fetches that resulted in an error/default word
  useEffect(() => {
    if (fetcher.data && fetcher.state === 'idle') {
      setCurrentWord(fetcher.data.word);
      setApiError(fetcher.data.error); // Update error state based on fetcher result
      // Reset state for the new word (or default word)
      setUserInput('');
      setShowHint(false);
      setFeedback('');
      setValidationState('idle');
    }
  }, [fetcher.data, fetcher.state]);

  // Calculate correct Morse code when the word changes (works for default words too)
  useEffect(() => {
    setCorrectMorse(wordToMorse(currentWord));
  }, [currentWord]);

  const handleCheck = () => {
    if (isLoading || validationState === 'correct') return; // Prevent check if loading or already correct

    const cleanedInput = userInput.trim().replace(/\s+/g, ' '); // Normalize spaces
    if (cleanedInput === correctMorse) {
      setFeedback('Correct!');
      setValidationState('correct');
      // Optionally auto-fetch next word after correct
      // setTimeout(handleNextWord, 1000);
    } else {
      setFeedback('Incorrect. Try again or use the hint.');
      setValidationState('incorrect');
    }
  };

  const handleShowHint = () => {
    if (isLoading || validationState === 'correct') return; // Prevent hint if loading or already correct
    setShowHint(true);
    setValidationState('hinted'); // Mark state as hinted
    setFeedback(''); // Clear previous feedback
  };

  const handleNextWord = () => {
    if (isLoading) return;
    // Trigger the loader function again
    fetcher.load('/learn/words');
    // State reset happens in the useEffect watching fetcher.data
  };

  const getBorderColor = () => {
    switch (validationState) {
      case 'correct': return 'border-green-500 dark:border-green-400';
      case 'incorrect': return 'border-red-500 dark:border-red-400';
      case 'hinted': return 'border-yellow-500 dark:border-yellow-400';
      default: return 'border-gray-300 dark:border-gray-600';
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4 md:p-8 w-full max-w-2xl mx-auto relative">
       {/* Back Button */}
       <Link
         to="/"
         className="absolute top-2 left-2 md:top-4 md:left-4 flex items-center px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm z-10"
         aria-label="Back to Home"
       >
         <ArrowLeft size={16} className="mr-1" />
         Home
       </Link>

      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-8 md:mt-4">Learn Words</h1>

      {/* Display API Error if present */}
      {apiError && (
        <p className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 p-3 rounded border border-red-300 dark:border-red-700 text-center">
          {/* Display the specific error from the loader */}
          Warning: {apiError} Using default word.
        </p>
      )}

      {/* Word Display */}
      <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full">
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">Translate this word to Morse:</p>
        <p className={`text-5xl md:text-7xl font-bold text-gray-900 dark:text-gray-100 tracking-widest ${isLoading ? 'opacity-50 animate-pulse' : ''}`}>
          {/* Show loading indicator more clearly */}
          {isLoading ? 'LOADING...' : currentWord}
        </p>
      </div>

      {/* Morse Input Area */}
      <div className={`w-full p-4 border-2 ${getBorderColor()} rounded bg-white dark:bg-gray-700 transition-colors duration-300`}>
        <label htmlFor="morseInput" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
          Your Morse Code Input:
        </label>
        <input
          id="morseInput"
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type . - / and spaces here..."
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 font-mono text-xl text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          disabled={isLoading || validationState === 'correct'} // Disable input when correct
          aria-label="Morse code input field"
        />
      </div>

       {/* Hint Display Area */}
       {showHint && (
         <div className="w-full p-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded text-center">
           <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">Hint (Correct Morse):</p>
           <p className="font-mono text-xl text-yellow-900 dark:text-yellow-100 mt-1">{correctMorse}</p>
         </div>
       )}


      {/* Feedback Area */}
      <div className="h-6 mt-1 text-center">
        {feedback && (
          <p className={`text-lg font-semibold ${
            validationState === 'correct' ? 'text-green-600 dark:text-green-400' :
            validationState === 'incorrect' ? 'text-red-600 dark:text-red-400' :
            validationState === 'hinted' ? 'text-yellow-600 dark:text-yellow-400' :
            'text-gray-700 dark:text-gray-300'
          }`}>
            {feedback}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mt-4 w-full">
        <button
          onClick={handleCheck}
          disabled={isLoading || !userInput || validationState === 'correct'} // Disable check when correct
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          <Send size={18} /> Check
        </button>
        <button
          onClick={handleShowHint}
          disabled={isLoading || showHint || validationState === 'correct'} // Disable hint when correct
          className="flex items-center gap-2 px-5 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          <HelpCircle size={18} /> Hint
        </button>
        <button
          onClick={handleNextWord}
          disabled={isLoading}
          className={`flex items-center gap-2 px-5 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 ${isLoading ? 'animate-pulse' : ''}`}
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} /> Next Word
        </button>
      </div>

       <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-6 px-4">
         Use '.' for Dit, '-' for Dah. Add one space between letters' Morse code.
       </p>

    </div>
  );
}
