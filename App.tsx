import React, { useState } from 'react';
import { ApiKeyGuard } from './components/ApiKeyGuard';
import { ScriptUploader } from './components/ScriptUploader';
import { StoryboardGallery } from './components/StoryboardGallery';
import { ChatBot } from './components/ChatBot';
import { analyzeScript, generateStoryboardImage } from './services/gemini';
import { ImageSize, StoryboardScene } from './types';
import { Clapperboard } from 'lucide-react';

const DEFAULT_SCRIPT = `SCENE 1
INT. SPACESHIP COCKPIT - NIGHT

The cockpit is bathed in the soft glow of holographic displays. COMMANDER HAWKE (40s, rugged) grips the controls. Outside, a nebula swirls in hues of violet and gold.

HAWKE
Hold on, we're going in.

The ship shudders violently.

SCENE 2
EXT. ALIEN PLANET - DAY

The ship crash lands in a dense jungle of bioluminescent flora. Smoke rises from the wreckage. Strange, multi-winged birds take flight.

SCENE 3
INT. ANCIENT RUINS - NIGHT

Hawke explores a cavernous stone temple. A floating crystal artifact pulses with blue light in the center of the room. He reaches out to touch it.`;

function App() {
  const [scriptContent, setScriptContent] = useState<string>(DEFAULT_SCRIPT);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [scenes, setScenes] = useState<StoryboardScene[]>([]);
  const [selectedSize, setSelectedSize] = useState<ImageSize>(ImageSize.Size1K);

  const handleAnalyzeScript = async () => {
    if (!scriptContent.trim()) return;
    
    setIsAnalyzing(true);
    setScenes([]); // Clear previous

    try {
      const analysisResults = await analyzeScript(scriptContent);
      
      // Map partial results to full scenes with ID
      const newScenes: StoryboardScene[] = analysisResults.map((s, index) => ({
        id: `scene-${Date.now()}-${index}`,
        sceneNumber: s.sceneNumber || index + 1,
        description: s.description || "No description provided",
        visualPrompt: s.visualPrompt || s.description || "Abstract scene",
        isLoading: false
      }));

      setScenes(newScenes);
      
      // Optional: Auto-trigger generation for first few?
      // Let's stick to manual or auto-all based on UX. Let's auto-trigger all to be impressive.
      newScenes.forEach(scene => {
          handleGenerateImage(scene, newScenes);
      });

    } catch (error) {
      console.error("Script analysis failed:", error);
      alert("Failed to analyze script. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateImage = async (sceneToGen: StoryboardScene, currentScenes = scenes) => {
     // Optimistic update for loading state
     const updatedScenes = currentScenes.map(s => 
         s.id === sceneToGen.id 
             ? { ...s, isLoading: true, error: undefined } 
             : s
     );
     setScenes(updatedScenes);

     try {
         const imageUrl = await generateStoryboardImage(sceneToGen.visualPrompt, selectedSize);
         
         setScenes(prev => prev.map(s => 
             s.id === sceneToGen.id 
                 ? { ...s, isLoading: false, generatedImageUrl: imageUrl } 
                 : s
         ));
     } catch (error) {
         console.error(`Failed to generate image for scene ${sceneToGen.sceneNumber}:`, error);
         setScenes(prev => prev.map(s => 
             s.id === sceneToGen.id 
                 ? { ...s, isLoading: false, error: "Generation failed" } 
                 : s
         ));
     }
  };

  return (
    <ApiKeyGuard>
      <div className="min-h-screen bg-slate-950 flex flex-col">
        {/* Header */}
        <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20">
          <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Clapperboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">StoryGen AI</h1>
                <p className="text-xs text-slate-400">Script to Storyboard Visualization</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
                    Gemini 3 Pro Model Active
                </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-[1600px] mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
          {/* Left Panel: Script Input */}
          <div className="lg:col-span-4 xl:col-span-3 h-[calc(100vh-8rem)]">
            <ScriptUploader
              scriptContent={scriptContent}
              setScriptContent={setScriptContent}
              isProcessing={isAnalyzing}
              onAnalyze={handleAnalyzeScript}
            />
          </div>

          {/* Right Panel: Gallery */}
          <div className="lg:col-span-8 xl:col-span-9 h-[calc(100vh-8rem)]">
             <StoryboardGallery 
                scenes={scenes} 
                onGenerateImage={(s) => handleGenerateImage(s)}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
             />
          </div>
        </main>

        {/* Chatbot Overlay */}
        <ChatBot />
      </div>
    </ApiKeyGuard>
  );
}

export default App;
