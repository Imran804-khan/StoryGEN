import React, { useRef } from 'react';
import { Upload, FileText } from 'lucide-react';

interface ScriptUploaderProps {
  scriptContent: string;
  setScriptContent: (content: string) => void;
  isProcessing: boolean;
  onAnalyze: () => void;
}

export const ScriptUploader: React.FC<ScriptUploaderProps> = ({
  scriptContent,
  setScriptContent,
  isProcessing,
  onAnalyze
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setScriptContent(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          Script Input
        </h2>
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.md"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <Upload className="w-3 h-3" />
            Load Text File
          </button>
        </div>
      </div>

      <textarea
        value={scriptContent}
        onChange={(e) => setScriptContent(e.target.value)}
        placeholder="Paste your script here or upload a file..."
        className="flex-1 w-full bg-slate-950/50 border border-slate-800 rounded-lg p-4 text-slate-300 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
      />

      <div className="mt-4">
        <button
          onClick={onAnalyze}
          disabled={!scriptContent.trim() || isProcessing}
          className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
            !scriptContent.trim() || isProcessing
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
          }`}
        >
          {isProcessing ? 'Analyzing Script...' : 'Analyze & Generate Storyboard'}
        </button>
      </div>
    </div>
  );
};