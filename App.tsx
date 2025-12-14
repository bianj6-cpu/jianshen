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
      
      // If we already have generated items, we should update their prompts 
      // based on the new config, BUT only if they already have an assigned action.
      // This allows live tweaking of visual style without re-fetching Gemini actions.
      if (courseItems.length > 0) {
        regeneratePromptsWithNewConfig(newConfig);
      }
      
      return newConfig;
    });
  };

  const generatePromptString = (action: string, cfg: AppConfig): string => {
    // Generate Prompt entirely in Chinese structure as requested
    // Formula: [Shot] [Nationality] [Gender] coach [Action]. [ArtDirection]. [Atmosphere]. [Light]. Background [Scene]. [Camera]. Suffix.
    
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
    
    // Initialize items with loading state
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

    // Process each item
    const processedItems = await Promise.all(newItems.map(async (item) => {
      try {
        // 1. Call Gemini to get the action in Chinese
        const action = await deduceActionFromCourse(item.name);
        
        // 2. Generate the prompt string locally in Chinese
        const prompt = generatePromptString(action, config);

        return {
          ...item,
          action,
          prompt,
          status: 'success' as const
        };
      } catch (e) {
        return {
          ...item,
          status: 'error' as const
        };
      }
    }));

    setCourseItems(processedItems);
    setIsGenerating(false);
  };

  const handleGenerateImage = async (id: string) => {
    // 1. Set status to loading
    setCourseItems(prev => prev.map(item => 
      item.id === id ? { ...item, imageStatus: 'loading', imageUrl: null } : item
    ));

    // 2. Find the item and generate
    const item = courseItems.find(i => i.id === id);
    if (!item || !item.prompt) return;

    try {
      const base64Image = await generateImageFromPrompt(item.prompt);
      
      setCourseItems(prev => prev.map(i => 
        i.id === id ? { ...i, imageStatus: 'success', imageUrl: base64Image } : i
      ));
    } catch (error) {
      setCourseItems(prev => prev.map(i => 
        i.id === id ? { ...i, imageStatus: 'error' } : i
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
      {/* Header */}
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
        
        {/* Intro Text */}
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

        {/* Configuration */}
        <section>
          <ConfigPanel config={config} onChange={handleConfigChange} />
        </section>

        {/* Input & Results Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Input */}
          <div className="lg:col-span-4 h-full">
            <CourseInput onGenerate={handleGenerate} isGenerating={isGenerating} />
          </div>
          
          {/* Right: Results */}
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