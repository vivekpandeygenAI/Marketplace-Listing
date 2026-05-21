/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Search, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Image as ImageIcon, 
  AlertCircle,
  Copy,
  CheckCircle2,
  ChevronRight,
  BarChart3,
  Rocket,
  ArrowRight,
  Loader2,
  PieChart,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeProduct } from './lib/gemini';
import { AnalysisResult, ProfitBreakdown } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [brand, setBrand] = useState('');
  const [costPrice, setCostPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [profit, setProfit] = useState<ProfitBreakdown | null>(null);
  const [activeTab, setActiveTab] = useState<'insights' | 'listing' | 'profit' | 'visuals'>('insights');
  const [marketplace, setMarketplace] = useState<'Flipkart' | 'Meesho'>('Flipkart');
  const [visuals, setVisuals] = useState<{ branding?: string; model?: string; closeup?: string }>({});
  const [generatingVisual, setGeneratingVisual] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateProfit = (sellingPrice: number, cost: number, platform: 'Flipkart' | 'Meesho'): ProfitBreakdown => {
    let platformFee = 0;
    let gst = sellingPrice * 0.12; // 12% GST
    let logisticsFee = 60;

    if (platform === 'Flipkart') {
      platformFee = sellingPrice * 0.15; // 15% marketplace fee
    } else {
      platformFee = 0; // Meesho often has 0% commission
      logisticsFee = 45; // Typically lower shipping
    }

    const netProfit = sellingPrice - cost - platformFee - gst - logisticsFee;
    const marginPercentage = (netProfit / sellingPrice) * 100;

    return {
      marketplace: platform,
      sellingPrice,
      costPrice: cost,
      platformFee,
      logisticsFee,
      gst,
      netProfit,
      marginPercentage
    };
  };

  const handleSaveDraft = () => {
    alert('Draft saved to your local workspace! (Simulated)');
  };

  const handleGenerateAll = () => {
    if (!analysis) return;
    alert('Generating listing, high-res lifestyle visuals, and pricing sheets... (Simulated)');
  };

  const handlePushMarketplace = () => {
    if (!profit) return;
    alert(`Pushing listing for "${brand}" to ${marketplace} inventories at ₹${profit.sellingPrice}... (Simulated)`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ... inside runAnalysis, reset visuals
  const runAnalysis = async () => {
    if (!image || !brand || costPrice <= 0) return;
    setLoading(true);
    setVisuals({}); // Reset
    try {
      const result = await analyzeProduct(image, brand, costPrice);
      setAnalysis(result);
      setProfit(calculateProfit(result.suggestedPrice, costPrice, marketplace));
      setActiveTab('insights');
    } catch (error) {
      console.error(error);
      alert('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const [genProgress, setGenProgress] = useState(0);

  const generateVisuals = async () => {
    if (!analysis || !image) return;
    setGeneratingVisual(true);
    setGenProgress(0);

    // Simulate multi-stage AI generation
    const stages = [10, 35, 60, 85, 100];
    for (const p of stages) {
      await new Promise(resolve => setTimeout(resolve, 400));
      setGenProgress(p);
    }

    setVisuals({
      branding: image,
      model: image,
      closeup: image
    });
    setGeneratingVisual(false);
  };

  useEffect(() => {
    if (analysis) {
      setProfit(calculateProfit(analysis.suggestedPrice, costPrice, marketplace));
    }
  }, [marketplace]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex bg-slate-50 text-slate-900 font-sans min-h-screen md:h-screen md:overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      {/* Sidebar Navigation - Hidden on mobile */}
      <aside className="hidden md:flex w-56 bg-slate-900 text-white flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-xs">AI</div>
            <span>ResellIntel</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 text-sm">
          <div className="p-2 bg-slate-800 rounded text-white cursor-pointer flex items-center gap-2">
            <FileText className="w-4 h-4" /> Listing Generator
          </div>
          <div className="p-2 text-slate-400 hover:text-white cursor-pointer flex items-center gap-2">
            <Search className="w-4 h-4" /> Market Insights
          </div>
          <div className="p-2 text-slate-400 hover:text-white cursor-pointer flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Inventory Health
          </div>
          <div className="p-2 text-slate-400 hover:text-white cursor-pointer flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Competitor Tracker
          </div>
        </nav>
        <div className="p-6 text-xs border-t border-slate-800 opacity-50">
          v2.4.0 Build 9812
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen md:h-full md:overflow-hidden">
        {/* Header Bar */}
        <header className="h-auto md:h-16 bg-white border-b border-slate-200 px-4 md:px-8 py-4 md:py-0 flex flex-col md:flex-row md:items-center justify-between shrink-0 gap-4">
          <div className="flex items-center gap-2">
            <div className="md:hidden w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold leading-none">RI</div>
            <h1 className="font-semibold text-slate-800 whitespace-nowrap">Marketplace Listing</h1>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={handleSaveDraft}
              className="flex-1 md:flex-none px-4 py-2 border border-slate-300 rounded text-xs md:text-sm hover:bg-slate-50 font-medium transition-colors"
            >
              Save Draft
            </button>
            <button 
              onClick={handleGenerateAll}
              className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white rounded text-xs md:text-sm hover:bg-blue-700 font-medium transition-all shadow-sm"
            >
              Generate Assets
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 flex-1 overflow-y-auto">
          
          {/* Input Panel (Left) */}
          <section className="col-span-1 md:col-span-4 space-y-4 md:space-y-6 flex flex-col">
            <div className="professional-card p-4 md:p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Input Data</h3>
              <div className="space-y-4">
                <div>
                  <label className="label-text">Product Image</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "w-full h-32 md:h-40 border-2 border-dashed border-slate-200 rounded flex flex-col items-center justify-center bg-slate-50 cursor-pointer overflow-hidden group hover:border-blue-500/50 transition-all",
                      image && "border-none"
                    )}
                  >
                    {image ? (
                      <img src={image} className="w-full h-full object-cover" alt="Product" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-slate-300 mb-2" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Upload Item photo</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      className="hidden" 
                      accept="image/*" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">Brand</label>
                    <input 
                      type="text" 
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="input-field" 
                      placeholder="Ethnix"
                    />
                  </div>
                  <div>
                    <label className="label-text">Cost (₹)</label>
                    <input 
                      type="number" 
                      value={costPrice || ''}
                      onChange={(e) => setCostPrice(Number(e.target.value))}
                      className="input-field" 
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <button 
                  onClick={runAnalysis}
                  disabled={loading || !image || !brand || costPrice <= 0}
                  className="w-full py-3 bg-slate-800 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-slate-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Run Intelligence'}
                </button>
              </div>
            </div>

            <div className="professional-card p-4 md:p-5 flex-1 flex flex-col space-y-4">
              <div className="flex justify-between items-center shrink-0">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Market Intelligence</h3>
                <div className="flex bg-slate-100 p-0.5 rounded-md">
                  {(['Flipkart', 'Meesho'] as const).map(p => (
                    <button 
                      key={p}
                      onClick={() => setMarketplace(p)}
                      className={cn(
                        "px-2 py-0.5 text-[8px] font-black uppercase rounded transition-all",
                        marketplace === p ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              {analysis ? (
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">{marketplace} Demand</span>
                    <span className={cn(
                      "font-bold px-2 py-0.5 rounded",
                      analysis.marketInsights.demandLevel === 'High' ? "text-green-600 bg-green-50" : "text-yellow-600 bg-yellow-50"
                    )}>{analysis.marketInsights.demandLevel}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Avg. Competitor Price</span>
                    <span className="font-bold text-slate-800">{analysis.marketInsights.competitorPriceRange}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Market Sentiment</span>
                      <span className="text-blue-600">74% Positive</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full w-[74%]"></div>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded text-[10px] text-blue-800 leading-relaxed font-medium">
                    Your suggested price of ₹{analysis.suggestedPrice} is perfectly positioned for high-velocity sales.
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 px-2 py-8">
                   <TrendingUp className="w-6 h-6 mb-2 text-slate-400" />
                   <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Analysis Engine Offline</p>
                </div>
              )}
            </div>
          </section>

          {/* Output Panel (Right) */}
          <section className="col-span-1 md:col-span-8 flex flex-col space-y-4 md:space-y-6 pb-6 md:pb-0">
            <AnimatePresence mode="wait">
              {analysis ? (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col flex-1 space-y-4 md:space-y-6"
                >
                  {/* Generated Content Card */}
                  <div className="professional-card flex flex-col flex-1 overflow-hidden">
                    <div className="p-3 md:p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                      <div className="flex items-center gap-3">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Optimized Listing</h3>
                        <div className="flex bg-slate-100 p-0.5 rounded-md">
                          {(['Flipkart', 'Meesho'] as const).map(p => (
                            <button 
                              key={p}
                              onClick={() => setMarketplace(p)}
                              className={cn(
                                "px-3 py-1 text-[9px] font-black uppercase rounded transition-all",
                                marketplace === p ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"
                              )}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-4 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                        {(['insights', 'listing', 'visuals'] as const).map((tab) => (
                           <button
                             key={tab}
                             onClick={() => setActiveTab(tab)}
                             className={cn(
                               "text-[10px] font-bold uppercase tracking-wider transition-all block py-1 whitespace-nowrap",
                               activeTab === tab 
                                 ? "text-blue-600 border-b-2 border-blue-600" 
                                 : "text-slate-400 hover:text-slate-600"
                             )}
                           >
                             {tab}
                           </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 md:p-5 flex-1 md:overflow-y-auto">
                      <AnimatePresence mode="wait">
                        {activeTab === 'listing' && (
                          <motion.div 
                            key="listing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4"
                          >
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Product Title ({marketplace})</label>
                              <div className="text-xs md:text-sm font-semibold p-2.5 bg-slate-50 border border-slate-100 rounded mt-1.5 text-slate-800 leading-snug">
                                {analysis.productTitle}
                              </div>
                            </div>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Key Features</label>
                                <ul className="text-[10px] md:text-[11px] space-y-1.5 mt-2 text-slate-700 leading-tight list-disc pl-4">
                                  {analysis.bulletPoints.map((point, i) => (
                                    <li key={i}>{point}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">SEO Context ({marketplace})</label>
                                <p className="text-[10px] md:text-[11px] text-slate-600 leading-snug font-medium italic">
                                  {marketplace === 'Meesho' 
                                    ? "Optimized for Meesho's non-branded search algorithm favoring high-quality visuals and budget-conscious descriptions."
                                    : "Optimized for Flipkart's brand-centric search favoring rich descriptions and high-intent keywords."}
                                </p>
                                <p className="text-[10px] md:text-[11px] text-slate-500 leading-relaxed border-l-2 pl-3">
                                  {analysis.description}
                                </p>
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {analysis.seoKeywords.slice(0, 5).map((kw, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-slate-100 text-[8px] font-bold text-slate-500 rounded uppercase tracking-tighter">#{kw}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {activeTab === 'insights' && (
                          <motion.div 
                            key="insights"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                          >
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                               <div className="space-y-4">
                                 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                   <TrendingUp className="w-3 h-3 text-blue-500" /> {marketplace} Intelligence
                                 </h4>
                                 <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                                    <p className="text-[11px] text-slate-600 leading-relaxed italic">
                                      {marketplace === 'Meesho' 
                                        ? "Direct-to-consumer search trends indicate high interest in high-utility, low-cost variations. Price sensitivity is 2.5x higher than premium platforms."
                                        : "Flipkart shoppers are showing a 40% uptick in brand searches within this category. Loyalty-driven conversions are peaking."}
                                    </p>
                                 </div>
                                 <div className="flex flex-wrap gap-1.5">
                                  {analysis.marketInsights.trendingKeywords.map((tag, i) => (
                                    <span key={i} className="px-2 py-1 bg-white text-slate-500 text-[9px] font-bold rounded border border-slate-100 uppercase">
                                      {tag}
                                    </span>
                                  ))}
                                 </div>
                               </div>
                               <div className="space-y-3">
                                 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                   <AlertCircle className="w-3 h-3 text-amber-500" /> Logistics & Risks
                                 </h4>
                                 <ul className="space-y-2">
                                  {analysis.marketInsights.riskFactors.map((risk, i) => (
                                    <li key={i} className="text-[10px] text-slate-500 flex items-start gap-2 leading-tight">
                                      <div className="w-1 h-1 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                                      {risk}
                                    </li>
                                  ))}
                                 </ul>
                               </div>
                             </div>
                          </motion.div>
                        )}

                        {activeTab === 'visuals' && (
                          <motion.div 
                            key="visuals"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6 py-2"
                          >
                            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="space-y-1">
                                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Nano-G Image Engine</h4>
                                  <p className="text-[10px] text-slate-500">Generating hyper-realistic branded, model-wear, and clarify shots.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                  {generatingVisual && (
                                    <div className="flex flex-col items-end gap-1">
                                       <span className="text-[10px] font-bold text-blue-600">{genProgress}%</span>
                                       <div className="w-24 h-1 bg-slate-200 rounded-full overflow-hidden">
                                          <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${genProgress}%` }} />
                                       </div>
                                    </div>
                                  )}
                                  <button 
                                    onClick={generateVisuals}
                                    disabled={generatingVisual}
                                    className="shrink-0 px-5 py-2 bg-slate-900 text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50"
                                  >
                                    {generatingVisual ? 'Processing...' : 'Run Image Engine'}
                                  </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                              {[
                                { id: 'branding', label: 'Branded Commercial', icon: ShoppingBag, prompt: analysis.visualPrompts.branding },
                                { id: 'model', label: 'Model Lifestyle', icon: ImageIcon, prompt: analysis.visualPrompts.model },
                                { id: 'closeup', label: 'Macro Clarity', icon: Search, prompt: analysis.visualPrompts.closeup }
                              ].map((item) => (
                                <div key={item.id} className="space-y-3">
                                   <div className={cn(
                                     "aspect-[3/4] bg-white border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center relative group shadow-sm transition-all",
                                     generatingVisual && "opacity-50"
                                   )}>
                                    {(visuals as any)[item.id] ? (
                                      <div className="relative w-full h-full overflow-hidden">
                                        <img 
                                          src={(visuals as any)[item.id]} 
                                          className={cn(
                                            "w-full h-full object-cover transition-transform duration-1000",
                                            item.id === 'closeup' && "scale-150 transform hover:scale-[1.7]",
                                            item.id === 'model' && "saturate-[1.05] brightness-[1.02]"
                                          )} 
                                          alt={item.label} 
                                        />
                                        
                                        {/* Dynamic Overlays */}
                                        {item.id === 'branding' && (
                                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                             <div className="bg-white/90 backdrop-blur-sm border border-slate-200 px-4 py-1.5 rounded shadow-lg transform -rotate-12 translate-y-12">
                                                <span className="text-[10px] font-black tracking-[0.2em] text-slate-900 uppercase">{brand}</span>
                                             </div>
                                          </div>
                                        )}
                                        
                                        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/40 backdrop-blur-md rounded text-[7px] font-bold text-white uppercase tracking-widest">
                                          {item.label}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-center opacity-30 p-8 space-y-2">
                                        <item.icon className="w-8 h-8 mx-auto text-slate-300" />
                                        <p className="text-[9px] font-bold uppercase tracking-widest leading-none">Slot Ready</p>
                                      </div>
                                    )}
                                    
                                    {generatingVisual && (
                                      <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
                                         <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="px-1 space-y-1">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{item.id} Logic</p>
                                    <p className="text-[9px] text-slate-500 font-medium italic leading-tight line-clamp-2">
                                      {item.prompt}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Profit Engine Footer Card */}
                  {profit && (
                    <div className="bg-slate-900 rounded-xl shadow-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-6 md:gap-8">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Suggested MSRP</p>
                            <div className="flex bg-slate-800 p-0.5 rounded">
                              {(['Flipkart', 'Meesho'] as const).map(p => (
                                <button 
                                  key={p}
                                  onClick={() => setMarketplace(p)}
                                  className={cn(
                                    "px-2 py-0.5 text-[7px] font-black uppercase rounded transition-all",
                                    marketplace === p ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-300"
                                  )}
                                >
                                  {p}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-baseline gap-2">
                             <h2 className="text-2xl font-bold text-white tracking-tight">₹{profit.sellingPrice}</h2>
                             <span className="text-[10px] text-blue-400 font-bold">OPTIMIZED</span>
                          </div>
                        </div>
                        <div className="hidden sm:block h-8 w-px bg-slate-800"></div>
                        <div className="space-y-2">
                          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Fee Breakdown</p>
                          <div className="flex flex-wrap gap-4">
                            <div className="text-[10px] text-slate-400">Comm: <span className="text-slate-100 font-semibold">₹{profit.platformFee.toFixed(0)}</span></div>
                            <div className="text-[10px] text-slate-400">GST: <span className="text-slate-100 font-semibold">₹{profit.gst.toFixed(0)}</span></div>
                            <div className="text-[10px] text-slate-400">Ship: <span className="text-slate-100 font-semibold">₹{profit.logisticsFee}</span></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row md:flex-col justify-between items-end gap-2 border-t border-slate-800 pt-4 md:border-none md:pt-0">
                        <div className="text-left md:text-right">
                          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Net Margin</p>
                          <div className="flex items-baseline md:justify-end gap-1">
                            <h2 className="text-xl font-bold text-green-400 tracking-tight">₹{profit.netProfit.toFixed(0)}</h2>
                            <span className="text-xs text-slate-400 font-medium">({profit.marginPercentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                        <button 
                          onClick={handlePushMarketplace}
                          className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-5 py-2 rounded uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20"
                        >
                          Push to {profit.marketplace}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 text-center bg-white/50 border-2 border-dashed border-slate-200 rounded-2xl mb-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
                    <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 text-slate-200" />
                  </div>
                  <div className="max-w-xs space-y-3">
                    <h2 className="text-base md:text-lg font-bold text-slate-800">Ready for Intelligence</h2>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      Upload your product image and enter basic details to unlock AI-powered listings and pricing strategies.
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </section>

        </div>
      </main>
    </div>
  );
}

