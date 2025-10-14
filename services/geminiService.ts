import { GoogleGenAI, Type } from "@google/genai";
// FIX: Import the ChessGame type.
import { type StressLog, type WellnessActivity, type ChatMessage, type SleepLog, type EventLog, type PeerChatMessage, type ChatSettings, type AdminDashboardData, type AdminInsights, type ImageAnalysisResult, type BurnoutPredictionResult, type CognitiveTwinAnalysis, type EmotionForecast, type DreamAnalysis, type CalmSpaceImage, type ConversationSummary, type CalmTale, type StoryCategory, type ChessGame } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 64,
  responseMimeType: "application/json",
};

/**
 * A robust function to parse JSON from a Gemini response,
 * which might be wrapped in markdown code fences or have leading/trailing text.
 * @param text The raw text from the Gemini response.
 * @returns The parsed JSON object.
 */
const cleanAndParseJson = (text: string): any => {
    let cleanedText = text.trim();
    
    // Most common case: model wraps JSON in markdown code block ```json ... ```
    const jsonMatch = cleanedText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
        cleanedText = jsonMatch[1];
    }
    
    // Fallback for cases where the model might return raw JSON with surrounding text.
    // We'll find the first '{' or '[' and the last '}' or ']' to extract the JSON object/array.
    const firstBracket = cleanedText.search(/[[{]/);
    const lastBracket = cleanedText.search(/[\}\]]$/); // find the last one at the end of the string
    if (firstBracket !== -1 && lastBracket > firstBracket) {
        try {
            const potentialJson = cleanedText.substring(firstBracket, lastBracket + 1);
            return JSON.parse(potentialJson);
        } catch (e) {
            // If parsing the substring fails, we'll fall through and try to parse the whole string.
            console.warn("Parsing extracted JSON substring failed, trying full text.", e);
        }
    }
    
    // Final attempt: parse the whole string, assuming it's clean JSON.
    return JSON.parse(cleanedText);
};


const commandSchema = {
    type: Type.OBJECT,
    properties: {
        command: {
            type: Type.STRING,
            description: "The command to execute. One of: LOG_STRESS, LOG_SLEEP, LOG_EVENT, ANALYZE_BURNOUT, GET_TREND_REPORT, WELLNESS_ACTIVITY, ROLEPLAY_THERAPIST, GENERAL_CHAT.",
        },
        payload: {
            type: Type.OBJECT,
            properties: {
                level: { type: Type.NUMBER, description: "Stress level from 1-10."},
                hours: { type: Type.NUMBER, description: "Hours of sleep."},
                description: { type: Type.STRING, description: "Description of an event or wellness activity."},
                period: { type: Type.STRING, description: "Time period for analysis, e.g., 'last 7 days'."},
            },
        },
        commentary: {
            type: Type.STRING,
            description: "Your conversational text response to the user. This is what will be displayed in the chat.",
        },
    },
    required: ["command", "commentary"],
};


