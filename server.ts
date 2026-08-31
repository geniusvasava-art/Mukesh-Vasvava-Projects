import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { jsonrepair } from 'jsonrepair';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Generous limit for high-res webcam snapshot uploads
app.use(express.json({ limit: '30mb' }));

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || 'dummy-key',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

/**
 * Robust JSON parser that handles markdown formatting, unescaped quotes,
 * truncated strings, and structural syntax issues using jsonrepair.
 */
function safeParseJson(rawText: string): any {
  if (!rawText || !rawText.trim()) {
    throw new Error('Empty response received from AI model');
  }

  let cleaned = rawText.trim();
  // Strip markdown backtick codeblocks if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  // 1. Try standard native JSON.parse
  try {
    return JSON.parse(cleaned);
  } catch (err1) {
    // 2. Try jsonrepair on the cleaned text
    try {
      const repaired = jsonrepair(cleaned);
      return JSON.parse(repaired);
    } catch (err2) {
      // 3. Try isolating the outermost JSON object bounds
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const sliced = cleaned.substring(firstBrace, lastBrace + 1);
        try {
          const repairedSlice = jsonrepair(sliced);
          return JSON.parse(repairedSlice);
        } catch (err3) {
          console.warn('JSON Repair fallback failed:', err3);
        }
      }
      throw new Error(`Failed to parse AI nutrition response: ${(err1 as any)?.message || 'Invalid JSON syntax'}`);
    }
  }
}

/**
 * Robust Gemini caller with exponential backoff and fallback models
 * to handle transient 503 (High Demand / UNAVAILABLE) or 429 errors seamlessly.
 */
