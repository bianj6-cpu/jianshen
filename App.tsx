import React, { useState, useCallback } from 'react';
import ConfigPanel from './components/ConfigPanel';
import CourseInput from './components/CourseInput';
import ResultTable from './components/ResultTable';
import { AppConfig, CourseItem } from './types';
import { 
  DEFAULT_CONFIG, 
  getShotCN, 
  getGenderCN, 
  getNationalityCN, 
  getAtmosphereCN, 
  getLightCN, 
  getCameraCN, 
  getArtDirectionCN,
  getSceneCN 
} from './constants';
import { deduceActionFromCourse, generateImageFromPrompt } from './services/geminiService';
import { Aperture } from 'lucide-react';

export default function App() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [courseItems, setCourseItems] = useState<CourseItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleConfigChange = (key: keyof AppConfig, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev, [key]: value };
      if (courseItems.length > 0) {
        regeneratePromptsWithNewConfig(newConfig);
      }
      return newConfig;
    });
  };

  const generatePromptString = (action: string, cfg: AppConfig): string => {
    const shot = getShotCN(cfg.shot);
    const nationality = getNationalityCN(cfg.nationality);
    const gender = getGenderCN(cfg.gender);
    const artDirection = getArtDirectionCN(cfg.artDirection);
    const atmosphere = getAtmosphereCN(cfg.atmosphere);
    const light = getLightCN(cfg.light);
    const scene = getSceneCN(cfg.scene);
    const camera = getCameraCN(cfg.camera);

    return `${shot}，${nationality}${gender}健身教练${action}。${artDirection}。${atmosphere}。${light}。背景是${scene}。${camera}，f/1.8, 8k resolution, photorealistic, real sweat texture. **Center-weighted composition, subject in middle, ample negative space for cropping.** --ar 16:9`;
  };

  const regeneratePromptsWithNewConfig = (newConfig: AppConfig) => {
    setCourseItems(prevItems => prevItems.map(item => {
      if (item.status === 'success' && item.action) {
        return {
          ...item,
          prompt: generatePromptString(item.action, newConfig)
        };
      }
      return item;
    }));
  };

  const handleGenerate = async (courseNames: string[]) => {
    setIsGenerating(true);
    
    // 1. Initialize all items as loading
    const newItems: CourseItem[] = courseNames.map(name => ({
      id: Math.random().toString(36).substr(2, 9),
      name,
      action: null,
      prompt: null,
      status: 'loading',
      imageStatus: 'idle',
      imageUrl: null
    }));

    setCourseItems(newItems);

    // 2. Process sequentially to avoid 429 Rate Limit (Free Tier has low RPM)
    const processedItems = [...newItems];
    
    for (let i = 0; i < processedItems.length; i++) {
      const item = processedItems[i];
      try {
        const action = await deduceActionFromCourse(item.name);
        const prompt = generatePromptString(action, config);

        processedItems[i] = {
          ...item,
          action,
          prompt,
          status: 'success' as const
        };
      } catch (e: any) {
        processedItems[i] = {
          ...item,
          status: 'error' as const,
          errorMsg: e.message
        };
      }

      // Update state incrementally so user sees progress
      setCourseItems([...processedItems]);

      // Add a small delay between requests if not the last item
      // Free tier allows ~15 RPM, so 2s delay is safe
      if (i < processedItems.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setIsGenerating(false);
  };

  const handleGenerateImage = async (id: string) => {
    setCourseItems(prev => prev.map(item => 
      item.id === id ? { ...item, imageStatus: 'loading', imageUrl: null, errorMsg: undefined } : item
    ));

    const item = courseItems.find(i => i.id === id);
    if (!item || !item.prompt) return;

    try {
      const base64Image = await generateImageFromPrompt(item.prompt);
      
      setCourseItems(prev => prev.map(i => 
        i.id === id ? { ...i, imageStatus: 'success', imageUrl: base64Image } : i
      ));
    } catch (error: any) {
      setCourseItems(prev => prev.map(i => 
        i.id === id ? { ...i, imageStatus: 'error', errorMsg: error.message } : i
      ));
    }
  };

  const handleUpdatePrompt = (id: string, newPrompt: string) => {
    setCourseItems(prev => prev.map(item => 
      item.id === id ? { ...item, prompt: newPrompt } : item
    ));
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
            <Aperture className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">FitVision AI</h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide">高级健身视觉生成器 (High-End Fitness Visuals)</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <section className="text-center max-w-2xl mx-auto mb-8">
           <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 mb-3">
             Create Cinematic Fitness Prompts
           </h2>
           <p className="text-slate-400">
             Define your visual style, input your course list, and let AI deduce the perfect action shots for Midjourney or Flux.
             <br/>
             <span className="text-xs text-slate-600 uppercase tracking-widest mt-2 inline-block">Center Weighted • 8K Resolution • Real Texture</span>
           </p>
        </section>

        <section>
          <ConfigPanel config={config} onChange={handleConfigChange} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 h-full">
            <CourseInput onGenerate={handleGenerate} isGenerating={isGenerating} />
          </div>
          
          <div className="lg:col-span-8">
             <ResultTable 
               items={courseItems} 
               onGenerateImage={handleGenerateImage} 
               onUpdatePrompt={handleUpdatePrompt}
             />
          </div>
        </section>
      </main>
    </div>
  );
}