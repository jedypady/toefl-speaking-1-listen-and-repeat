
import React from 'react';
import { Scenario, UserResponse } from '../types';
import { SCORING_RUBRIC } from '../constants';

interface ScoreScreenProps {
  scenario: Scenario | null;
  responses: UserResponse[];
  onReset: () => void;
}

const ScoreCard: React.FC<{ score: number | undefined }> = ({ score }) => {
    const getScoreColor = (s: number | undefined) => {
        if (s === undefined) return 'bg-gray-400';
        if (s >= 4) return 'bg-green-500';
        if (s >= 3) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className={`flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center text-white shadow-lg ${getScoreColor(score)}`}>
            <span className="text-5xl md:text-6xl font-bold">{score ?? '?'}</span>
        </div>
    );
};

const ScoreScreen: React.FC<ScoreScreenProps> = ({ scenario, responses, onReset }) => {
  if (!scenario) return null;

  const totalScore = responses.reduce((acc, res) => acc + (res.scoreData?.score ?? 0), 0);
  const averageScore = (totalScore / responses.length).toFixed(2);

  return (
    <div className="w-full max-w-6xl p-4 md:p-8 bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-extrabold text-indigo-900">Your Results</h2>
        <p className="text-gray-600 mt-2">Here is a breakdown of your performance.</p>
        <div className="mt-4 bg-indigo-100 rounded-lg p-4 inline-block">
            <p className="text-lg font-bold text-indigo-800">Average Score: <span className="text-2xl">{averageScore}</span> / 5.00</p>
        </div>
      </div>

      <div className="space-y-6">
        {scenario.sentences.map((sentence, index) => {
          const response = responses[index];
          const scoreData = response?.scoreData;
          const rubric = SCORING_RUBRIC.find(r => r.score === scoreData?.score);

          return (
            <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4 md:p-6 flex flex-col md:flex-row items-center gap-6">
              <ScoreCard score={scoreData?.score} />
              <div className="flex-grow w-full">
                <p className="text-sm font-semibold text-indigo-700">Sentence {index + 1}</p>
                <blockquote className="text-gray-800 italic mt-1 mb-2">"{sentence.text}"</blockquote>
                <p className="text-sm font-semibold text-gray-700 mt-3">Your Response:</p>
                <p className="text-gray-600 bg-gray-100 p-2 rounded italic">"{response.transcript || 'No response recorded.'}"</p>
                
                {scoreData && rubric && (
                    <div className="mt-4 p-3 bg-indigo-50 rounded-md border-l-4 border-indigo-500">
                        <p className="font-bold text-indigo-900">{rubric.title}</p>
                        <p className="text-sm text-indigo-800 mt-1"><strong>AI Justification:</strong> {scoreData.justification}</p>
                    </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-10">
        <button
          onClick={onReset}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300"
        >
          Practice Again
        </button>
      </div>
    </div>
  );
};

export default ScoreScreen;
