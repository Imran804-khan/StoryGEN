import React from 'react';
import { ImageSize, StoryboardScene } from '../types';
import { Image as ImageIcon, RefreshCw, Download, Maximize2, AlertCircle } from 'lucide-react';

interface StoryboardGalleryProps {
  scenes: StoryboardScene[];
  onGenerateImage: (scene: StoryboardScene) => void;
  selectedSize: ImageSize;
  setSelectedSize: (size: ImageSize) => void;
}

export const StoryboardGallery: React.FC<StoryboardGalleryProps> = ({
  scenes,
  onGenerateImage,
  selectedSize,
  setSelectedSize
}) => {
  
  if (scenes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900/30 rounded-xl border-2 border-dashed border-slate-800 p-8">
        <ImageIcon className="w-12 h-12 mb-3 opacity-20" />
        <p className="text-lg">No scenes generated yet.</p>
        <p className="text-sm opacity-60">Analyze a script to begin.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Storyboard Scenes</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Resolution:</span>
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value as ImageSize)}
            className="bg-slate-800 text-white text-sm rounded-lg border border-slate-700 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {Object.values(ImageSize).map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pr-2 pb-4">
        {scenes.map((scene) => (
          <div key={scene.id} className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-lg hover:border-slate-700 transition-colors group">
            
            {/* Image Area */}
            <div className="aspect-video bg-slate-950 relative flex items-center justify-center overflow-hidden">
              {scene.isLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-indigo-400 font-medium">Rendering {selectedSize}...</span>
                </div>
              ) : scene.generatedImageUrl ? (
                <>
                  <img 
                    src={scene.generatedImageUrl} 
                    alt={`Scene ${scene.sceneNumber}`} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                    <a 
                        href={scene.generatedImageUrl} 
                        download={`storyboard-scene-${scene.sceneNumber}.png`}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
                        title="Download Image"
                    >
                        <Download className="w-5 h-5" />
                    </a>
                    <button 
                        onClick={() => onGenerateImage(scene)}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
                        title="Regenerate"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : scene.error ? (
                 <div className="flex flex-col items-center text-center p-4 text-red-400 gap-2">
                   <AlertCircle className="w-8 h-8" />
                   <span className="text-xs">{scene.error}</span>
                   <button 
                        onClick={() => onGenerateImage(scene)}
                        className="mt-2 px-3 py-1 text-xs bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 rounded-full transition-colors"
                    >
                        Retry
                    </button>
                 </div>
              ) : (
                <button 
                    onClick={() => onGenerateImage(scene)}
                    className="flex flex-col items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors"
                >
                  <ImageIcon className="w-10 h-10" />
                  <span className="text-sm font-medium">Generate Image</span>
                </button>
              )}
              
              {/* Badge */}
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded text-xs font-bold text-white border border-white/10">
                SCENE {scene.sceneNumber}
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-sm text-slate-300 line-clamp-3 mb-3 min-h-[3.75rem]">
                {scene.description}
              </p>
              <div className="text-xs text-slate-500 font-mono border-t border-slate-800 pt-3 truncate">
                <span className="text-indigo-400">PROMPT:</span> {scene.visualPrompt}
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};