export const processUserPrompt = async (
    prompt: string,
    chatHistory: ChatMessage[],
    chatSettings: ChatSettings,
    stressLogs: StressLog[],
    sleepLogs: SleepLog[],
    eventLogs: EventLog[],
    wellnessActivities: WellnessActivity[]
) => {
    try {
        const systemInstruction = `You are 'Aura', a compassionate AI wellness assistant from AURA WELLNESS, and a Cognitive Digital Twin for healthcare professionals.
        Your goal is to help users monitor stress, understand their cognitive patterns, and prevent burnout.
        You are a multilingual assistant. If the user speaks in a different language, especially Indian languages like Kannada, Hindi, Tamil, or Telugu, you must understand and respond in that same language.
        Your personality is currently set to: ${chatSettings.personality}.
        Your tone should be: ${chatSettings.tone}.
        Your responses should be: ${chatSettings.verbosity}.

        CRITICAL SAFETY RULE: If the user's message contains any indication of self-harm, severe distress, or crisis (e.g., "I want to die", "I can't go on"), your *only* response MUST be a JSON object with command 'GENERAL_CHAT' and this exact commentary: 'It sounds like you are going through a lot right now. Please know there is help available. You can connect with people who can support you by calling or texting 988 in the US and Canada, or calling 111 in the UK, anytime. These services are free, confidential, and available 24/7. Please reach out to them.' Do not say anything else or attempt to give advice.

        Analyze user prompts to identify commands and respond in JSON format.
        Available commands: LOG_STRESS, LOG_SLEEP, LOG_EVENT, ANALYZE_BURNOUT, GET_TREND_REPORT, WELLNESS_ACTIVITY, ROLEPLAY_THERAPIST, GENERAL_CHAT.
        
        If you detect a cognitive distortion in the user's language (e.g., all-or-nothing thinking, catastrophizing), gently offer a reframing perspective in your commentary without being preachy. This is part of your role as a cognitive companion.

        Current user data context (most recent 5):
        - Stress Logs: ${JSON.stringify(stressLogs.slice(-5))}
        - Sleep Logs: ${JSON.stringify(sleepLogs.slice(-5))}
        - Event Logs: ${JSON.stringify(eventLogs.slice(-5))}
        - Wellness Activities: ${JSON.stringify(wellnessActivities.slice(-5))}

        When logging data, confirm the action in your commentary.
        When asked for burnout risk (e.g., "what's my burnout risk?"), use the ANALYZE_BURNOUT command. Analyze the provided data context (high stress, low sleep, stressful events) to assess the risk (e.g., low, moderate, high). Your commentary should provide the analysis and actionable, preventative advice.
        For general chat or therapy roleplay, be empathetic and supportive. If you are unsure, default to GENERAL_CHAT.
        
        Example 1: User says "log my stress as 5/10"
        Your response: {"command": "LOG_STRESS", "payload": {"level": 5}, "commentary": "Got it. I've logged your stress level at 5 out of 10. Remember to take a deep breath."}
        
        Example 2: User says "I messed everything up today, I'm a total failure."
        Your response: {"command": "GENERAL_CHAT", "commentary": "It sounds like today was really tough, and it's understandable to feel that way when things go wrong. But saying you're a 'total failure' might be an example of all-or-nothing thinking. Is it possible that while you made a mistake, you also did some things well today? Let's talk about it."}
        `;

        const historyForModel = chatHistory.map(msg => ({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        }));

        const contents = [...historyForModel, { role: 'user', parts: [{ text: prompt }] }];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                ...generationConfig,
                systemInstruction,
                responseSchema: commandSchema,
            },
        });
        
        return cleanAndParseJson(response.text);

    } catch (error) {
        console.error("Error processing user prompt:", error);
        return {
            command: 'GENERAL_CHAT',
            commentary: "I'm having a little trouble connecting right now. Please try again in a moment.",
        };
    }
};

export const getIntervention = async (type: 'breathing' | 'mindfulness' | 'challenge') => {
    let prompt: string;
    switch(type) {
        case 'breathing':
            prompt = "Provide a 2-minute guided breathing exercise for stress relief. Structure it in simple, numbered steps.";
            break;
        case 'mindfulness':
            prompt = "Suggest a quick and simple mindfulness activity that a busy healthcare professional can do in under 3 minutes. Provide clear instructions.";
            break;
        case 'challenge':
            prompt = "Generate a simple, actionable wellness challenge for today for a healthcare worker. For example: 'Drink a full glass of water every 2 hours' or 'Take 5 minutes to stretch'. Be creative and encouraging.";
            break;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching intervention:", error);
        return "Sorry, I couldn't fetch an activity right now. Try taking a few slow, deep breaths.";
    }
};

export const getPositivePrompt = async (type: 'quote' | 'gratitude') => {
    const prompt = type === 'quote' 
        ? "Give me a short, uplifting, and inspirational quote. The quote should be about resilience, hope, or self-compassion. Keep it to one or two sentences."
        : "Give me a simple, one-sentence gratitude prompt to help me reflect on the positive aspects of my day. For example: 'What is one thing that made you smile today?'";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 0.9 }
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching positive prompt:", error);
        return "Take a deep breath and remember that you are doing your best. That is enough.";
    }
};

