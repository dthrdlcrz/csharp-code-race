import React, { useEffect, useRef } from 'react';
import { GameState } from '../logic/engine';

interface IdeWindowProps {
  state: GameState;
  targetCode: string;
  userInput: string;
  onType: (char: string) => void;
  onBackspace: () => void;
}

const IdeWindow: React.FC<IdeWindowProps> = ({ state, targetCode, userInput, onType, onBackspace }) => {
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [state.currentSnippetIndex, state.showSnippetResult, state.focusTrigger]);

  const handleEditorClick = () => {
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (state.isGameOver) return;

    // Handle bug-specific key combos
    if (state.activeObstacle === 'UNRESOLVED_REF' && e.altKey && e.key === 'Enter') {
      return;
    }
    
    if (e.key === 'Backspace') {
      onBackspace();
    } else if (e.key === 'Enter') {
      onType('\n');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      onType('    '); // 4 spaces for C#
    } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey) {
      onType(e.key);
    }
  };

  const renderCode = () => {
    const timeLeft = state.activeObstacle === 'NULL_REF' && state.obstacleEndTime 
      ? state.obstacleEndTime - Date.now() 
      : 0;
    
    // Total 11s:
    // [0s - 3s]: Warning (left > 8s)
    // [3s - 6s]: Blackout (left 5s - 8s)
    // [6s - 11s]: Blink (left <= 5s)
    const isWarning = state.activeObstacle === 'NULL_REF' && timeLeft > 8000;
    const isInvisible = state.activeObstacle === 'NULL_REF' && timeLeft > 5000 && timeLeft <= 8000;
    const isBlinking = state.activeObstacle === 'NULL_REF' && timeLeft <= 5000;

    return targetCode.split('').map((char, index) => {
      let className = 'char';
      if (index < userInput.length) {
        className += userInput[index] === char ? ' correct' : ' incorrect';
      } else if (index === userInput.length) {
        className += ' current';
      }

      if (index >= userInput.length) {
        if (isInvisible) {
          return <span key={index} className={className} style={{ opacity: 0 }}>{char === '\n' ? '↵\n' : char}</span>;
        }
        if (isBlinking) {
          className += ' blink-null';
        }
      }

      return (
        <span key={index} className={className} style={{ color: isWarning ? 'red' : 'inherit' }}>
          {char === '\n' ? '↵\n' : char}
        </span>
      );
    });
  };

  return (
    <div className="editor-area" onClick={handleEditorClick} onDoubleClick={handleEditorClick}>
      <div className="tab-bar">
        <div className="tab">Snippet.cs</div>
      </div>
      <div 
        className={`code-view ${state.activeObstacle === 'DEADLOCK' ? 'deadlock' : ''}`}
        tabIndex={0}
        ref={inputRef}
        onKeyDown={handleKeyDown}
        style={{ outline: 'none' }}
      >
        <div className="typed-code">
          {renderCode()}
        </div>
        
        {state.activeObstacle && (
          <div className="obstacle-overlay">
            {state.activeObstacle === 'DEADLOCK' && '--- THREAD DEADLOCK DETECTED ---'}
            {state.activeObstacle === 'UNRESOLVED_REF' && `--- UNRESOLVED REFERENCE: Alt+Enter to fix (${state.obstacleMetadata?.clicks || 0}/3) ---`}
            {state.activeObstacle === 'GARBAGE_COLLECTION' && '--- GARBAGE COLLECTION IN PROGRESS ---'}
            {state.activeObstacle === 'NULL_REF' && '--- NullReferenceException ---'}
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeWindow;
