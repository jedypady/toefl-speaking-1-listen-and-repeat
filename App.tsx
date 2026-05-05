import React, { useState, useCallback } from 'react';
import { AppState, Scenario, UserResponse } from './types';
import { generateScenario, scoreResponse } from './services/geminiService';
import Header from './components/Header';
import StartScreen from './components/StartScreen';
import PracticeScreen from './components/PracticeScreen';
import ScoreScreen from './components/ScoreScreen';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [userResponses, setUserResponses] = useState<UserResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleStart = useCallback(async () => {
    setAppState(AppState.GENERATING);
    setError(null);
    try {
      const newScenario = await generateScenario();
      setScenario(newScenario);
      setCurrentSentenceIndex(0);
      setUserResponses([]);
      setAppState(AppState.READY);
    } catch (e) {
      console.error(e);
      setError('Failed to generate a new scenario. Please try again.');
      setAppState(AppState.IDLE);
    }
  }, []);

  const handleResponseComplete = useCallback(async (transcript: string) => {
    const newResponses = [...userResponses, { transcript, scoreData: null }];
    setUserResponses(newResponses);

    if (currentSentenceIndex < 6) {
      setCurrentSentenceIndex(prev => prev + 1);
      setAppState(AppState.READY);
    } else {
      setAppState(AppState.PROCESSING);
      try {
        const scoredResponses: UserResponse[] = await Promise.all(
          newResponses.map(async (response, index) => {
            if (scenario?.sentences[index]) {
              const scoreData = await scoreResponse(scenario.sentences[index].text, response.transcript);
              return { ...response, scoreData };
            }
            return response;
          })
        );
        setUserResponses(scoredResponses);
        setAppState(AppState.FINISHED);
      } catch (e) {
        console.error(e);
        setError('Failed to score responses. Please try again.');
        setAppState(AppState.IDLE);
      }
    }
  }, [userResponses, currentSentenceIndex, scenario]);

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setScenario(null);
    setCurrentSentenceIndex(0);
    setUserResponses([]);
    setError(null);
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.GENERATING:
        return <LoadingSpinner message="Generating your practice scenario..." />;
      case AppState.PROCESSING:
        return <LoadingSpinner message="Evaluating your responses..." />;
      case AppState.READY:
      case AppState.LISTENING:
      case AppState.RECORDING:
        if (scenario) {
          return (
            <PracticeScreen
              key={currentSentenceIndex}
              scenario={scenario}
              sentenceNumber={currentSentenceIndex + 1}
              totalSentences={scenario.sentences.length}
              onResponseComplete={handleResponseComplete}
              setAppState={setAppState}
            />
          );
        }
        return <StartScreen onStart={handleStart} error={error} />;
      case AppState.FINISHED:
        return <ScoreScreen scenario={scenario} responses={userResponses} onReset={handleReset} />;
      case AppState.IDLE:
      default:
        return <StartScreen onStart={handleStart} error={error} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        {renderContent()}
      </main>
      <footer className="text-center p-4 text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} TOEFL iBT Speaking Pro. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;