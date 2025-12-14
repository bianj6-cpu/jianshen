import React, { useState } from 'react';
import { CourseItem } from '../types';
import { Copy, Check, FileText, Download, Image as ImageIcon, Loader2, RefreshCw, Edit2, AlertTriangle } from 'lucide-react';

interface Props {
  items: CourseItem[];
  onGenerateImage: (id: string) => void;
  onUpdatePrompt: (id: string, newPrompt: string) => void;
}

const ResultTable: React.FC<Props> = ({ items, onGenerateImage, onUpdatePrompt }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyMarkdown = () => {
    const tableHeader = `| 课程名称 | 中文 Prompt |\n|---|---|\n`;
    const tableBody = items
      .filter(item => item.status === 'success')
      .map(item => `| ${item.name} | ${item.prompt} |`)
      .join('\n');
    
    navigator.clipboard.writeText(tableHeader + tableBody);
    alert('Markdown表格已复制到剪贴板！');
  };

  if (items.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <FileText className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">生成结果 (Results)</h2>
          <span className="text-sm text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
            {items.filter(i => i.status === 'success').length}
          </span>
        </div>
        
        {items.length > 0 && (
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            复制 Markdown
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
              <th className="p-4 font-medium w-[15%] min-w-[120px]">课程名称</th>
              <th className="p-4 font-medium w-[45%]">Prompt (中文/可编辑)</th>
              <th className="p-4 font-medium w-[30%]">视觉预览 (Preview)</th>
              <th className="p-4 font-medium w-[10%] text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {items.map((item) => (
              <tr key={item.id} className="group hover:bg-slate-800/30 transition-colors">
                <td className="p-4 align-top text-slate-300 font-medium">
                  {item.name}
                  {item.action && (
                    <div className="mt-1 text-xs text-emerald-500 font-normal">
                      Action: {item.action}
                    </div>
                  )}
                </td>
                <td className="p-4 align-top">
                  {item.status === 'loading' ? (
                    <div className="flex items-center gap-2 text-slate-500 animate-pulse">
                      <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                      Generating Text...
                    </div>
                  ) : item.status === 'error' ? (
                    <div className="flex flex-col gap-1 text-red-400 text-sm">
                      <div className="flex items-center gap-1">
                         <AlertTriangle className="w-4 h-4" />
                         <span>Generation failed</span>
                      </div>
                      {item.errorMsg && <span className="text-xs opacity-70 break-words">{item.errorMsg}</span>}
                    </div>
                  ) : (
                    <div className="relative group/edit">
                      <textarea
                        value={item.prompt || ''}
                        onChange={(e) => onUpdatePrompt(item.id, e.target.value)}
                        className="w-full h-32 bg-slate-900/50 border border-transparent hover:border-slate-700 focus:border-blue-500/50 rounded-lg p-3 text-sm text-slate-300 font-mono leading-relaxed focus:outline-none transition-all resize-y"
                        spellCheck={false}
                      />
                      <Edit2 className="w-3 h-3 text-slate-600 absolute bottom-3 right-3 opacity-0 group-hover/edit:opacity-100 pointer-events-none" />
                    </div>
                  )}
                </td>
                <td className="p-4 align-top">
                  {item.status === 'success' && (
                    <div className="flex flex-col items-start gap-2">
                       {item.imageStatus === 'idle' && (
                         <button 
                           onClick={() => onGenerateImage(item.id)}
                           className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 hover:text-indigo-300 text-xs font-medium rounded-md transition-colors border border-indigo-500/30"
                         >
                           <ImageIcon className="w-3 h-3" />
                           生成图片 (Generate Image)
                         </button>
                       )}
                       {item.imageStatus === 'loading' && (
                         <div className="flex items-center gap-2 text-xs text-slate-400">
                           <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                           绘图中...
                         </div>
                       )}
                       {item.imageStatus === 'success' && item.imageUrl && (
                         <div className="relative group/image">
                            <img 
                              src={item.imageUrl} 
                              alt={item.name} 
                              className="w-48 aspect-video object-cover rounded-lg border border-slate-700 shadow-lg"
                            />
                            <a 
                              href={item.imageUrl} 
                              download={`${item.name}-fitvision.png`}
                              className="absolute bottom-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded opacity-0 group-hover/image:opacity-100 transition-opacity backdrop-blur-sm"
                              title="Download"
                            >
                              <Download className="w-3 h-3" />
                            </a>
                         </div>
                       )}
                       {item.imageStatus === 'error' && (
                         <div className="flex flex-col gap-1 items-start">
                           <div className="flex items-center gap-2">
                             <span className="text-red-400 text-xs">Failed</span>
                             <button 
                               onClick={() => onGenerateImage(item.id)}
                               className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                             >
                               <RefreshCw className="w-3 h-3" />
                             </button>
                           </div>
                           {item.errorMsg && <span className="text-[10px] text-red-500/70 max-w-[200px] break-words leading-tight">{item.errorMsg}</span>}
                         </div>
                       )}
                    </div>
                  )}
                </td>
                <td className="p-4 align-top text-center">
                  {item.status === 'success' && (
                    <button
                      onClick={() => handleCopy(item.prompt || '', item.id)}
                      className="p-2 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
                      title="Copy Prompt"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultTable;