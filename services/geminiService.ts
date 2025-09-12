import { GoogleGenAI, Content, Part, Type } from "@google/genai";
import { ChatMessage, UserSettings, Quiz } from '../types';

let aiClient: GoogleGenAI | null = null;
const getApiKey = (): string | undefined => {
  // Support either API_KEY or GEMINI_API_KEY as configured in vite.config.ts
  const key = (process.env.API_KEY as unknown as string | undefined) || (process.env.GEMINI_API_KEY as unknown as string | undefined);
  return key;
};

const getAI = (): GoogleGenAI => {
  if (aiClient) return aiClient;
  const key = getApiKey();
  if (!key) {
    throw new Error("Missing GEMINI_API_KEY. Please create a .env file with GEMINI_API_KEY=your_key and restart the app.");
  }
  aiClient = new GoogleGenAI({ apiKey: key });
  return aiClient;
};

const getTutorPrompt = (settings: UserSettings): string => {
    const languageInstruction = settings.language === 'sw' 
        ? 'Respond in simple, clear Swahili.' 
        : 'Respond in simple, clear English.';
    
    let persona = `You are 'Gabu', a friendly and knowledgeable learning bot designed to help students. You are an expert in various subjects and are well-versed in the typical learning environment of a student. Your primary goal is to explain complex topics, including solving arithmetic problems, in a very simple, clear, and encouraging way, as if you were a patient and helpful study partner.`;

    if (settings.name) {
        persona += ` The learner you are helping is named ${settings.name}.`;
    }
    if (settings.grade) {
        persona += ` They are in ${settings.grade}. Tailor your explanation to this level.`;
    }
    if (settings.context) {
        persona += ` The context for their study is '${settings.context}'.`;
    }

    const style = `Explain like a patient primary school tutor.
    RULES:
    - Use short, simple words and sentences.
    - Output 3 to 5 numbered steps only, then one final line starting with "Answer:".
    - No markdown, no **bold**, no headings, no code blocks.
    - For math, use words instead of symbols: "times", "plus", "minus", "divided by".
    - If listing types or examples, number them 1..N with one short line each.
    - Keep total under ~8 short lines.`;

    return `${persona} ${languageInstruction} ${style}`;
}

function normalizeKidFriendly(raw: string): string {
  if (!raw) return raw;
  let text = String(raw);
  // Replace bullet asterisks at line starts with hyphens
  text = text.replace(/^\s*\*\s+/gm, '- ');
  // Strip markdown bold/italics and headings/backticks
  text = text.replace(/\*\*(.*?)\*\*/g, '$1');
  text = text.replace(/__(.*?)__/g, '$1');
  text = text.replace(/^#{1,6}\s*/gm, '');
  text = text.replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, ''));
  // Replace multiplication symbols between numbers with 'times'
  text = text.replace(/(\d)\s*[x×*]\s*(\d)/g, '$1 times $2');
  // Replace standalone division slashes between numbers with 'divided by'
  text = text.replace(/(\d)\s*\/\s*(\d)/g, '$1 divided by $2');
  // Replace common inline uses of * and / surrounded by spaces
  text = text.replace(/\s\*\s/g, ' times ');
  text = text.replace(/\s\/\s/g, ' divided by ');
  // Collapse excessive whitespace
  text = text.replace(/\s+$/gm, '').replace(/\n{3,}/g, '\n\n');
  // Hard cap output length for readability
  if (text.length > 1200) text = text.slice(0, 1200) + '…';
  return text;
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

    const response = await getAI().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: `${textPart.text}\nFormat as numbered steps (max 5) and one final 'Answer:' line. No markdown.` }] },
        config: { systemInstruction: getTutorPrompt(settings) }
    });

    const text = typeof (response as any).text === 'function' ? (response as any).text() : (response as any).text;
    const result = typeof text === 'string' ? text : String(text ?? '');
    return normalizeKidFriendly(result);
  } catch (error) {
    console.error("Error generating content from Gemini:", error);
    if (error instanceof Error) throw error;
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

    const response = await getAI().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [audioPart, { text: `${textPart.text}\nFormat as numbered steps (max 5) and one final 'Answer:' line. No markdown.` }] },
        config: { systemInstruction: getTutorPrompt(settings) }
    });
    const text = typeof (response as any).text === 'function' ? (response as any).text() : (response as any).text;
    const result = typeof text === 'string' ? text : String(text ?? '');
    return normalizeKidFriendly(result);

  } catch (error) {
     console.error("Error processing audio with Gemini:", error);
    if (error instanceof Error) throw error;
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

        // If the latest user message asks for a specific number (e.g., "give 10 types"),
        // add a gentle constraint to return exactly that many items, numbered 1..N.
        const lastUser = [...history].reverse().find(m => m.role === 'user');
        const numericMatch = lastUser?.content?.match(/\b(\d{1,3})\b(?!\s*\/)/);
        if (numericMatch) {
            const n = parseInt(numericMatch[1], 10);
            if (!isNaN(n) && n > 0 && n <= 50) {
                contents.push({ role: 'user', parts: [{ text: `If I asked for a number, give exactly ${n} items, numbered 1 to ${n}. Keep each item to one short sentence and use words instead of symbols (say "times" not "*", "divided by" not "/").` }] });
            }
        }

        const response = await getAI().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: { systemInstruction: getTutorPrompt(settings) }
        });
        const text = typeof (response as any).text === 'function' ? (response as any).text() : (response as any).text;
        const result = typeof text === 'string' ? text : String(text ?? '');
        return normalizeKidFriendly(result);

    } catch (error) {
        console.error("Error continuing chat with Gemini:", error);
        if (error instanceof Error) throw error;
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
    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: `Here is the conversation history:\n\n${conversationContext}\n\nPlease generate the quiz now.` }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: quizSchema,
      }
    });

    const raw = typeof (response as any).text === 'function' ? (response as any).text() : (response as any).text;
    const jsonText = (raw ?? '').toString().trim();
    const cleanedJson = jsonText.replace(/^```json\s*|```$/g, '');
    const quizData = JSON.parse(cleanedJson);

    if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
      throw new Error("Invalid quiz format received from AI.");
    }

    return quizData as Quiz;
  } catch (error) {
    console.error("Error generating quiz from Gemini:", error);
    if (error instanceof Error) throw error;
    throw new Error("I had trouble creating a quiz for you. Please try again!");
  }
};

export const generateIllustration = async (topic: string, settings: UserSettings): Promise<string> => {
  try {
    // For now, we'll use the canvas-based illustration since Gemini's image generation
    // API might not be fully available or working as expected
    console.log("Generating illustration for topic:", topic);
    
    // Create a canvas-based illustration
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    
    // Set canvas size
    canvas.width = 400;
    canvas.height = 300;
    
    // Create a colorful, kid-friendly illustration
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, randomColor + '20');
    gradient.addColorStop(1, randomColor + '40');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some fun shapes based on the topic
    ctx.fillStyle = randomColor;
    ctx.globalAlpha = 0.8;
    
    // Draw some educational shapes
    const shapes = ['circle', 'square', 'triangle', 'star'];
    const topicShape = shapes[Math.floor(Math.random() * shapes.length)];
    
    ctx.beginPath();
    switch (topicShape) {
      case 'circle':
        ctx.arc(canvas.width/2, canvas.height/2, 60, 0, 2 * Math.PI);
        break;
      case 'square':
        ctx.rect(canvas.width/2 - 60, canvas.height/2 - 60, 120, 120);
        break;
      case 'triangle':
        ctx.moveTo(canvas.width/2, canvas.height/2 - 60);
        ctx.lineTo(canvas.width/2 - 60, canvas.height/2 + 60);
        ctx.lineTo(canvas.width/2 + 60, canvas.height/2 + 60);
        ctx.closePath();
        break;
      case 'star':
        drawStar(ctx, canvas.width/2, canvas.height/2, 60, 5);
        break;
    }
    ctx.fill();
    
    // Add some decorative elements
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 20 + 10;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Add topic text
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(topic.substring(0, 20), canvas.width/2, canvas.height - 20);
    
    return canvas.toDataURL('image/jpeg', 0.8);
    
  } catch (error) {
    console.error("Error generating illustration:", error);
    
    // Fallback to simple SVG illustration
    try {
      const svg = `
        <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#FF6B6B;stop-opacity:0.3" />
              <stop offset="100%" style="stop-color:#4ECDC4;stop-opacity:0.5" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill="url(#grad1)"/>
          <circle cx="200" cy="150" r="60" fill="#FF6B6B" opacity="0.8"/>
          <text x="200" y="280" text-anchor="middle" font-family="Arial" font-size="20" font-weight="bold" fill="#333">${topic.substring(0, 20)}</text>
        </svg>
      `;
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    } catch (fallbackError) {
      console.error("Fallback illustration failed:", fallbackError);
      throw new Error("Could not create an illustration.");
    }
  }
};

// Helper function to draw a star
function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, points: number) {
  const outerRadius = radius;
  const innerRadius = radius * 0.5;
  const angle = Math.PI / points;
  
  ctx.beginPath();
  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const currX = x + Math.cos(i * angle) * r;
    const currY = y + Math.sin(i * angle) * r;
    
    if (i === 0) {
      ctx.moveTo(currX, currY);
    } else {
      ctx.lineTo(currX, currY);
    }
  }
  ctx.closePath();
}

export const uploadToGCS = async (dataUrl: string, path: string): Promise<string> => {
  const uploadUrl = (process.env.GCS_UPLOAD_URL as unknown as string) || '';
  const publicBase = (process.env.GCS_PUBLIC_BASE_URL as unknown as string) || '';
  if (!uploadUrl || !publicBase) {
    // If not configured, just return the data URL (local only)
    return dataUrl;
  }
  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, dataUrl })
  });
  if (!res.ok) throw new Error('Upload failed');
  const { objectPath } = await res.json();
  return `${publicBase.replace(/\/$/, '')}/${objectPath.replace(/^\//, '')}`;
};

export const uploadToCloudinary = async (dataUrl: string, folder: string): Promise<string> => {
  const cloud = (process.env.CLOUDINARY_CLOUD_NAME as unknown as string) || '';
  const preset = (process.env.CLOUDINARY_UPLOAD_PRESET as unknown as string) || '';
  if (!cloud || !preset) return dataUrl;
  const form = new FormData();
  form.append('file', dataUrl);
  form.append('upload_preset', preset);
  if (folder) form.append('folder', folder);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: 'POST', body: form });
  if (!res.ok) throw new Error('Cloudinary upload failed');
  const json = await res.json();
  return json.secure_url as string;
};