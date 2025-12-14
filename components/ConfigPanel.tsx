import React from 'react';
import { AppConfig, OptionItem } from '../types';
import { 
  SHOT_OPTIONS, ATMOSPHERE_OPTIONS, LIGHT_OPTIONS, 
  CAMERA_OPTIONS, GENDER_OPTIONS, NATIONALITY_OPTIONS, ART_DIRECTION_OPTIONS, SCENE_OPTIONS 
} from '../constants';
import { Settings, Camera, Palette, Zap, Users, Globe, Clapperboard, MapPin } from 'lucide-react';

interface Props {
  config: AppConfig;
  onChange: (key: keyof AppConfig, value: any) => void;
}

const SelectGroup = <T extends string | number>({ 
  label, 
  icon: Icon, 
  options, 
  value, 
  onChange 
}: { 
  label: string; 
  icon: React.ElementType; 
  options: OptionItem<T>[]; 
  value: T; 
  onChange: (val: T) => void; 
}) => (
  <div className="flex flex-col gap-2">
    <label className="flex items-center gap-2 text-sm font-medium text-slate-400">
      <Icon className="w-4 h-4 text-emerald-500" />
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 hover:bg-slate-750 transition-colors cursor-pointer text-sm"
      >
        {options.map((opt) => (
          <option key={String(opt.value)} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
      </div>
    </div>
  </div>
);

const ConfigPanel: React.FC<Props> = ({ config, onChange }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
        <div className="p-2 bg-emerald-500/10 rounded-lg">
          <Settings className="w-5 h-5 text-emerald-400" />
        </div>
        <h2 className="text-lg font-semibold text-white">全局视觉参数 (Global Config)</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Row 1 - Core Style */}
        <SelectGroup 
          label="美术指导团队 (Style)" 
          icon={Clapperboard} 
          options={ART_DIRECTION_OPTIONS} 
          value={config.artDirection} 
          onChange={(v) => onChange('artDirection', v)} 
        />
        <SelectGroup 
          label="场景选择 (Scene)" 
          icon={MapPin} 
          options={SCENE_OPTIONS} 
          value={config.scene} 
          onChange={(v) => onChange('scene', v)} 
        />
        <SelectGroup 
          label="整体氛围 (Vibe)" 
          icon={Palette} 
          options={ATMOSPHERE_OPTIONS} 
          value={config.atmosphere} 
          onChange={(v) => onChange('atmosphere', v)} 
        />
        <SelectGroup 
          label="灯光风格 (Light)" 
          icon={Zap} 
          options={LIGHT_OPTIONS} 
          value={config.light} 
          onChange={(v) => onChange('light', v)} 
        />
        
        {/* Row 2 - Tech Specs */}
        <SelectGroup 
          label="镜头景别 (Shot)" 
          icon={Camera} 
          options={SHOT_OPTIONS} 
          value={config.shot} 
          onChange={(v) => onChange('shot', v)} 
        />
        <SelectGroup 
          label="相机型号 (Camera)" 
          icon={Camera} 
          options={CAMERA_OPTIONS} 
          value={config.camera} 
          onChange={(v) => onChange('camera', v)} 
        />
        <SelectGroup 
          label="人物性别 (Gender)" 
          icon={Users} 
          options={GENDER_OPTIONS} 
          value={config.gender} 
          onChange={(v) => onChange('gender', v)} 
        />
        <SelectGroup 
          label="人物国籍 (Nationality)" 
          icon={Globe} 
          options={NATIONALITY_OPTIONS} 
          value={config.nationality} 
          onChange={(v) => onChange('nationality', v)} 
        />
      </div>
    </div>
  );
};

export default ConfigPanel;