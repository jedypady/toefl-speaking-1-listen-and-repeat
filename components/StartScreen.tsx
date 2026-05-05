import React, { useState, useEffect } from 'react';

interface StartScreenProps {
  onStart: () => void;
  error: string | null;
}

const instructions = [
    "You will hear a short scenario with several sentences.",
    "Listen carefully and repeat each sentence exactly once after the beep.",
    "The narrator will describe your location and role.",
    "A timer will show how much time you have to speak.",
    "No preparation time will be given."
];

const StartScreen: React.FC<StartScreenProps> = ({ onStart, error }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);

    const handleToggleInstructionsSpeech = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            const instructionText = instructions.join(' ');
            const utterance = new SpeechSynthesisUtterance(instructionText);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => {
                console.error("Speech synthesis error");
                setIsSpeaking(false);
            };
            window.speechSynthesis.speak(utterance);
        }
    };

    useEffect(() => {
        // Cleanup function to stop speech when component unmounts
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

  return (
    <div className="w-full max-w-2xl text-center p-8 bg-white rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-3xl font-bold text-indigo-800 mb-4">Welcome to Speaking Practice</h2>
      <p className="text-gray-600 mb-6">
        This tool helps you prepare for the "Listen and Repeat" task. You will hear seven sentences and repeat each one after the beep. Your responses will be scored by AI.
      </p>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <button
        onClick={onStart}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300"
      >
        Start Practice
      </button>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center gap-2 mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Test Instructions</h3>
            <button
              onClick={handleToggleInstructionsSpeech}
              title={isSpeaking ? "Stop Instructions" : "Listen to Instructions"}
              className="p-2 rounded-full hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              aria-label={isSpeaking ? "Stop reading instructions" : "Read instructions aloud"}
            >
              {isSpeaking ? (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 9a1 1 0 00-1 1v2a1 1 0 001 1h4a1 1 0 001-1v-2a1 1 0 00-1-1H8z" clipRule="evenodd" />
                 </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
              )}
            </button>
        </div>
        <ul className="list-disc list-inside text-gray-700 space-y-2 inline-block text-left" role="list">
            {instructions.map((inst, index) => <li key={index}>{inst}</li>)}
        </ul>
      </div>
    </div>
  );
};

export default StartScreen;