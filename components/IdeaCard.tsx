
import React from 'react';
import type { Idea } from '../types';

interface IdeaCardProps {
  idea: Idea;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea }) => {
  return (
    <div className={`
      bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 
      flex flex-col h-full
      transition-all duration-300 ease-in-out
      hover:bg-slate-800 hover:border-${idea.color} hover:shadow-2xl hover:shadow-${idea.color}/20
      hover:-translate-y-2
    `}>
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${idea.color}/10 border border-${idea.color}/30 text-${idea.color}`}>
          {idea.icon}
        </div>
        <h3 className="text-2xl font-bold text-slate-100">{idea.title}</h3>
      </div>
      <p className="text-slate-400 mb-4 flex-grow">{idea.description}</p>

      <div className="mb-6">
        <h4 className="font-semibold text-slate-200 mb-2">How It Works</h4>
        <p className="text-sm text-slate-400">{idea.howItWorks}</p>
      </div>
      
      <div>
        <h4 className="font-semibold text-slate-200 mb-2">Primary Models</h4>
        <div className="flex flex-wrap gap-2">
          {idea.models.map((model) => (
            <span key={model} className="bg-slate-700 text-slate-300 text-xs font-medium px-3 py-1 rounded-full">
              {model}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IdeaCard;
