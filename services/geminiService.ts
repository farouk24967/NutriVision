import { GoogleGenAI, Type, Chat } from "@google/genai";
import { UserProfile, WeeklyPlan, QuizQuestion } from "../types";
import { v4 as uuidv4 } from 'uuid';

// Initialize Gemini Client
// NOTE: In a production environment, ensure process.env.API_KEY is strictly handled.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeFoodImage = async (base64Image: string): Promise<any> => {
  try {
    const modelId = 'gemini-2.5-flash'; 
    
    // Remove header if present (data:image/jpeg;base64,)
    const base64Data = base64Image.split(',')[1];

    const prompt = `
      Analyze this image and identify the food items present. 
      Estimate the portion size and nutritional content for the entire visible dish.
      Return the result in JSON format with the following structure:
      {
        "name": "Name of the dish or main food item",
        "portionSize": "Estimated portion (e.g., 1 bowl, 200g)",
        "confidence": 0.95,
        "calories": 500,
        "protein": 30,
        "carbs": 60,
        "fats": 15,
        "analysis": "Short description of what was detected"
      }
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming JPEG for simplicity from camera/upload
              data: base64Data
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            portionSize: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fats: { type: Type.NUMBER },
            analysis: { type: Type.STRING },
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No text response from Gemini");

  } catch (error) {
    console.error("Error analyzing food:", error);
    throw error;
  }
};

export const generatePersonalizedPlan = async (profile: UserProfile): Promise<WeeklyPlan> => {
  try {
    // Calculate BMI for AI Context
    // Formula: kg / m^2
    const heightM = profile.height / 100;
    const bmi = (profile.weight / (heightM * heightM)).toFixed(1);

    const prompt = `
      You are an expert nutritionist AI. Generate a highly personalized 7-day meal plan (Monday to Sunday) for a user with the following biometrics:
      
      - Age: ${profile.age}
      - Height: ${profile.height} cm
      - Weight: ${profile.weight} kg
      - Activity Level: ${profile.activityLevel}
      - Calculated BMI: ${bmi}
      - Stated Goal: ${profile.goal}

      CRITICAL LOGIC TO APPLY:
      1. If BMI < 18: The user is Underweight. Create a CALORIC SURPLUS plan focused on Muscle Gain & Recovery. High protein, complex carbs.
      2. If BMI > 20: The user is indicated for Weight Loss (based on user preference logic). Create a CALORIC DEFICIT plan. High protein, high volume vegetables, controlled fats/carbs.
      3. Otherwise: Focus on maintenance and healthy habits.

      REQUIREMENTS:
      - Generate a plan for exactly 7 days (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday).
      - For EACH day, provide 4 meals: Breakfast, Lunch, Dinner, Snack.
      - Ensure nutritional values (Calories, Protein, Carbs, Fats) are accurate and aligned with the goal.
      - Variety is key. Do not repeat the exact same meals every day.

      Return strictly JSON fitting this schema.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            week: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  meals: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        mealType: { type: Type.STRING },
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        nutrients: {
                          type: Type.OBJECT,
                          properties: {
                            calories: { type: Type.NUMBER },
                            protein: { type: Type.NUMBER },
                            carbs: { type: Type.NUMBER },
                            fats: { type: Type.NUMBER }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      // Ensure we return the correct structure even if the LLM wraps it oddly
      return data.week ? data : { week: [] };
    }
    throw new Error("Failed to generate plan");

  } catch (error) {
    console.error("Error generating plan:", error);
    throw error;
  }
};

export const generateDailyQuiz = async (): Promise<QuizQuestion> => {
  try {
    const prompt = `
      Generate a single multiple-choice question about nutrition, healthy eating, or fitness science.
      Provide 4 options, 1 correct answer (index 0-3), and a short explanation.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.NUMBER },
            explanation: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) {
        const data = JSON.parse(response.text);
        return {
            id: uuidv4(),
            ...data
        };
    }
    throw new Error("Failed to generate quiz");
  } catch (error) {
    console.error("Quiz Error", error);
    // Fallback quiz
    return {
        id: 'fallback',
        question: 'Which macronutrient is the body\'s primary source of energy?',
        options: ['Protein', 'Carbohydrates', 'Fats', 'Water'],
        correctAnswer: 1,
        explanation: 'Carbohydrates are broken down into glucose, which is the main energy source for the body\'s cells.'
    };
  }
};

// Chat Capabilities
let chatSession: Chat | null = null;

export const sendMessageToChatBot = async (message: string, profile: UserProfile): Promise<string> => {
  try {
    if (!chatSession) {
      // Calculate BMI for Context
      const heightM = profile.height / 100;
      const bmi = (profile.weight / (heightM * heightM)).toFixed(1);

      chatSession = ai.chats.create({
        model: 'gemini-3-pro-preview', // Using the advanced model for complex reasoning
        config: {
          systemInstruction: `
            You are "NutriVision Chatbot", a specialized AI assistant for the NutriVision app.
            
            YOUR CONTEXT:
            - The user is ${profile.name}, Age: ${profile.age}, Weight: ${profile.weight}kg, Goal: ${profile.goal}.
            - Calculated BMI: ${bmi}.
            
            YOUR RULES:
            1. ONLY answer questions related to Nutrition, Fitness, Diet, Health, and the Features of the NutriVision App (Scanner, Meal Planner, Dashboard).
            2. If the user asks about politics, coding (outside the app), celebrities, or general off-topic items, politely refuse and steer the conversation back to health.
            3. Be encouraging, empathetic, and professional.
            4. Keep answers concise but helpful.
            5. Use the user's data (Goal/BMI) to tailor your advice.
          `
        }
      });
    }

    const response = await chatSession.sendMessage({ message });
    return response.text || "I'm sorry, I couldn't generate a response.";

  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm having trouble connecting to the server. Please try again.";
  }
};

export const resetChatSession = () => {
    chatSession = null;
};