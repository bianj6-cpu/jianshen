import React, { useState } from 'react';
import { List, Plus, Trash2, Wand2 } from 'lucide-react';

interface Props {
  onGenerate: (courses: string[]) => void;
  isGenerating: boolean;
}

const CourseInput: React.FC<Props> = ({ onGenerate, isGenerating }) => {
  const [text, setText] = useState('');

  const handleGenerate = () => {
    if (!text.trim()) return;
    const courses = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (courses.length > 0) {
      onGenerate(courses);
    }
  };

  const handleSample = () => {
    const sample = `HIIT 燃脂特训
晨间唤醒瑜伽
核心力量进阶
普拉提塑形
拳击有氧`;
    setText(sample);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <List className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">课程列表 (Course List)</h2>
        </div>
        <button 
          onClick={handleSample}
          className="text-xs text-slate-400 hover:text-white underline decoration-slate-600 hover:decoration-white transition-all"
        >
          加载示例 (Load Sample)
        </button>
      </div>

      <textarea
        className="flex-1 w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-slate-500 font-mono text-sm leading-relaxed"
        placeholder={`在此输入课程名称，每行一个。例如：
HIIT燃脂
流瑜伽
泰拳基础`}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="mt-4">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !text.trim()}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-white transition-all transform active:scale-[0.98] ${
            isGenerating || !text.trim()
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-900/20'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>AI 解析动作中... (Analyzing)</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              <span>生成 Prompts (Generate)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CourseInput;