export const getStressPrediction = async (humidity: number, temperature: number, stepCount: number) => {
    try {
        const systemInstruction = `You are a predictive AI model simulating a Random Forest classifier trained on the 'Stress-Lysis' dataset for healthcare workers.
        Your task is to predict the stress level based on environmental and activity data.
        The stress levels are categorized as: 0 (Low Stress), 1 (Medium Stress), 2 (High Stress).
        
        Analyze the following inputs and predict the stress level. Provide your prediction in a JSON format.
        - High humidity and high temperature generally increase stress.
        - A very low step count might indicate fatigue or being overwhelmed, contributing to stress. A moderate to high step count is generally positive.
        - Temperature is in Fahrenheit.

        Based on the inputs, return a JSON object with two keys:
        1. "prediction": An integer (0, 1, or 2).
        2. "explanation": A brief, one or two-sentence explanation for your prediction, tailored to a healthcare worker.
        
        Example Input: humidity=20, temperature=89, step_count=120
        Example Output: {"prediction": 2, "explanation": "The high temperature combined with a very low step count suggests a physically static, high-pressure environment, indicating a high stress level."}
        `;

        const prompt = `Predict the stress level for the following data: Humidity=${humidity}%, Temperature=${temperature}°F, Step count=${stepCount}.`;

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                prediction: { type: Type.NUMBER, description: "The predicted stress level: 0, 1, or 2." },
                explanation: { type: Type.STRING, description: "A brief explanation of the prediction." },
            },
            required: ["prediction", "explanation"],
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                ...generationConfig,
                systemInstruction,
                responseSchema,
            },
        });

        return cleanAndParseJson(response.text);

    } catch (error) {
        console.error("Error getting stress prediction:", error);
        return {
            prediction: -1, // Use -1 to indicate an error
            explanation: "I'm having a little trouble running the prediction right now. Please try again in a moment.",
        };
    }
};

export const getStressInsights = async (
    stressLogs: StressLog[],
    sleepLogs: SleepLog[],
    eventLogs: EventLog[]
): Promise<{ summary: string; insight: string }> => {
    if (stressLogs.length < 2) {
        return {
            summary: "More data needed for analysis.",
            insight: "Keep logging your stress and sleep daily to unlock personalized insights.",
        };
    }
    try {
        const systemInstruction = `You are an AI wellness analyst for 'AURA WELLNESS', a health app. Analyze the provided JSON data of a healthcare professional's recent stress logs, sleep logs, and significant work events. Your goal is to identify patterns and provide a supportive, actionable insight. Respond in a JSON object with 'summary' and 'insight' keys.
    - summary: A concise, 1-2 sentence summary of their recent stress patterns. (e.g., 'Your stress levels seem to spike after days with logged emergencies and low sleep.')
    - insight: One positive, forward-looking piece of advice. (e.g., 'Consider a brief 5-minute mindfulness exercise on days you log an emergency to help decompress.')
    - Keep the tone professional, empathetic, and concise.`;

        const prompt = `Here is the user's recent wellness data (last 10 entries): 
        Stress: ${JSON.stringify(stressLogs.slice(-10))} 
        Sleep: ${JSON.stringify(sleepLogs.slice(-10))} 
        Events: ${JSON.stringify(eventLogs.slice(-10))} 
        
        Please provide your analysis.`;

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                summary: { type: Type.STRING, description: "A concise summary of stress patterns." },
                insight: { type: Type.STRING, description: "One actionable, positive insight." },
            },
            required: ["summary", "insight"],
        };
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                ...generationConfig,
                systemInstruction,
                responseSchema,
            },
        });

        return cleanAndParseJson(response.text);

    } catch (error) {
        console.error("Error getting stress insights:", error);
        return {
            summary: "Could not analyze trends at this moment.",
            insight: "There was an issue connecting to the AI. Please try again later.",
        };
    }
};


