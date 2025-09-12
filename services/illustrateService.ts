import { GoogleGenAI } from '@google/genai';
import { DiagramRequest, DiagramResponse } from '../types';

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

interface DiagramRequest {
  topic: string;
  type: 'anatomy' | 'process' | 'structure' | 'concept';
  complexity: 'simple' | 'intermediate' | 'detailed';
  userSettings: {
    name: string;
    grade: string;
    context: string;
    language: string;
  };
}

interface DiagramResponse {
  imageUrl: string;
  description: string;
  labels: string[];
  explanation: string;
}

export const generateEducationalDiagram = async (
  request: DiagramRequest
): Promise<DiagramResponse> => {
  const { topic, type, complexity, userSettings } = request;
  
  // Create optimized prompt for Imagen 4 (max 480 tokens)
  const optimizedPrompt = createOptimizedImagePrompt(topic, type, complexity, userSettings);
  
  console.log('Generating educational diagram for:', topic);
  console.log('Using optimized prompt:', optimizedPrompt);

  // Test API connection first
  try {
    await testAPIConnection();
  } catch (error) {
    console.error('API connection test failed:', error);
    throw new Error(`API connection failed: ${error.message}. Please check your API key and internet connection.`);
  }

  // Generate image using Imagen 4 with robust error handling
  const imageUrl = await generateImageWithRetry(optimizedPrompt, topic);
  
  // Generate educational description
  const description = await generateEducationalDescription(topic, type, complexity, userSettings);
  
  return {
    imageUrl,
    description: description.description,
    labels: description.labels,
    explanation: description.explanation
  };
};

// Test API connection
const testAPIConnection = async (): Promise<void> => {
  try {
    const ai = getAI();
    console.log('✅ API client initialized');
    
    // Test with a simple text generation to verify API key works
    const testResult = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { 
        parts: [{ text: 'Say "API test successful"' }] 
      }
    });
    
    const text = typeof (testResult as any).text === 'function' ? (testResult as any).text() : (testResult as any).text;
    console.log('✅ API test successful:', text);
  } catch (error) {
    console.error('❌ API test failed:', error);
    throw error;
  }
};

// Generate image using Google AI Studio REST API (correct approach for Gemini image generation)
const generateImageViaRESTAPI = async (prompt: string): Promise<any> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API key not found');
  }

  // Use the correct Google AI Studio endpoint for image generation
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent';
  
  const requestBody = {
    contents: [{
      parts: [{
        text: `Create a pure visual educational diagram of ${prompt}. 

CRITICAL REQUIREMENTS:
- NO text, labels, numbers, or annotations anywhere on the image
- NO arrows pointing to parts
- NO written words or letters
- NO callouts or text boxes
- Just clean visual representation of the concept
- Educational but completely text-free

The image should be a pure visual diagram that learners can study without any misleading text overlays.`
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 512, // Reduced for faster generation
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      }
    ]
  };

  console.log('Making Google AI Studio REST API call to:', url);
  console.log('Request body:', requestBody);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google AI Studio REST API error:', response.status, errorText);
    throw new Error(`Google AI Studio API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('Google AI Studio REST API response:', result);
  
  return result;
};

// Generate detailed educational description as fallback
const generateDetailedEducationalDescription = async (prompt: string, topic: string): Promise<string> => {
  try {
    const result = await getAI().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { 
        parts: [{ 
          text: `Create a detailed visual description for a PURE VISUAL educational diagram of ${topic}. 
          
          The original prompt was: ${prompt}
          
          CRITICAL REQUIREMENTS - The diagram must be:
          - COMPLETELY TEXT-FREE (no words, labels, numbers, or annotations)
          - NO arrows or callouts
          - NO written text anywhere
          - Pure visual representation only
          
          Provide a comprehensive description in this EXACT format:
          
          [Brief overview of what the diagram shows]
          
          1. [First key component or feature visible in the diagram - focus on what students should learn about it]
          2. [Second key component or feature visible in the diagram - focus on what students should learn about it]
          3. [Third key component or feature visible in the diagram - focus on what students should learn about it]
          4. [Fourth key component or feature visible in the diagram - focus on what students should learn about it]
          5. [Fifth key component or feature visible in the diagram - focus on what students should learn about it]
          
          Make each numbered point educational and specific to what students can see and learn from the visual diagram. Focus on key learning points that would be good for quiz questions.` 
        }] 
      },
      config: { 
        systemInstruction: "You are an expert educational content creator. Create detailed, engaging visual descriptions that help students understand complex concepts through diagrams. Focus on clarity, visual appeal, and educational value."
      }
    });

    const text = typeof (result as any).text === 'function' ? (result as any).text() : (result as any).text;
    const description = typeof text === 'string' ? text : String(text ?? '');
    
    // Create a data URL with the description as an image
    return createDescriptionAsImage(description, topic);
  } catch (error) {
    console.error('Error generating educational description:', error);
    return createDescriptionAsImage(`Educational diagram description for ${topic}. This would show the key components and relationships to help students understand the concept.`, topic);
  }
};

// Create a visual representation of the description (optimized for fast loading)
const createDescriptionAsImage = (description: string, topic: string): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 600;  // Reduced from 800 for faster loading
  canvas.height = 400; // Reduced from 600 for faster loading
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Create a gradient background
    const gradient = ctx.createLinearGradient(0, 0, 600, 400);
    gradient.addColorStop(0, '#f0f9ff');
    gradient.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 400);
    
    // Add border
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, 600, 400);
    
    // Add title
    ctx.fillStyle = '#0c4a6e';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Educational Description: ${topic.toUpperCase()}`, 300, 40);
    
    // Add description (wrapped text)
    ctx.fillStyle = '#0369a1';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    
    const words = description.split(' ');
    let line = '';
    let y = 80;
    const maxWidth = 550;
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, 25, y);
        line = words[n] + ' ';
        y += 20;
        if (y > 320) break; // Prevent overflow
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 25, y);
    
    // Add note
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Educational Description (Image generation unavailable)', 300, 360);
    ctx.fillText('Use this description with DALL-E, Midjourney, or other AI image generators', 300, 380);
  }
  
  return canvas.toDataURL('image/png');
};

// Robust image generation with retry logic
const generateImageWithRetry = async (prompt: string, topic: string, maxRetries: number = 3): Promise<string> => {
  // First, test if we can access the AI client
  try {
    const ai = getAI();
    console.log('✅ AI client initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize AI client:', error);
    throw new Error(`API configuration error: ${error.message}`);
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Image generation attempt ${attempt}/${maxRetries} for: ${topic}`);
      console.log('Using prompt:', prompt);
      
      // The @google/genai library doesn't support generateImage method
      // Try Google AI Studio image generation first
      console.log('Using Google AI Studio image generation approach');
      
      const result = await generateImageViaRESTAPI(prompt);

      // Handle Google AI Studio response format
      if (result && result.candidates && result.candidates[0]) {
        const candidate = result.candidates[0];
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData && part.inlineData.data) {
              console.log(`✅ Successfully generated image on attempt ${attempt}`);
              return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            }
          }
        }
      } else if (result && result.image) {
        console.log(`✅ Successfully generated image on attempt ${attempt}`);
        return result.image;
      } else if (result && result.images && result.images[0]) {
        console.log(`✅ Successfully generated image on attempt ${attempt}`);
        return result.images[0];
      }
      
      console.error('Unexpected response format:', result);
      throw new Error('No image returned from Google AI Studio API');
      
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        status: error.status,
        details: error.details
      });
      
      if (attempt === maxRetries) {
        // Final attempt failed - try one more approach with standard Gemini
        console.error('🚨 All image generation attempts failed - trying standard Gemini model');
        console.error('Final error details:', error);
        
        try {
          // Try with standard Gemini model as last resort
          const fallbackResult = await getAI().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { 
              parts: [{ 
                text: `Create a detailed visual description for a PURE VISUAL educational diagram of ${topic}. 
                
                The original prompt was: ${prompt}
                
                CRITICAL REQUIREMENTS - The diagram must be:
                - COMPLETELY TEXT-FREE (no words, labels, numbers, or annotations)
                - NO arrows or callouts
                - NO written text anywhere
                - Pure visual representation only
                
                Provide a comprehensive description in this EXACT format:
                
                [Brief overview of what the diagram shows]
                
                1. [First key component or feature visible in the diagram - focus on what students should learn about it]
                2. [Second key component or feature visible in the diagram - focus on what students should learn about it]
                3. [Third key component or feature visible in the diagram - focus on what students should learn about it]
                4. [Fourth key component or feature visible in the diagram - focus on what students should learn about it]
                5. [Fifth key component or feature visible in the diagram - focus on what students should learn about it]
                
                Make each numbered point educational and specific to what students can see and learn from the visual diagram. Focus on key learning points that would be good for quiz questions.` 
              }] 
            },
            config: { 
              systemInstruction: "You are an expert educational content creator. Create detailed, engaging visual descriptions that help students understand complex concepts through diagrams. Focus on clarity, visual appeal, and educational value."
            }
          });

          const text = typeof (fallbackResult as any).text === 'function' ? (fallbackResult as any).text() : (fallbackResult as any).text;
          const description = typeof text === 'string' ? text : String(text ?? '');
          
          // Create a data URL with the description as an image
          return createDescriptionAsImage(description, topic);
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          return createDescriptionAsImage(`Educational diagram description for ${topic}. This would show the key components and relationships to help students understand the concept.`, topic);
        }
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  // This should never be reached due to the throw in the loop
  throw new Error('Unexpected error in image generation retry logic');
};

// Create optimized prompt for Imagen 4 (max 480 tokens)
const createOptimizedImagePrompt = (
  topic: string,
  type: string,
  complexity: string,
  userSettings: any
): string => {
  const gradeLevel = userSettings.grade || 'elementary';
  
  // Base prompt structure optimized for Imagen 4
  let prompt = `Educational diagram of ${topic}, `;
  
  // Add complexity and style
  if (complexity === 'beginner') {
    prompt += 'simple, clear, basic level, ';
  } else if (complexity === 'intermediate') {
    prompt += 'detailed, comprehensive, intermediate level, ';
  } else {
    prompt += 'advanced, detailed, comprehensive, ';
  }
  
  // Add visual style
  prompt += 'clean white background, professional medical/scientific illustration style, ';
  
  // Add educational elements
  prompt += 'clearly labeled parts, arrows pointing to key components, ';
  
  // Add colors
  prompt += 'vibrant colors to distinguish different parts, ';
  
  // Add specific elements based on topic
  if (topic.toLowerCase().includes('brain')) {
    prompt += 'showing different brain regions, neural pathways, ';
  } else if (topic.toLowerCase().includes('heart')) {
    prompt += 'showing chambers, valves, blood flow, ';
  } else if (topic.toLowerCase().includes('cell')) {
    prompt += 'showing organelles, cell membrane, nucleus, ';
  } else if (topic.toLowerCase().includes('solar')) {
    prompt += 'showing planets, sun, orbits, ';
  } else if (topic.toLowerCase().includes('water')) {
    prompt += 'showing evaporation, condensation, precipitation, ';
  }
  
  // Add final styling
  prompt += 'high quality, educational poster style, suitable for classroom use';
  
  // Ensure prompt is under 480 tokens (roughly 360 words)
  if (prompt.length > 2000) {
    prompt = prompt.substring(0, 2000) + '...';
  }
  
  return prompt;
};

// Generate educational description
const generateEducationalDescription = async (
  topic: string,
  type: string,
  complexity: string,
  userSettings: any
): Promise<{ description: string; labels: string[]; explanation: string }> => {
  try {
    const result = await getAI().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { 
        parts: [{ 
          text: `Create an educational description for a diagram of ${topic}. 
          
          Provide:
          1. A clear description of what the diagram shows
          2. Key labels and components to highlight
          3. Educational explanation suitable for ${userSettings.grade || 'elementary'} level
          
          Make it engaging and educational.` 
        }] 
      },
      config: { 
        systemInstruction: "You are an expert educational content creator. Provide clear, engaging descriptions that help students understand complex concepts through visual diagrams."
      }
    });

    const text = typeof (result as any).text === 'function' ? (result as any).text() : (result as any).text;
    const responseText = typeof text === 'string' ? text : String(text ?? '');
    
    return parseEducationalResponse(responseText, topic);
  } catch (error) {
    console.error('Error generating description:', error);
    // Return fallback description
    return {
      description: `This educational diagram shows the key components and structure of ${topic}.`,
      labels: ['Key Component 1', 'Key Component 2', 'Key Component 3'],
      explanation: `This diagram helps students understand how ${topic} works by showing the main parts and their relationships.`
    };
  }
};

// Parse educational response from Gemini
const parseEducationalResponse = (responseText: string, topic: string): { description: string; labels: string[]; explanation: string } => {
  // Clean up the response text
  const cleanText = responseText.replace(/\*\*/g, '').replace(/\*/g, '').trim();
  
  // Extract description (first meaningful sentence)
  const lines = cleanText.split('\n').filter(line => line.trim());
  const description = lines[0] || `Educational diagram showing the structure and components of ${topic}.`;
  
  // Extract labels with improved parsing
  const labels: string[] = [];
  
  // Look for numbered lists first
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.match(/^\d+\./)) {
      const label = trimmedLine.replace(/^\d+\.\s*/, '').trim();
      if (label && label.length > 5) { // Only include meaningful labels
        labels.push(label);
      }
    }
  });
  
  // If no numbered lists, look for bullet points
  if (labels.length === 0) {
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.match(/^[-*]/)) {
        const label = trimmedLine.replace(/^[-*]\s*/, '').trim();
        if (label && label.length > 5) {
          labels.push(label);
        }
      }
    });
  }
  
  // If still no labels, extract key sentences
  if (labels.length === 0) {
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 15);
    labels.push(...sentences.slice(0, 5).map(s => s.trim())); // Take first 5 meaningful sentences
  }
  
  // Clean up labels - remove any remaining formatting
  const cleanLabels = labels.map(label => {
    return label.replace(/^[:\-\s]+/, '').trim();
  }).filter(label => label.length > 0);
  
  // Extract explanation (remaining text)
  const explanation = lines.slice(1).join(' ').trim() || 
    `This diagram helps students understand the structure and function of ${topic} by clearly showing all the important components and their relationships.`;
  
  return { description, labels: cleanLabels, explanation };
};

const createImagePrompt = (
  topic: string,
  type: string,
  complexity: string,
  userSettings: any
): string => {
  const gradeLevel = userSettings.grade || 'elementary';
  
  let styleDescription = '';
  let detailLevel = '';
  
  switch (complexity) {
    case 'simple':
      styleDescription = 'simple, clean, cartoon-style';
      detailLevel = 'basic shapes and clear labels';
      break;
    case 'intermediate':
      styleDescription = 'detailed, educational, professional';
      detailLevel = 'moderate detail with clear labeling';
      break;
    case 'detailed':
      styleDescription = 'highly detailed, scientific, professional';
      detailLevel = 'comprehensive detail with extensive labeling';
      break;
  }
  
  let typeDescription = '';
  switch (type) {
    case 'anatomy':
      typeDescription = 'anatomical diagram showing internal structures';
      break;
    case 'process':
      typeDescription = 'process flow diagram with arrows and steps';
      break;
    case 'structure':
      typeDescription = 'structural diagram showing components and relationships';
      break;
    case 'concept':
      typeDescription = 'conceptual diagram illustrating key ideas';
      break;
  }
  
  return `Create a ${styleDescription} educational diagram of ${topic}. 
  This should be a ${typeDescription} with ${detailLevel}.
  Make it appropriate for ${gradeLevel} level students.
  Include clear labels, arrows where needed, and use colors to highlight important parts.
  The diagram should be clean, professional, and easy to understand.`;
};


const generatePlaceholderImage = async (topic: string, type: string, complexity: string): Promise<string> => {
  // This is a placeholder function. In a real implementation, you would:
  // 1. Use DALL-E API
  // 2. Use Midjourney API
  // 3. Use Stable Diffusion API
  // 4. Use another AI image generation service
  
  // For now, we'll create a data URL with a simple placeholder
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Create a gradient background
    const gradient = ctx.createLinearGradient(0, 0, 800, 600);
    gradient.addColorStop(0, '#f0f9ff');
    gradient.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);
    
    // Add title
    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(topic.toUpperCase(), 400, 80);
    
    // Add diagram placeholder
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.strokeRect(100, 150, 600, 350);
    
    // Add "AI Generated Diagram" text
    ctx.fillStyle = '#64748b';
    ctx.font = '20px Arial';
    ctx.fillText('AI Generated Educational Diagram', 400, 200);
    
    // Add complexity indicator
    ctx.fillStyle = '#059669';
    ctx.font = '16px Arial';
    ctx.fillText(`Complexity: ${complexity}`, 400, 250);
    
    // Add type indicator
    ctx.fillText(`Type: ${type}`, 400, 280);
    
    // Add note
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Arial';
    ctx.fillText('AI-Generated Educational Diagram', 400, 450);
    ctx.fillText('Generated using Google Imagen 4', 400, 470);
    ctx.fillText('Powered by Google AI', 400, 490);
  }
  
  return canvas.toDataURL('image/png');
};

const parseImageResponse = (response: string, topic: string, imageUrl: string): DiagramResponse => {
  // Extract information from the AI response
  const description = `Educational diagram of ${topic}`;
  
  // Generate labels based on the topic
  const labels = generateLabelsForTopic(topic);
  
  const explanation = `This educational diagram shows ${topic} in a clear, visual format that helps students understand the concept better. The diagram includes labeled components and uses visual elements to make learning more engaging and effective.`;
  
  return {
    imageUrl,
    description,
    labels,
    explanation
  };
};

const generateLabelsForTopic = (topic: string): string[] => {
  // Generate relevant labels based on the topic
  const topicLower = topic.toLowerCase();
  
  if (topicLower.includes('eye') || topicLower.includes('vision')) {
    return ['Cornea', 'Iris', 'Pupil', 'Lens', 'Retina', 'Optic Nerve'];
  } else if (topicLower.includes('heart') || topicLower.includes('cardiac')) {
    return ['Right Atrium', 'Left Atrium', 'Right Ventricle', 'Left Ventricle', 'Aorta', 'Pulmonary Artery'];
  } else if (topicLower.includes('brain') || topicLower.includes('cerebral')) {
    return ['Cerebrum', 'Cerebellum', 'Brain Stem', 'Frontal Lobe', 'Temporal Lobe', 'Occipital Lobe'];
  } else if (topicLower.includes('digestive') || topicLower.includes('stomach')) {
    return ['Mouth', 'Esophagus', 'Stomach', 'Small Intestine', 'Large Intestine', 'Liver', 'Pancreas'];
  } else if (topicLower.includes('water cycle') || topicLower.includes('hydrologic')) {
    return ['Evaporation', 'Condensation', 'Precipitation', 'Collection', 'Transpiration'];
  } else if (topicLower.includes('photosynthesis') || topicLower.includes('plant')) {
    return ['Sunlight', 'Chlorophyll', 'Carbon Dioxide', 'Water', 'Glucose', 'Oxygen'];
  } else if (topicLower.includes('cell') || topicLower.includes('cellular')) {
    return ['Cell Membrane', 'Nucleus', 'Cytoplasm', 'Mitochondria', 'Ribosomes', 'Endoplasmic Reticulum'];
  } else if (topicLower.includes('solar system') || topicLower.includes('planets')) {
    return ['Sun', 'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
  } else {
    return ['Main Component', 'Secondary Component', 'Key Feature', 'Important Element'];
  }
};

// Predefined diagram templates for common educational topics
export const diagramTemplates = {
  'digestive system': {
    type: 'anatomy' as const,
    complexity: 'intermediate' as const,
    description: 'Human digestive system showing the path of food from mouth to anus'
  },
  'brain anatomy': {
    type: 'anatomy' as const,
    complexity: 'detailed' as const,
    description: 'Human brain showing different regions and their functions'
  },
  'water cycle': {
    type: 'process' as const,
    complexity: 'simple' as const,
    description: 'Water cycle showing evaporation, condensation, and precipitation'
  },
  'photosynthesis': {
    type: 'process' as const,
    complexity: 'intermediate' as const,
    description: 'Photosynthesis process showing how plants convert sunlight to energy'
  },
  'solar system': {
    type: 'structure' as const,
    complexity: 'simple' as const,
    description: 'Solar system showing planets and their relative positions'
  },
  'cell structure': {
    type: 'structure' as const,
    complexity: 'intermediate' as const,
    description: 'Plant or animal cell showing organelles and their functions'
  },
  'food chain': {
    type: 'concept' as const,
    complexity: 'simple' as const,
    description: 'Food chain showing energy transfer between organisms'
  },
  'human heart': {
    type: 'anatomy' as const,
    complexity: 'intermediate' as const,
    description: 'Human heart showing chambers, valves, and blood flow'
  }
};

export const getSuggestedTopics = (): string[] => {
  return Object.keys(diagramTemplates);
};