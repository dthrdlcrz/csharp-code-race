import React from 'react';
import { CSHARP_SNIPPETS } from '../logic/csharp-snippets';

interface SolutionExplorerProps {
  currentIndex: number;
  onReset: () => void;
  onSelect: (index: number) => void;
  snippetInputs: string[];
}

const SolutionExplorer: React.FC<SolutionExplorerProps> = ({ currentIndex, onReset, onSelect, snippetInputs }) => {
  return (
    <div className="sidebar">
      <div 
        className="solution-header" 
        style={{ cursor: 'default' }}
      >
        SOLUTION 'CODE-RACE'
      </div>
      <div style={{ marginLeft: '10px' }}>
        <div style={{ color: '#c5c5c5' }}>📂 src</div>
        {CSHARP_SNIPPETS.map((s, idx) => {
          const isCompiled = snippetInputs[idx] === s.code;
          return (
            <div 
              key={s.id} 
              onClick={() => onSelect(idx)}
              style={{ 
                marginLeft: '20px', 
                color: idx === currentIndex ? '#fff' : isCompiled ? '#6a9955' : '#858585',
                background: idx === currentIndex ? '#37373d' : 'transparent',
                padding: '2px 5px',
                cursor: 'pointer'
              }}
            >
              {isCompiled ? '✅' : idx === currentIndex ? '⚡' : '📄'} {s.title}.cs
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SolutionExplorer;
