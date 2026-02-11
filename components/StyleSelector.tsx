import React from 'react';
import { HeadshotStyle, STYLE_OPTIONS } from '../types';

interface StyleSelectorProps {
  selectedStyle: HeadshotStyle | null;
  onSelect: (style: HeadshotStyle) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onSelect }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {STYLE_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`group relative flex flex-col text-left p-3 rounded-xl border transition-all duration-200 hover:shadow-md ${
              selectedStyle === option.id
                ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                : 'border-slate-200 bg-white hover:border-indigo-300'
            }`}
          >
            <div className={`w-full h-16 rounded-lg mb-2 ${option.previewColor} bg-opacity-20 flex items-center justify-center overflow-hidden`}>
                 <span className="text-2xl opacity-80 filter drop-shadow-sm">
                    {option.id === HeadshotStyle.CORPORATE && "🏢"}
                    {option.id === HeadshotStyle.MODERN_OFFICE && "💻"}
                    {option.id === HeadshotStyle.OUTDOOR && "🌳"}
                    {option.id === HeadshotStyle.STUDIO_DARK && "📸"}
                    {option.id === HeadshotStyle.STARTUP && "🚀"}
                    {option.id === HeadshotStyle.MINIMALIST && "✨"}
                    {option.id === HeadshotStyle.CAFE && "☕"}
                    {option.id === HeadshotStyle.ACADEMIC && "📚"}
                    {option.id === HeadshotStyle.NEON && "🌆"}
                    {option.id === HeadshotStyle.BW_CLASSIC && "✒️"}
                 </span>
            </div>
            <h4 className={`text-sm font-semibold truncate ${selectedStyle === option.id ? 'text-indigo-900' : 'text-slate-800'}`}>
              {option.label}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
              {option.description}
            </p>
            
            {selectedStyle === option.id && (
              <div className="absolute top-2 right-2 text-indigo-600 bg-white rounded-full p-0.5 shadow-sm">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};