export const getPeerReply = async (
  prompt: string,
  chatHistory: PeerChatMessage[]
): Promise<string> => {
  try {
    const systemInstruction = `You are roleplaying as an empathetic and supportive healthcare professional in a peer-to-peer support chat.
    Your persona is a colleague who understands the unique pressures of the medical field.
    - Be understanding, not clinical.
    - Offer encouragement and validation.
    - Share brief, relatable (but fictional) anecdotes if appropriate.
    - Ask open-ended questions to encourage conversation.
    - Keep your responses concise and conversational, like a text message.
    - Do not offer medical advice. Focus on emotional and professional support.
    - Do not break character or mention you are an AI.
    `;
    
    const historyForModel = chatHistory.map(msg => ({
        role: msg.role === 'peer' ? 'model' : 'user',
        parts: [{ text: msg.text }]
    }));
    
    const contents = [...historyForModel, { role: 'user', parts: [{ text: prompt }] }];

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            temperature: 0.8,
            topP: 0.95,
            topK: 64,
            systemInstruction,
        },
    });

    return response.text;

  } catch (error) {
    console.error("Error getting peer reply:", error);
    return "Sorry, I'm a bit swamped right now. Let's talk in a bit.";
  }
};

export const translateMedicalText = async (
    text: string,
    sourceLang: string,
    targetLang: string,
    simplify: boolean
): Promise<string> => {
    try {
        const systemInstruction = simplify
            ? `You are an expert medical translator. Translate the following text from ${sourceLang} to ${targetLang}. The target audience is a patient, so simplify complex medical terminology to a 5th-grade reading level. Maintain the core medical meaning.`
            : `You are an expert medical translator. Accurately translate the following medical text from ${sourceLang} to ${targetLang}. Preserve the original medical terminology.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Translate this: "${text}"`,
            config: {
                temperature: 0.3,
                systemInstruction,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error translating text:", error);
        return "Sorry, I was unable to perform the translation at this time.";
    }
};

export const analyzeImageContent = async (base64ImageData: string): Promise<ImageAnalysisResult> => {
    try {
        const systemInstruction = `You are an AI assistant for healthcare professionals. Analyze the provided image, which could be a medical document, prescription label, or product packaging. 
        - Provide a concise summary of the key information in the 'analysis' field.
        - Identify important text blocks or sections and return their bounding box coordinates in the 'detectedRegions' field. Coordinates must be percentages.
        - If no clear text or important regions are found, return an empty 'detectedRegions' array.
        `;
        
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64ImageData,
            },
        };

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                analysis: {
                    type: Type.STRING,
                    description: "A concise summary of the key information in the image.",
                },
                detectedRegions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            x: { type: Type.NUMBER },
                            y: { type: Type.NUMBER },
                            width: { type: Type.NUMBER },
                            height: { type: Type.NUMBER },
                        },
                        required: ["x", "y", "width", "height"],
                    },
                },
            },
            required: ["analysis", "detectedRegions"],
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart] },
            config: {
                ...generationConfig,
                systemInstruction,
                responseSchema,
            },
        });

        return cleanAndParseJson(response.text);

    } catch (error) {
        console.error("Error analyzing image:", error);
        return { analysis: "Sorry, I couldn't analyze the image right now.", detectedRegions: [] };
    }
};

export const summarizeConversation = async (messages: ChatMessage[]): Promise<ConversationSummary> => {
    try {
        const conversationText = messages.map(m => `${m.role}: ${m.text}`).join('\n');
        const systemInstruction = `You are a conversation summarization expert. Analyze the following conversation and extract the key information.
        Respond in JSON format with three keys: 'title', 'keyTakeaways', and 'actionItems'.
        - 'title': A short, descriptive title for the conversation.
        - 'keyTakeaways': An array of strings, each being a main point or conclusion from the chat.
        - 'actionItems': An array of strings, each being a clear, actionable task for the user. If there are no action items, return an empty array.
        `;
        const prompt = `Summarize this conversation:\n\n${conversationText}`;

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                keyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
                actionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["title", "keyTakeaways", "actionItems"],
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                ...generationConfig,
                systemInstruction,
                responseSchema,
            },
        });

        return cleanAndParseJson(response.text);

    } catch (error) {
        console.error("Error summarizing conversation:", error);
        return {
            title: "Summary Unavailable",
            keyTakeaways: ["There was an error generating the summary."],
            actionItems: [],
        };
    }
};

