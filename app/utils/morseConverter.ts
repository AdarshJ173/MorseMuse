// Morse code mapping (consistent with previous components)
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
    '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
    // Define space representation if needed, but typically handled by letter spacing
};

// Function to convert a word to Morse code
// Adds a single space between letters' Morse representations
export function wordToMorse(word: string): string {
    if (!word) return '';
    return word
        .toUpperCase() // Ensure consistency
        .split('') // Split into individual characters
        .map(char => morseCodeMap[char] || '') // Get Morse for each char, empty string if not found
        .filter(code => code !== '') // Filter out any characters not in the map
        .join(' '); // Join Morse codes with a single space
}

// Optional: Function to convert Morse back to text (if needed later)
export function morseToWord(morse: string): string {
    const reverseMorseCodeMap: { [key: string]: string } = Object.entries(
        morseCodeMap
    ).reduce((acc, [key, value]) => {
        acc[value] = key;
        return acc;
    }, {} as { [key: string]: string });

    return morse
        .trim()
        .split(' ') // Split by space between letters
        .map(code => reverseMorseCodeMap[code] || '?') // Translate each code, '?' for unknown
        .join('');
}
