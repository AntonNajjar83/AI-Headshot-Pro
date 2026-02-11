import React, { useState, useRef, useEffect } from 'react';
import { UploadArea } from './components/UploadArea';
import { StyleSelector } from './components/StyleSelector';
import { Button } from './components/Button';
import { HeadshotStyle, ImageType, Resolution } from './types';
import * as geminiService from './services/geminiService';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<HeadshotStyle | null>(null);
  const [imageType, setImageType] = useState<ImageType>('headshot');
  const [resolution, setResolution] = useState<Resolution>('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const resultSectionRef = useRef<HTMLDivElement>(null);

  // Scroll to result when generated (only on mobile where layout stacks)
  useEffect(() => {
    if (generatedImage && window.innerWidth < 1024 && resultSectionRef.current) {
      resultSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [generatedImage]);

  const handleReset = () => {
    setOriginalImage(null);
    setGeneratedImage(null);
    setSelectedStyle(null);
    setEditPrompt("");
    setError(null);
    setImageType('headshot');
    setResolution('1K');
  };

  const handleGenerate = async () => {
    if (!originalImage || !selectedStyle) return;

    // Check API Key for High Res
    if (resolution !== '1K') {
      try {
        const win = window as any;
        if (win.aistudio) {
          const hasKey = await win.aistudio.hasSelectedApiKey();
          if (!hasKey) {
            await win.aistudio.openSelectKey();
          }
        }
      } catch (e) {
        console.warn("Failed to check/request API key:", e);
      }
    }

    setIsGenerating(true);
    setError(null);
    try {
      const result = await geminiService.generateHeadshot(originalImage, selectedStyle, imageType, resolution);
      setGeneratedImage(result);
      setEditPrompt("");
    } catch (err: any) {
      setError(err.message || "Failed to generate headshot. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = async () => {
    if (!generatedImage || !editPrompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    try {
      const result = await geminiService.editHeadshot(generatedImage, editPrompt);
      setGeneratedImage(result);
      setEditPrompt("");
    } catch (err: any) {
      setError(err.message || "Failed to edit image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Compact Header */}
      <header className="flex-none h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI Headshot Pro</h1>
        </div>
        <div className="text-sm text-slate-500 hidden sm:block">
           Professional AI Studio
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Sidebar: Controls (Scrollable) */}
        <div className="w-full lg:w-[500px] xl:w-[600px] bg-white border-r border-slate-200 flex flex-col h-full z-0 shadow-xl lg:shadow-none">
          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            
            {/* Step 1: Upload */}
            <section>
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2 text-xs">1</span>
                    Source Image
                 </h2>
                 {originalImage && (
                    <button 
                      onClick={() => setOriginalImage(null)} 
                      className="text-xs text-indigo-600 font-medium hover:underline"
                    >
                      Replace
                    </button>
                 )}
              </div>
              
              {!originalImage ? (
                <UploadArea onImageSelected={setOriginalImage} />
              ) : (
                <div className="flex items-start space-x-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <img src={originalImage} alt="Uploaded" className="w-20 h-24 object-cover rounded-lg shadow-sm" />
                  <div className="flex-1 min-w-0 py-1">
                    <p className="text-sm font-medium text-slate-900 truncate">Image uploaded</p>
                    <p className="text-xs text-slate-500 mt-1">Ready for processing</p>
                    <div className="mt-2 flex items-center text-xs text-green-600">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Valid source
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Step 2: Settings (Only visible after upload) */}
            {originalImage && (
              <div className="space-y-8 animate-fade-in">
                
                {/* Configuration */}
                <section>
                   <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center mb-4">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2 text-xs">2</span>
                      Configuration
                   </h2>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Frame</label>
                        <div className="relative">
                          <select
                            value={imageType}
                            onChange={(e) => setImageType(e.target.value as ImageType)}
                            className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-3 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-medium shadow-sm transition-all cursor-pointer hover:border-slate-300"
                          >
                            <option value="headshot">Headshot</option>
                            <option value="fullbody">Full Body</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                      </div>
                      <div>
                         <label className="block text-xs font-medium text-slate-500 mb-1.5">Quality</label>
                         <div className="relative">
                           <select
                              value={resolution}
                              onChange={(e) => setResolution(e.target.value as Resolution)}
                              className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-3 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-medium shadow-sm transition-all cursor-pointer hover:border-slate-300"
                           >
                             <option value="1K">1K (Fast)</option>
                             <option value="2K">2K (High Res)</option>
                             <option value="4K">4K (Ultra Res)</option>
                           </select>
                           <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                             <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                           </div>
                         </div>
                      </div>
                   </div>
                </section>

                {/* Style Selector */}
                <section>
                   <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center mb-4">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2 text-xs">3</span>
                      Style
                   </h2>
                   <StyleSelector selectedStyle={selectedStyle} onSelect={setSelectedStyle} />
                </section>
                
                {/* Spacer for scrolling */}
                <div className="h-12"></div>
              </div>
            )}
          </div>
          
          {/* Sticky Generate Button Footer */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <Button 
              variant="primary" 
              className="w-full text-base py-3.5 shadow-xl shadow-indigo-200"
              disabled={!originalImage || !selectedStyle} 
              onClick={handleGenerate}
              isLoading={isGenerating && !generatedImage}
            >
               {isGenerating ? 'Generating...' : `Generate ${resolution} Photo`}
            </Button>
          </div>
        </div>

        {/* Right Main Area: Result (Fixed) */}
        <div className="flex-1 bg-slate-50/50 relative flex flex-col overflow-hidden" ref={resultSectionRef}>
           
           {/* Background pattern */}
           <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

           <div className="flex-1 flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
              <div className="w-full max-w-2xl flex flex-col items-center">
                 
                 {/* Empty State */}
                 {!generatedImage && !isGenerating && (
                    <div className="text-center p-12 opacity-40">
                       <div className="w-32 h-32 mx-auto bg-slate-200 rounded-full flex items-center justify-center mb-6">
                          <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                       </div>
                       <h3 className="text-2xl font-semibold text-slate-800 mb-2">Ready to Create</h3>
                       <p className="text-slate-500">Select a style and click Generate to see the magic.</p>
                    </div>
                 )}

                 {/* Loading State */}
                 {isGenerating && (
                    <div className="text-center">
                        <div className="relative w-64 h-80 bg-white rounded-2xl shadow-xl overflow-hidden mx-auto mb-6 ring-4 ring-indigo-50">
                           <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 animate-pulse opacity-20"></div>
                           <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                           </div>
                        </div>
                        <h3 className="text-xl font-medium text-slate-700 animate-pulse">Designing your {selectedStyle?.toLowerCase()} look...</h3>
                        <p className="text-slate-400 mt-2 text-sm">This usually takes about 5-10 seconds</p>
                    </div>
                 )}

                 {/* Result State */}
                 {generatedImage && (
                    <div className="bg-white p-2 rounded-3xl shadow-2xl ring-1 ring-slate-200 animate-fade-in-up w-full">
                       <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-100">
                          <img src={generatedImage} alt="Generated Result" className="w-full h-full object-contain" />
                          
                          <div className="absolute top-4 left-4">
                             <span className="bg-black/50 backdrop-blur text-white text-xs font-medium px-2 py-1 rounded-md border border-white/20">
                                {resolution}
                             </span>
                          </div>
                       </div>
                       
                       <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between bg-white rounded-b-2xl">
                          {/* Edit Input */}
                          <div className="flex-1 w-full relative">
                             <input 
                                type="text" 
                                value={editPrompt}
                                onChange={(e) => setEditPrompt(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                                placeholder="Refine (e.g. 'Add glasses', 'Smile more')..."
                                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                             />
                             <button 
                                onClick={handleEdit}
                                disabled={!editPrompt.trim() || isGenerating}
                                className="absolute right-2 top-2 p-1.5 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 disabled:opacity-50 transition-colors"
                             >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                             </button>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center space-x-2 w-full md:w-auto">
                             <button 
                                onClick={handleReset}
                                className="px-4 py-3 text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors"
                             >
                                New
                             </button>
                             <a 
                                href={generatedImage} 
                                download={`headshot-${Date.now()}.png`}
                                className="flex-1 md:flex-none flex items-center justify-center px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-sm shadow-lg shadow-slate-200 transition-transform active:scale-95"
                             >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Download
                             </a>
                          </div>
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>

      </div>

      {/* Global Error Toast */}
      {error && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full shadow-xl flex items-center space-x-3 z-50 animate-bounce-in">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
           <span className="text-sm font-medium">{error}</span>
           <button onClick={() => setError(null)} className="ml-2 hover:bg-red-700 rounded-full p-1">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>
      )}
    </div>
  );
};

export default App;