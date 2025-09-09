import { GoogleGenAI, Content, Part, Type } from "@google/genai";
import { ChatMessage, UserSettings, Quiz } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getTutorPrompt = (settings: UserSettings): string => {
    const languageInstruction = settings.language === 'sw' 
        ? 'Respond in simple, clear Swahili.' 
        : 'Respond in simple, clear English.';
    
    let persona = `You are an expert AI tutor named 'Gabu'. Your goal is to explain complex topics, including solving arithmetic problems, in a very simple, clear, and encouraging way.`;

    if (settings.name) {
        persona += ` The learner you are helping is named ${settings.name}.`;
    }
    if (settings.grade) {
        persona += ` They are in ${settings.grade}. Tailor your explanation to this level.`;
    }
    if (settings.context) {
        persona += ` The context for their study is '${settings.context}'.`;
    }

    return `${persona} ${languageInstruction} Analyze the text in the user's image, audio transcription, or follow-up questions. If you solve a math problem, explain each step clearly. Keep your explanations concise, easy to understand, and maintain a friendly, positive tone. Start directly with the explanation.`;
}

function dataUrlToBase64(dataUrl: string): { mimeType: string; data: string } {
    const parts = dataUrl.split(',');
    if (parts.length !== 2) {
        throw new Error('Invalid data URL');
    }
    const mimeType = parts[0].split(':')[1].split(';')[0];
    const data = parts[1];
    return { mimeType, data };
}

export const explainTextFromImage = async (imageDataUrl: string, settings: UserSettings): Promise<string> => {
  try {
    const { mimeType, data } = dataUrlToBase64(imageDataUrl);

    const imagePart = {
      inlineData: {
        mimeType,
        data,
      },
    };

    const textPart = {
      text: `Please explain the main concept in the text from this image. If it's a math problem, solve it and show the steps.`,
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: { systemInstruction: getTutorPrompt(settings) }
    });

    return response.text;
  } catch (error) {
    console.error("Error generating content from Gemini:", error);
    throw new Error("Failed to communicate with the AI model.");
  }
};

export const explainAudio = async (audioDataUrl: string, settings: UserSettings): Promise<string> => {
  try {
    const { mimeType, data } = dataUrlToBase64(audioDataUrl);
    const audioPart = {
      inlineData: {
        mimeType,
        data,
      },
    };
    const textPart = {
        text: `Please transcribe the following audio and then provide a simple explanation of the main topic discussed.`
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [audioPart, textPart] },
        config: { systemInstruction: getTutorPrompt(settings) }
    });
    
    return response.text;

  } catch (error) {
     console.error("Error processing audio with Gemini:", error);
    throw new Error("Failed to communicate with the AI model for audio processing.");
  }
};


export const continueChat = async (history: ChatMessage[], settings: UserSettings): Promise<string> => {
    try {
        const contents: Content[] = history.map(msg => {
            const parts: Part[] = [{ text: msg.content }];
            if (msg.attachment) {
                const { mimeType, data } = dataUrlToBase64(`data:${msg.attachment.mimeType};base64,${msg.attachment.data}`);
                parts.push({
                    inlineData: {
                        mimeType,
                        data
                    }
                });
            }
            return { role: msg.role, parts };
        });
        
        if (contents.length > 0 && contents[contents.length - 1].role !== 'user') {
            contents.push({ role: 'user', parts: [{ text: "(Continuing thought...)"}] });
        }


        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: { systemInstruction: getTutorPrompt(settings) }
        });

        return response.text;

    } catch (error) {
        console.error("Error continuing chat with Gemini:", error);
        throw new Error("Failed to get a response from the AI model.");
    }
}

export const generateQuiz = async (history: ChatMessage[], settings: UserSettings): Promise<Quiz> => {
  const conversationContext = history.map(msg => `${msg.role === 'model' ? 'Gabu' : 'Student'}: ${msg.content}`).join('\n');

  const systemInstruction = `You are a helpful quiz master. Based on the following conversation, create a short multiple-choice quiz with 3 questions to test the user's understanding. The user is ${settings.name || 'a student'} in ${settings.grade || 'school'}. The quiz should be in ${settings.language === 'sw' ? 'Swahili' : 'English'}. For each question, provide 4 options, the 0-indexed integer for the correct answer's index, and a brief explanation for why the answer is correct.`;

  const quizSchema = {
    type: Type.OBJECT,
    properties: {
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswerIndex: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswerIndex", "explanation"]
        }
      }
    },
    required: ["questions"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: `Here is the conversation history:\n\n${conversationContext}\n\nPlease generate the quiz now.` }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: quizSchema,
      }
    });

    const jsonText = response.text.trim();
    const cleanedJson = jsonText.replace(/^```json\s*|```$/g, '');
    const quizData = JSON.parse(cleanedJson);

    if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
      throw new Error("Invalid quiz format received from AI.");
    }

    return quizData as Quiz;
  } catch (error) {
    console.error("Error generating quiz from Gemini:", error);
    throw new Error("I had trouble creating a quiz for you. Please try again!");
  }
};
