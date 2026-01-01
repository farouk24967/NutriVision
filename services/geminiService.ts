import { GoogleGenerativeAI, ChatSession } from "@google/generative-ai";
import { UserProfile, WeeklyPlan, QuizQuestion } from "../types";
import { v4 as uuidv4 } from 'uuid';

// Initialize Gemini Client
// NOTE: In a production environment, ensure process.env.API_KEY is strictly handled.
const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const analyzeFoodImage = async (base64Image: string): Promise<any> => {
  if (!ai) {
    // Mock response for demo
    return {
      name: "Sample Food",
      portionSize: "200g",
      confidence: 0.8,
      calories: 250,
      protein: 10,
      carbs: 30,
      fats: 8,
      analysis: "Mock analysis - API key not configured"
    };
  }
  try {
    const model = ai.getGenerativeModel({ 
      model: 'gemini-1.5-flash'
    });
    
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

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    return JSON.parse(text);

  } catch (error) {
    console.error("Error analyzing food:", error);
    throw error;
  }
};

export const generatePersonalizedPlan = async (profile: UserProfile): Promise<WeeklyPlan> => {
  if (!ai) {
    // Mock plan for demo
    return { week: [] };
  }
  try {
    // Calculate BMI for AI Context
    // Formula: kg / m^2
    const heightM = profile.height / 100;
    const bmi = (profile.weight / (heightM * heightM)).toFixed(1);

    const model = ai.getGenerativeModel({ 
      model: 'gemini-1.5-flash'
    });

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

      Return strictly JSON with a "week" array containing the 7 days.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const data = JSON.parse(text);
    // Ensure we return the correct structure even if the LLM wraps it oddly
    return data.week ? data : { week: [] };

  } catch (error) {
    console.error("Error generating plan:", error);
    throw error;
  }
};

export const generateDailyQuiz = async (): Promise<QuizQuestion> => {
  if (!ai) {
    // Fallback quiz
    return {
        id: 'fallback',
        question: 'Which macronutrient is the body\'s primary source of energy?',
        options: ['Protein', 'Carbohydrates', 'Fats', 'Water'],
        correctAnswer: 1,
        explanation: 'Carbohydrates are broken down into glucose, which is the main energy source for the body\'s cells.'
    };
  }
  try {
    const model = ai.getGenerativeModel({ 
      model: 'gemini-1.5-flash'
    });

    const prompt = `
      Generate a single multiple-choice question about nutrition, healthy eating, or fitness science.
      Provide 4 options, 1 correct answer (index 0-3), and a short explanation.
      Return JSON with question, options array, correctAnswer number, explanation.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const data = JSON.parse(text);
    return {
        id: uuidv4(),
        ...data
    };

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
let chatSession: ChatSession | null = null;

export const sendMessageToChatBot = async (message: string, profile: UserProfile): Promise<string> => {
  if (!ai) {
    return "API key not configured. Please set your GEMINI_API_KEY.";
  }
  try {
    if (!chatSession) {
      // Calculate BMI for Context
      const heightM = profile.height / 100;
      const bmi = (profile.weight / (heightM * heightM)).toFixed(1);

      const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      chatSession = model.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });
    }

    const result = await chatSession.sendMessage(message);
    const response = await result.response;
    return response.text() || "I'm sorry, I couldn't generate a response.";

  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm having trouble connecting to the server. Please try again.";
  }
};

export const resetChatSession = () => {
    chatSession = null;
};