async function generateContentWithResilience(
  ai: GoogleGenAI,
  primaryParams: any,
  maxRetriesPerModel = 2
): Promise<any> {
  const modelsToTry = [
    primaryParams.model || 'gemini-3.7-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
  ];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    for (let attempt = 1; attempt <= maxRetriesPerModel; attempt++) {
      try {
        const response = await ai.models.generateContent({
          ...primaryParams,
          model: modelName,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isUnavailable =
          err?.status === 503 ||
          err?.code === 503 ||
          err?.status === 429 ||
          err?.code === 429 ||
          errMsg.includes('503') ||
          errMsg.includes('high demand') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('Resource has been exhausted');

        console.warn(
          `[Gemini API] Model '${modelName}' (attempt ${attempt}/${maxRetriesPerModel}) encountered: ${errMsg}`
        );

        if (isUnavailable && attempt < maxRetriesPerModel) {
          // Quick jittered delay before retry
          const delay = 600 * attempt + Math.random() * 300;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        // If unavailable on this model, switch to next model immediately for fastest user response
        break;
      }
    }
  }

  throw lastError;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Food Analysis Endpoint using Gemini 3.7 Flash Multimodal Vision
app.post('/api/analyze-food', async (req, res) => {
  try {
    const { image, notes, referenceScale } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Extract base64 and mime type
    let base64Data = image;
    let mimeType = 'image/jpeg';

    if (image.startsWith('data:')) {
      const match = image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }
    }

    const ai = getGeminiClient();

    const prompt = `You are a certified Clinical Nutritionist and Computer Vision Food Portion Specialist for PC/Desktop users.
Analyze this food photograph or webcam snapshot in detail.

User context & extra notes: "${notes || 'No extra notes provided.'}"
Reference scale or plate guide used: "${referenceScale || 'Standard 9-10 inch dinner plate / desktop camera framing'}".

Perform the following:
1. Identify all distinct food components/items on the plate/meal.
2. Estimate the visual portion size and realistic weight in grams (considering plate dimensions, density, depth, thickness, and standard serving sizes).
3. Calculate precise nutritional values per item and the entire meal (Calories kcal, Protein g, Total Carbs g, Fat g, Fiber g, Sugar g, Saturated Fat g, Sodium mg).
4. Provide estimated bounding boxes (in percentages: top 0-100, left 0-100, width 0-100, height 0-100) indicating where each food item is located on the image.
5. Provide a Health Rating (Score 1-10, NutriGrade A/B/C/D/E, Glycemic Index Low/Medium/High, Calorie Density classification, key positive nutritional benefits, and nutritional areas of concern).
6. Provide at least 3-5 SPECIFIC, HIGHLY PRACTICAL, ACTIONABLE LOW-CALORIE REDUCTION SUGGESTIONS ("How we reduce calories"):
   - Ingredient swaps (e.g. Greek yogurt for mayo, cauliflower rice blend, low-calorie cheese).
   - Cooking technique modifications (e.g. air-fry vs deep-fry, oil spray vs free pour, pan-searing with parchment).
   - Portion rebalancing (e.g. 50/25/25 rule, cutting dense starches while increasing voluminous greens).
   - Sauce/dressing modifications (e.g. light vinaigrette, dressing on the side, vinegar/mustard bases).
   - Calculate EXACT calorie savings (e.g. -140 kcal), fat saved, and flavor impact for each suggestion.
7. Design a complete "Reduced Calorie Meal Preset" (After AI Reduction) showing how much total calories can be saved (e.g. saving 300-600 kcal) while preserving satiety, protein, and great taste.

Format requirements: Return strictly valid JSON matching the schema. Avoid unescaped double quotes inside text values (e.g., write '9-inch' instead of '9"').`;

    const response = await generateContentWithResilience(ai, {
      model: 'gemini-3.7-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        systemInstruction:
          'You are an expert AI Food Portion & Nutrition Analysis Engine. Always output accurate, scientifically backed nutritional estimates in strict JSON format. Never hallucinate unrealistic values. Provide realistic, delicious calorie reduction strategies.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mealName: { type: Type.STRING, description: 'Descriptive title of the meal' },
            overallDescription: { type: Type.STRING, description: 'Summary of the meal and culinary composition' },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  category: {
                    type: Type.STRING,
                    enum: ['protein', 'carbohydrate', 'vegetable', 'fruit', 'dairy', 'fat_oil', 'sauce', 'beverage', 'snack_dessert', 'composite'],
                  },
                  estimatedWeightGrams: { type: Type.NUMBER },
                  servingDescription: { type: Type.STRING },
                  confidenceScore: { type: Type.NUMBER },
                  macros: {
                    type: Type.OBJECT,
                    properties: {
                      calories: { type: Type.NUMBER },
                      proteinGrams: { type: Type.NUMBER },
                      carbsGrams: { type: Type.NUMBER },
                      fatGrams: { type: Type.NUMBER },
                      fiberGrams: { type: Type.NUMBER },
                      sugarGrams: { type: Type.NUMBER },
                      saturatedFatGrams: { type: Type.NUMBER },
                      sodiumMg: { type: Type.NUMBER },
                    },
                    required: ['calories', 'proteinGrams', 'carbsGrams', 'fatGrams'],
                  },
                  per100g: {
                    type: Type.OBJECT,
                    properties: {
                      calories: { type: Type.NUMBER },
                      proteinGrams: { type: Type.NUMBER },
                      carbsGrams: { type: Type.NUMBER },
                      fatGrams: { type: Type.NUMBER },
                      fiberGrams: { type: Type.NUMBER },
                      sugarGrams: { type: Type.NUMBER },
                      saturatedFatGrams: { type: Type.NUMBER },
                      sodiumMg: { type: Type.NUMBER },
                    },
                    required: ['calories', 'proteinGrams', 'carbsGrams', 'fatGrams'],
                  },
                  boundingBox: {
                    type: Type.OBJECT,
                    properties: {
                      top: { type: Type.NUMBER },
                      left: { type: Type.NUMBER },
                      width: { type: Type.NUMBER },
                      height: { type: Type.NUMBER },
                    },
                  },
                  notes: { type: Type.STRING },
                },
                required: ['id', 'name', 'category', 'estimatedWeightGrams', 'servingDescription', 'confidenceScore', 'macros', 'per100g'],
              },
            },
            totalMacros: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.NUMBER },
                proteinGrams: { type: Type.NUMBER },
                carbsGrams: { type: Type.NUMBER },
                fatGrams: { type: Type.NUMBER },
                fiberGrams: { type: Type.NUMBER },
                sugarGrams: { type: Type.NUMBER },
                saturatedFatGrams: { type: Type.NUMBER },
                sodiumMg: { type: Type.NUMBER },
              },
              required: ['calories', 'proteinGrams', 'carbsGrams', 'fatGrams'],
            },
            healthRating: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                nutriGrade: { type: Type.STRING, enum: ['A', 'B', 'C', 'D', 'E'] },
                glycemicIndex: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                calorieDensity: {
                  type: Type.STRING,
                  enum: ['Low (<1.5 kcal/g)', 'Moderate (1.5-3 kcal/g)', 'High (3-5 kcal/g)', 'Very High (>5 kcal/g)'],
                },
                positives: { type: Type.ARRAY, items: { type: Type.STRING } },
                concerns: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['score', 'nutriGrade', 'glycemicIndex', 'calorieDensity', 'positives', 'concerns'],
            },
            reductionSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  category: {
                    type: Type.STRING,
                    enum: ['ingredient_swap', 'portion_tweak', 'cooking_method', 'side_swap', 'sauce_modifier', 'smart_removal'],
                  },
                  caloriesSaved: { type: Type.NUMBER },
                  fatSavedGrams: { type: Type.NUMBER },
                  carbsSavedGrams: { type: Type.NUMBER },
                  sugarSavedGrams: { type: Type.NUMBER },
                  proteinDifferenceGrams: { type: Type.NUMBER },
                  explanation: { type: Type.STRING },
                  howToApply: { type: Type.STRING },
                  flavorImpact: {
                    type: Type.STRING,
                    enum: ['Virtually identical', 'Mild difference', 'Fresh & crisp twist', 'Rich & lighter'],
                  },
                  difficulty: { type: Type.STRING, enum: ['Super Easy', 'Quick Swap', 'Cooking Adjustment'] },
                },
                required: ['id', 'title', 'category', 'caloriesSaved', 'explanation', 'howToApply', 'flavorImpact', 'difficulty'],
              },
            },
            reducedPreset: {
              type: Type.OBJECT,
              properties: {
                recipeTitle: { type: Type.STRING },
                summary: { type: Type.STRING },
                totalCalories: { type: Type.NUMBER },
                originalCalories: { type: Type.NUMBER },
                calorieSavingsTotal: { type: Type.NUMBER },
                percentageSaved: { type: Type.NUMBER },
                macros: {
                  type: Type.OBJECT,
                  properties: {
                    calories: { type: Type.NUMBER },
                    proteinGrams: { type: Type.NUMBER },
                    carbsGrams: { type: Type.NUMBER },
                    fatGrams: { type: Type.NUMBER },
                    fiberGrams: { type: Type.NUMBER },
                  },
                  required: ['calories', 'proteinGrams', 'carbsGrams', 'fatGrams'],
                },
                keyTechniques: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['recipeTitle', 'summary', 'totalCalories', 'originalCalories', 'calorieSavingsTotal', 'percentageSaved', 'macros', 'keyTechniques'],
            },
            portionEstimateNotes: { type: Type.STRING },
          },
          required: ['mealName', 'overallDescription', 'items', 'totalMacros', 'healthRating', 'reductionSuggestions', 'reducedPreset', 'portionEstimateNotes'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('No text response returned from Gemini API');
    }

    const parsed = safeParseJson(text);
    // Attach client id, timestamp, original weights and applied flags
    const result = {
      ...parsed,
      id: 'scan-' + Date.now(),
      timestamp: new Date().toISOString(),
      items: (parsed.items || []).map((item: any, idx: number) => ({
        ...item,
        id: item.id || `item-${idx + 1}`,
        originalWeightGrams: item.estimatedWeightGrams || 100,
        originalMacros: { ...item.macros },
      })),
      reductionSuggestions: (parsed.reductionSuggestions || []).map((s: any, idx: number) => ({
        ...s,
        id: s.id || `swap-${idx + 1}`,
        applied: false,
      })),
    };

    res.json(result);
  } catch (error: any) {
    console.error('Error analyzing food:', error);
    res.status(500).json({
      error: error.message || 'Failed to analyze food image with Gemini AI',
    });
  }
});

// Nutritionist Q&A Assistant endpoint
app.post('/api/ask-nutritionist', async (req, res) => {
  try {
    const { question, mealContext } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const ai = getGeminiClient();

    const prompt = `You are an elite Clinical Nutritionist and Chef specializing in smart calorie reduction and portion control.
Current Meal Context:
${JSON.stringify(mealContext || {}, null, 2)}

User Question:
"${question}"

Provide a concise, practical, empowering answer (2-4 paragraphs or structured bullet points). Include exact actionable swaps, portion guidance, or cooking tips if relevant. Keep tone warm, encouraging, and science-backed.`;

    const response = await generateContentWithResilience(ai, {
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a warm, knowledgeable nutrition coach helping users make sustainable, delicious low-calorie choices without feeling deprived.',
      },
    });

    res.json({ answer: response.text });
  } catch (error: any) {
    console.error('Error answering nutrition question:', error);
    res.status(500).json({
      error: error.message || 'Failed to get nutritionist response',
    });
  }
});

// Setup Vite development middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CalorieDetect AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
