import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, Scenario } from '../types';

// Fix: Add definitions for Web Speech API as it's not standard in TS DOM lib yet.
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  readonly [index: number]: SpeechRecognitionAlternative;
  readonly length: number;
  readonly isFinal: boolean;
}

interface SpeechRecognitionResultList {
  readonly [index: number]: SpeechRecognitionResult;
  readonly length: number;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface PracticeScreenProps {
  scenario: Scenario;
  sentenceNumber: number;
  totalSentences: number;
  onResponseComplete: (transcript: string) => void;
  setAppState: (state: AppState) => void;
}

const PracticeScreen: React.FC<PracticeScreenProps> = ({
  scenario,
  sentenceNumber,
  totalSentences,
  onResponseComplete,
  setAppState,
}) => {
  const { introduction, sentences, speakerGender } = scenario;
  const sentence = sentences[sentenceNumber - 1];

  const [status, setStatus] = useState<'narrator' | 'ready' | 'listening' | 'recording' | 'finished'>(
    sentenceNumber === 1 ? 'narrator' : 'ready'
  );
  const [timeLeft, setTimeLeft] = useState(sentence.duration);
  const [transcript, setTranscript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const timerRef = useRef<number | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const beepAudioRef = useRef<HTMLAudioElement | null>(null);

  // Effect to select a voice based on speaker gender
  useEffect(() => {
    const getAndSetVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const isFemale = speakerGender === 'female';
        const enUSVoices = voices.filter(v => v.lang.startsWith('en-US'));

        let voice = enUSVoices.find(v => {
          const name = v.name.toLowerCase();
          if (isFemale) {
            return name.includes('female') || ['samantha', 'susan', 'zira', 'vanessa'].some(n => name.includes(n));
          } else {
            return name.includes('male') || ['alex', 'david', 'tom', 'daniel'].some(n => name.includes(n));
          }
        });

        // Fallback to any en-US voice if a specific gendered voice isn't found
        if (!voice && enUSVoices.length > 0) {
          const fallbackFemale = enUSVoices.find(v => v.name.toLowerCase().includes('female'));
          const fallbackMale = enUSVoices.find(v => v.name.toLowerCase().includes('male'));
          if (isFemale && fallbackFemale) {
            voice = fallbackFemale;
          } else if (!isFemale && fallbackMale) {
            voice = fallbackMale;
          } else {
            // As a last resort, pick the first en-US voice.
            voice = enUSVoices[0];
          }
        }
        
        setSelectedVoice(voice || null);
      }
    };

    // Voices are loaded asynchronously
    getAndSetVoice();
    window.speechSynthesis.onvoiceschanged = getAndSetVoice;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [speakerGender]);

  const speak = useCallback((text: string, onEndCallback: () => void) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.onend = onEndCallback;
    // Cancel any ongoing speech before starting a new one
    window.speechSynthesis.cancel(); 
    window.speechSynthesis.speak(utterance);
  }, [selectedVoice]);

  const cleanUp = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.stop();
    }
  }, []);

  const startRecording = useCallback(() => {
    if (beepAudioRef.current) {
        beepAudioRef.current.play().then(() => {
            setAppState(AppState.RECORDING);
            setStatus('recording');
            setTimeLeft(sentence.duration);
            
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false;
                recognitionRef.current.interimResults = false;
                recognitionRef.current.lang = 'en-US';
    
                recognitionRef.current.onresult = (event) => {
                    const speechToText = event.results[0][0].transcript;
                    setTranscript(speechToText);
                };
    
                recognitionRef.current.onend = () => {
                    // This can be triggered by stop() or silence.
                    // The main onResponseComplete logic is handled by the timer finishing.
                };

                recognitionRef.current.onerror = (event) => {
                    console.error('Speech recognition error', event.error);
                };
    
                recognitionRef.current.start();
            } else {
                console.error("Speech recognition not supported in this browser.");
            }
    
            timerRef.current = window.setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        });
    }
  }, [sentence.duration, setAppState]);


  const handleListen = useCallback(() => {
    setAppState(AppState.LISTENING);
    setStatus('listening');
    speak(sentence.text, startRecording);
  }, [sentence.text, setAppState, startRecording, speak]);

  useEffect(() => {
    if (status === 'narrator') {
      setAppState(AppState.LISTENING);
       // Wait a moment for voices to potentially load before speaking
      setTimeout(() => {
        speak(introduction, () => {
          setStatus('ready');
          setAppState(AppState.READY);
        });
      }, 200);
    }
  }, [status, setAppState, introduction, speak]);

  useEffect(() => {
    beepAudioRef.current = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'+Array(300).join('123'));
    return () => {
        cleanUp();
        window.speechSynthesis.cancel();
    };
  }, [cleanUp]);
  
  useEffect(() => {
    if (timeLeft <= 0 && status === 'recording') {
      setStatus('finished');
      cleanUp();
      // Use a short timeout to ensure the final transcript is captured before moving on
      setTimeout(() => onResponseComplete(transcript), 500);
    }
  }, [timeLeft, status, cleanUp, onResponseComplete, transcript]);


  return (
    <div className="w-full max-w-4xl p-8 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col items-center">
        <div className="w-full text-center mb-6">
            <p className="text-sm font-medium text-gray-500">Sentence {sentenceNumber} of {totalSentences}</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${(sentenceNumber / totalSentences) * 100}%` }}></div>
            </div>
        </div>

        {status === 'narrator' && (
             <div className="text-center">
                <p className="text-2xl font-semibold text-indigo-700 animate-pulse">Narrator speaking...</p>
                <p className="text-gray-600 mt-2 italic">"{introduction}"</p>
            </div>
        )}
        
        {status === 'ready' && (
            <div className="text-center">
                 <p className="text-lg text-gray-700 mb-6">Click the button to hear the sentence.</p>
                <button onClick={handleListen} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg transition-transform transform hover:scale-105">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 inline-block mr-3" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                    Listen
                </button>
            </div>
        )}

        {status === 'listening' && (
             <div className="text-center">
                <p className="text-2xl font-semibold text-indigo-700 animate-pulse">Listening...</p>
                <p className="text-gray-600 mt-2">Prepare to repeat the sentence.</p>
            </div>
        )}

        {status === 'recording' && (
            <div className="text-center w-full">
                 <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></div>
                    <p className="text-2xl font-bold text-red-500">RECORDING</p>
                </div>
                <div className="text-6xl font-mono font-bold text-indigo-900 my-4">{timeLeft}</div>
                <p className="text-gray-600">Repeat the sentence now.</p>
            </div>
        )}
    </div>
  );
};

export default PracticeScreen;