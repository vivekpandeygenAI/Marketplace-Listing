/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

export async function analyzeProduct(
  imageData: string, 
  brand: string, 
  costPrice: number
): Promise<AnalysisResult> {
  const model = "gemini-3.1-pro-preview"; // Use Pro for complex reasoning and search context
  
  const prompt = `
    Analyze this product image for a reseller on Meesho and Flipkart in India.
    Brand name provided: ${brand}
    Cost price (Seller's cost): ₹${costPrice}
    
    Tasks:
    1. Identify the product category and specific type.
    2. Suggest a click-magnet title optimized for Flipkart and Meesho SEO.
    3. Generate 5-6 high-converting bullet points.
    4. Write a detailed SEO-friendly description.
    5. Research (based on internal knowledge of Indian marketplaces) typical competitor pricing.
    6. Suggest an optimal selling price for maximum conversion vs profit.
    7. Provide market insights (Demand level, Trending keywords).
    8. List extraction keywords for search optimization.
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: [
      {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: imageData.split(',')[1] } },
          { text: prompt }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productTitle: { type: Type.STRING },
          category: { type: Type.STRING },
          description: { type: Type.STRING },
          bulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestedPrice: { type: Type.NUMBER },
          marketInsights: {
            type: Type.OBJECT,
            properties: {
              demandLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
              competitorPriceRange: { type: Type.STRING },
              trendingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              riskFactors: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["demandLevel", "competitorPriceRange", "trendingKeywords", "riskFactors"]
          },
          seoKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          visualPrompts: {
            type: Type.OBJECT,
            properties: {
              branding: { type: Type.STRING, description: "Prompt for a high-dimension, studio-lit commercial shot. Focus on lighting, shadows, and premium brand placement." },
              model: { type: Type.STRING, description: "Prompt for a fashion/lifestyle shot. Describe a human model wearing or using the product in a relevant high-end environment (e.g., urban street, luxury interior)." },
              closeup: { type: Type.STRING, description: "Prompt for a macro closeup. Focus on material texture, stitching, fabric weave, or technical finish for clarity." }
            },
            required: ["branding", "model", "closeup"]
          }
        },
        required: ["productTitle", "category", "description", "bulletPoints", "suggestedPrice", "marketInsights", "seoKeywords", "visualPrompts"]
      }
    }
  });

  return JSON.parse(response.text || "{}") as AnalysisResult;
}
