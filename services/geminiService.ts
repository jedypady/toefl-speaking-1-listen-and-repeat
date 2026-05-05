import { GoogleGenAI, Type } from '@google/genai';
import { Scenario, ScoreData } from '../types';
import { SCORING_RUBRIC } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateScenario = async (): Promise<Scenario> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Generate a TOEFL iBT 'Listen and Repeat' speaking task scenario.
    The scenario must be self-contained, coherent, natural, and relevant to academic or campus life in American English.
    
    First, provide a brief spoken introduction for a narrator. This introduction must set the scene (e.g., your location and role) AND include the instruction to listen and repeat. The introduction should be a single, cohesive paragraph. For example: "You're volunteering at the university's welcome week. Listen to the event coordinator and repeat her instructions exactly as you hear them."
    
    Then, provide exactly 7 unique sentences that would be spoken in that scenario by a single speaker.
    Also, specify the gender of this speaker ('male' or 'female').
    
    The sentences must progressively increase in length and grammatical complexity as follows:
    - Sentences 1-2: Simple (8 seconds response time)
    - Sentences 3-5: Moderate (10 seconds response time)
    - Sentences 6-7: Complex, up to 14 words (12 seconds response time)
    
    Return the response ONLY in the specified JSON format.
    `,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          introduction: {
            type: Type.STRING,
            description: 'The narrator\'s introduction to the scenario, including context and instructions.'
          },
          speakerGender: {
            type: Type.STRING,
            description: "The gender of the speaker. Must be 'male' or 'female'."
          },
          sentences: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                duration: { type: Type.INTEGER }
              },
              required: ['text', 'duration']
            }
          }
        },
        required: ['introduction', 'speakerGender', 'sentences']
      }
    }
  });

  const jsonText = response.text.trim();
  const scenario = JSON.parse(jsonText);
  
  // Basic validation
  if (!scenario.introduction || !scenario.speakerGender || !['male', 'female'].includes(scenario.speakerGender) || !Array.isArray(scenario.sentences) || scenario.sentences.length !== 7) {
    throw new Error('Invalid scenario format received from API.');
  }
  
  return scenario;
};

export const scoreResponse = async (originalSentence: string, userTranscript: string): Promise<ScoreData> => {
  const rubricString = SCORING_RUBRIC.map(r => 
    `Score ${r.score}: ${r.title}\nDetails: ${r.details.join(' ')}`
  ).join('\n\n');

  const prompt = `You are a certified TOEFL iBT speaking evaluator. Your task is to score a user's response for the 'Listen and Repeat' task based on the provided rubric.

  **SCORING RUBRIC:**
  ---
  ${rubricString}
  ---

  **EVALUATION TASK:**
  - Original Sentence: "${originalSentence}"
  - User's Transcribed Response: "${userTranscript || '(No response provided)'}"

  **INSTRUCTIONS:**
  1. Compare the user's response to the original sentence.
  2. Evaluate accuracy, completeness, and potential intelligibility issues based on the transcription.
  3. Assign a score from 0 to 5, adhering strictly to the rubric.
  4. Provide a brief, one-sentence justification for your score, explaining the key reason based on the rubric's criteria.
  
  Return the response ONLY in the specified JSON format.
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { 
            type: Type.INTEGER,
            description: "A score from 0 to 5."
          },
          justification: { 
            type: Type.STRING,
            description: "A brief, one-sentence justification for the score."
          }
        },
        required: ['score', 'justification']
      }
    }
  });

  const jsonText = response.text.trim();
  const scoreData = JSON.parse(jsonText);

  // Basic validation
  if (typeof scoreData.score !== 'number' || typeof scoreData.justification !== 'string') {
    throw new Error('Invalid score format received from API.');
  }

  return scoreData;
};