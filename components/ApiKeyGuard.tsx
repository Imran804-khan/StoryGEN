import React, { useEffect, useState } from 'react';
import { ShieldAlert, ExternalLink } from 'lucide-react';

interface ApiKeyGuardProps {
  children: React.ReactNode;
}

export const ApiKeyGuard: React.FC<ApiKeyGuardProps> = ({ children }) => {
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const checkKey = async () => {
    try {
      const exists = await window.aistudio.hasSelectedApiKey();
      setHasKey(exists);
    } catch (e) {
      console.error("Error checking API key:", e);
      setHasKey(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    try {
      await window.aistudio.openSelectKey();
      // Assume success after dialog closes/action completes, checking again is safest but we proceed optimistically or re-check
      // The instructions say: "assume the key selection was successful... Do not add delay"
      setHasKey(true); 
    } catch (e) {
      console.error("Error selecting API key:", e);
      // If "Requested entity was not found" error, prompt again (simplified logic here)
      alert("Failed to select key. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-pulse">Initializing...</div>
      </div>
    );
  }

  if (!hasKey) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4 text-center">
        <div className="max-w-md w-full bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-indigo-500/20 rounded-full">
              <ShieldAlert className="w-10 h-10 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">API Key Required</h1>
          <p className="text-slate-400 mb-6">
            To use the high-quality <strong>Gemini 3 Pro Image</strong> generation and <strong>Pro Preview</strong> text models, you must provide a valid API key from a paid Google Cloud Project.
          </p>
          
          <button
            onClick={handleSelectKey}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
          >
            Select API Key
          </button>

          <div className="mt-6 pt-6 border-t border-slate-800">
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-slate-500 hover:text-indigo-400 flex items-center justify-center gap-1 transition-colors"
            >
              Billing Documentation <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};