export const getCognitiveTwinAnalysis = async (
    stressLogs: StressLog[],
    sleepLogs: SleepLog[],
    eventLogs: EventLog[]
): Promise<CognitiveTwinAnalysis> => {
    try {
        const systemInstruction = `You are a 'Cognitive Digital Twin' AI for healthcare professionals. Analyze the user's recent data to create a psychological and behavioral profile.
        Respond in a JSON object.
        - personalitySummary: A 2-3 sentence summary of their likely personality based on their logs (e.g., resilient, conscientious but prone to overthinking).
        - cognitiveTraits: An array of 2-3 key cognitive traits observed (e.g., 'Pattern Recognition', 'High Attentional Control'). For each trait, provide a 'trait' and a 'description'.
        - emotionalPatterns: An array of 2-3 recurring emotional patterns (e.g., 'Post-Incident Stress', 'Anticipatory Anxiety'). For each pattern, provide a 'pattern' and an 'explanation'.
        - anomaly: A string describing any significant deviation from their baseline pattern in the last 48 hours. If none, this should be null.
        `;
        const prompt = `Analyze this data:
        - Stress Logs (last 10): ${JSON.stringify(stressLogs.slice(-10))}
        - Sleep Logs (last 10): ${JSON.stringify(sleepLogs.slice(-10))}
        - Event Logs (last 5): ${JSON.stringify(eventLogs.slice(-5))}`;

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                personalitySummary: { type: Type.STRING },
                cognitiveTraits: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { trait: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["trait", "description"] } },
                emotionalPatterns: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { pattern: { type: Type.STRING }, explanation: { type: Type.STRING } }, required: ["pattern", "explanation"] } },
                anomaly: { type: Type.STRING, nullable: true },
            },
            required: ["personalitySummary", "cognitiveTraits", "emotionalPatterns", "anomaly"],
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                ...generationConfig,
                systemInstruction,
                responseSchema,
            },
        });
        
        return cleanAndParseJson(response.text);

    } catch (error) {
        console.error("Error getting cognitive twin analysis:", error);
        return {
            personalitySummary: "Analysis is temporarily unavailable due to high server traffic. Please try again later.",
            cognitiveTraits: [],
            emotionalPatterns: [],
            anomaly: null,
        };
    }
};

export const getEmotionForecast = async (data: {
    stressLogs: StressLog[],
    sleepLogs: SleepLog[],
    eventLogs: EventLog[]
}): Promise<EmotionForecast[]> => {
    try {
        const systemInstruction = `You are a predictive wellness AI. Based on the user's historical stress, sleep, and event data, forecast their likely stress level (0-100) for the next 24 hours in 3-hour intervals.
        - Consider patterns: Does low sleep lead to high stress the next day? Do certain events have a lagging effect?
        - Return an array of 8 JSON objects, one for each 3-hour block from the current time.
        - Each object must have two keys: 'time' (e.g., '3PM', '6PM', '9PM', '12AM', '3AM', '6AM', '9AM', '12PM') and 'stress' (a number between 0 and 100).
        `;
        const prompt = `User data for forecasting:
        - Stress Logs (last 10): ${JSON.stringify(data.stressLogs.slice(-10))}
        - Sleep Logs (last 10): ${JSON.stringify(data.sleepLogs.slice(-10))}
        - Event Logs (last 5): ${JSON.stringify(data.eventLogs.slice(-5))}`;

        const responseSchema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    time: { type: Type.STRING },
                    stress: { type: Type.NUMBER },
                },
                required: ["time", "stress"],
            },
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                ...generationConfig,
                systemInstruction,
                responseSchema,
            },
        });
        
        return cleanAndParseJson(response.text);

    } catch (error) {
        console.error("Error getting emotion forecast:", error);
        // Return an empty array to indicate failure. The frontend will show an empty chart.
        return [];
    }
};

