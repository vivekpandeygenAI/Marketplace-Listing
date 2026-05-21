/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AnalysisResult {
  productTitle: string;
  category: string;
  description: string;
  bulletPoints: string[];
  suggestedPrice: number;
  marketInsights: {
    demandLevel: 'Low' | 'Medium' | 'High';
    competitorPriceRange: string;
    trendingKeywords: string[];
    riskFactors: string[];
  };
  seoKeywords: string[];
  visualPrompts: {
    branding: string;
    model: string;
    closeup: string;
  };
}

export interface ProfitBreakdown {
  marketplace: 'Flipkart' | 'Meesho';
  sellingPrice: number;
  costPrice: number;
  platformFee: number;
  logisticsFee: number;
  gst: number;
  netProfit: number;
  marginPercentage: number;
}