export const getBurnoutPrediction = async (
    workHours: number,
    avgHeartRate: number,
    patientsSeen: number,
    sleepHours: number
): Promise<BurnoutPredictionResult> => {
    try {
        const systemInstruction = `You are a burnout risk prediction model for healthcare workers.
        Analyze the provided data to predict a burnout risk percentage and identify the key contributing factors using XAI principles.
        - High work hours, high heart rate, and high patient load increase risk.
        - High sleep hours decrease risk.
        - Respond with a JSON object.
        - riskPercentage: A number from 0 to 100.
        - factors: An array of objects, each with 'name' and 'contribution' (a percentage). The contributions must sum to 100.
          Factor names must be one of: 'High Workload', 'Physiological Strain', 'Patient Load', 'Poor Recovery'.
        `;
        const prompt = `Predict burnout risk for: workHours=${workHours}, avgHeartRate=${avgHeartRate}, patientsSeen=${patientsSeen}, sleepHours=${sleepHours}.`;

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                riskPercentage: { type: Type.NUMBER },
                factors: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            contribution: { type: Type.NUMBER },
                        },
                        required: ["name", "contribution"],
                    },
                },
            },
            required: ["riskPercentage", "factors"],
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                ...generationConfig,
                systemInstruction,
                responseSchema,
            },
        });
        
        return cleanAndParseJson(response.text);

    } catch (error) {
        console.error("Error getting burnout prediction:", error);
        return {
            riskPercentage: -1,
            factors: [],
        };
    }
};

export const analyzeDream = async (dreamText: string): Promise<DreamAnalysis> => {
    try {
        const systemInstruction = `You are a dream analyst AI trained in symbolic interpretation and psychology. Analyze the user's dream description.
        Respond in a JSON object.
        - summary: A brief, one-paragraph summary of the dream's narrative.
        - themes: An array of key themes or symbols. For each, provide a 'theme' name and its potential 'relevance' to a healthcare worker's life.
        - interpretation: A thoughtful, supportive interpretation of what the dream might signify, avoiding definitive statements and using phrases like 'This could suggest...' or 'It might reflect...'.
        `;
        const prompt = `Dream description: "${dreamText}"`;

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                summary: { type: Type.STRING },
                themes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { theme: { type: Type.STRING }, relevance: { type: Type.STRING } }, required: ["theme", "relevance"] } },
                interpretation: { type: Type.STRING },
            },
            required: ["summary", "themes", "interpretation"],
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                ...generationConfig,
                systemInstruction,
                responseSchema,
            },
        });
        
        return cleanAndParseJson(response.text);

    } catch (error) {
        console.error("Error analyzing dream:", error);
        return {
            summary: "Could not analyze the dream at this time.",
            themes: [],
            interpretation: "There was an error connecting to the AI. Please try again later.",
        };
    }
};

export const generateCalmSpaceImage = async (): Promise<CalmSpaceImage> => {
    try {
        // First, generate a creative prompt for the image
        const promptGenResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Generate a single, short, visually descriptive prompt for an AI image generator to create a serene and calming abstract image. The prompt should be creative and evocative. For example: "A tranquil watercolor painting of a misty forest at dawn, with soft light filtering through the trees." or "An abstract digital art piece of flowing pastel colors, like a gentle river of light."',
        });
        const imagePrompt = promptGenResponse.text.trim().replace(/"/g, ''); // Clean up the prompt

        // Second, generate the image using the created prompt
        const imageResponse = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: imagePrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
            return {
                base64Image: imageResponse.generatedImages[0].image.imageBytes,
                prompt: imagePrompt,
            };
        } else {
            throw new Error("No image was generated.");
        }
    } catch (error) {
        console.error("Error generating calm space image:", error);
        return {
            base64Image: '', 
            prompt: 'A serene landscape as a fallback.'
        };
    }
};

export const generateCalmTales = async (category: StoryCategory): Promise<CalmTale[]> => {
    try {
        const systemInstruction = `You are an AI storyteller. Your task is to generate a collection of 5 unique, short, uplifting stories for an app called 'Tale Library'. Each story should be under 200 words. The stories must fit the category: "${category}".

        For each story, you must provide:
        - id: A unique string identifier.
        - title: A short, catchy title.
        - author: A fictional, friendly-sounding author name.
        - quote: A short, memorable quote from the story.
        - content: The full story text, with paragraphs separated by newline characters (\\n).
        - coverColor1: A calming hex color code for a gradient background.
        - coverColor2: A second calming hex color code for the gradient.
        - moods: An array of 1-2 relevant moods from this list: 'Calm', 'Funny', 'Motivating', 'Wholesome'.

        Respond with a JSON object containing a single key "stories" which is an array of these 5 story objects. Do not include any other text or markdown.
        `;

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                stories: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            author: { type: Type.STRING },
                            quote: { type: Type.STRING },
                            content: { type: Type.STRING },
                            coverColor1: { type: Type.STRING },
                            coverColor2: { type: Type.STRING },
                            moods: { type: Type.ARRAY, items: { type: Type.STRING } },
                        },
                        required: ["id", "title", "author", "quote", "content", "coverColor1", "coverColor2", "moods"],
                    },
                },
            },
            required: ["stories"],
        };
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate 5 stories for the category: ${category}`,
            config: {
                ...generationConfig,
                systemInstruction,
                responseSchema,
            },
        });
        
        const parsedJson = cleanAndParseJson(response.text);
        return parsedJson.stories;

    } catch (error) {
        console.error("Error generating calm tales:", error);
        return []; // Return an empty array on error
    }
};

// FIX: Add getChessMove function for Mindful Chess mini-game.
export const getChessMove = async (fen: string, userMove: string | null): Promise<{ chessGame: ChessGame }> => {
    try {
        const systemInstruction = `You are an AI chess engine and mindfulness coach. Your name is 'Zen'. You play at an intermediate level (around 1600 ELO).
        You will be given a FEN string for the current board state and an optional user move in UCI format.
        Your task is to validate the user's move (if provided), make your own move as Black, and return the new game state in a JSON object.

        RULES:
        1. If 'userMove' is null, it's the start of the game. Just return the initial state with legal moves for White.
        2. If 'userMove' is provided, first apply it to the board. Then, decide on your move as Black.
        3. After your move, determine the game status ('In Progress', 'Check', 'Checkmate', 'Stalemate', 'Draw').
        4. Provide all legal moves for the next turn (White's turn).
        5. Include a 'moodBoostMessage' - a short, encouraging, chess-related mindfulness tip.
        6. If the user's last move was very good or tricky, you can provide a 'hint' for White's next turn.
        7. If the game ends, provide a 'gameEndMessage'.

        JSON RESPONSE SCHEMA:
        - status: 'In Progress', 'Check', 'Checkmate', 'Stalemate', or 'Draw'.
        - boardFEN: The FEN string *before* your move (after the user's move is applied).
        - updatedBoardFEN: The FEN string *after* your move.
        - legalMoves: An array of all legal moves for White in UCI format.
        - turn: Always 'White' after your move.
        - gameEndMessage: A message if the game is over, otherwise null.
        - aiMove: Your move in UCI format (e.g., 'e7e5'), otherwise null.
        - moodBoostMessage: A short, encouraging message.
        - hint: A helpful hint for White if appropriate, otherwise null.
        `;
        
        const prompt = `Current FEN: ${fen}\nUser's move (White): ${userMove || 'N/A'}`;

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                status: { type: Type.STRING },
                boardFEN: { type: Type.STRING },
                updatedBoardFEN: { type: Type.STRING },
                legalMoves: { type: Type.ARRAY, items: { type: Type.STRING } },
                turn: { type: Type.STRING },
                gameEndMessage: { type: Type.STRING, nullable: true },
                aiMove: { type: Type.STRING, nullable: true },
                moodBoostMessage: { type: Type.STRING },
                hint: { type: Type.STRING, nullable: true },
            },
            required: ["status", "boardFEN", "updatedBoardFEN", "legalMoves", "turn", "gameEndMessage", "aiMove", "moodBoostMessage", "hint"],
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                ...generationConfig,
                temperature: 0.4,
                systemInstruction,
                responseSchema,
            },
        });

        const chessGame: ChessGame = cleanAndParseJson(response.text);
        return { chessGame };

    } catch (error) {
        console.error("Error getting chess move:", error);
        return {
            chessGame: {
                status: 'Draw',
                boardFEN: fen,
                updatedBoardFEN: fen,
                legalMoves: [],
                turn: 'White',
                gameEndMessage: "An error occurred with the AI opponent. The game is a draw.",
                aiMove: null,
                moodBoostMessage: "Even the best plans can go awry. Let's start a new game.",
                hint: null,
            }
        };
    }
};
