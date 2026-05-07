import React, { useState, useEffect, useCallback } from 'react';
import { initialGameState, calculateWPM, calculateAccuracy, getNextObstacle, GameState, SnippetStat, Difficulty, DIFFICULTY_THRESHOLDS, getBugDuration, ObstacleType, generateRandomSnippet } from './logic/engine';
import { CSHARP_SNIPPETS } from './logic/csharp-snippets';
import IdeWindow from './components/IdeWindow';
import SolutionExplorer from './components/SolutionExplorer';
import OutputWindow from './components/OutputWindow';
import './styles/vs-dark.css';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>(initialGameState);
  const [logs, setLogs] = useState<string[]>(['Ready to compile...', 'Build started at ' + new Date().toLocaleTimeString()]);

  const currentSnippet = CSHARP_SNIPPETS[state.currentSnippetIndex];
  const currentUserInput = state.snippetInputs[state.currentSnippetIndex];

  const triggerBug = useCallback(() => {
    if (state.isGameOver || state.activeObstacle || state.showSnippetResult || state.enabledObstacles.length === 0) return;
    
    const possibleBugs = state.enabledObstacles;
    const bug = possibleBugs[Math.floor(Math.random() * possibleBugs.length)];
    
    setState(prev => ({
      ...prev,
      activeObstacle: bug,
      obstacleEndTime: Date.now() + getBugDuration(bug, prev.difficulty),
      obstacleMetadata: bug === 'UNRESOLVED_REF' ? { clicks: 0 } : null
    }));
    setLogs(prev => [...prev, `[BUG] ${bug} detected in build process!`]);
  }, [state.isGameOver, state.activeObstacle, state.showSnippetResult, state.enabledObstacles]);

  const toggleBug = (bug: ObstacleType) => {
    setState(prev => {
      const enabled = prev.enabledObstacles.includes(bug) 
        ? prev.enabledObstacles.filter(b => b !== bug) 
        : [...prev.enabledObstacles, bug];
      setLogs(l => [...l, `[CONFIG] ${bug} ${enabled.includes(bug) ? 'enabled' : 'disabled'}.`]);
      return { ...prev, enabledObstacles: enabled };
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) triggerBug();
    }, 5000);
    return () => clearInterval(interval);
  }, [triggerBug]);

  // Robust reset logic for obstacles
  useEffect(() => {
    if (state.activeObstacle && state.obstacleEndTime) {
      const remaining = state.obstacleEndTime - Date.now();
      
      if (remaining <= 0) {
        setState(prev => ({ ...prev, activeObstacle: null, obstacleEndTime: null, obstacleMetadata: null }));
        setLogs(prev => [...prev, `[FIX] Bug resolved automatically.`]);
        return;
      }

      const timer = setTimeout(() => {
        setState(prev => {
           if (!prev.activeObstacle) return prev;
           return { ...prev, activeObstacle: null, obstacleEndTime: null, obstacleMetadata: null };
        });
        setLogs(prev => [...prev, `[FIX] Bug resolved. Continuing build.`]);
      }, remaining);

      return () => clearTimeout(timer);
    }
  }, [state.activeObstacle, state.obstacleEndTime]);

  // Handle specialized bug fixes (Alt+Enter) - MODIFIED TO REQUIRE 3 PRESSES
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (state.activeObstacle === 'UNRESOLVED_REF' && e.altKey && e.key === 'Enter') {
        setState(prev => {
          const clicks = (prev.obstacleMetadata?.clicks || 0) + 1;
          if (clicks >= 3) {
            setLogs(l => [...l, `[FIX] Namespace imported. Build resumed.`]);
            return { ...prev, activeObstacle: null, obstacleEndTime: null, obstacleMetadata: null };
          }
          setLogs(l => [...l, `[RETRY] Ambiguous reference... retry (${clicks}/3)`]);
          return { ...prev, obstacleMetadata: { clicks } };
        });
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [state.activeObstacle]);

  const onBackspace = () => {
    if (state.showSnippetResult || state.isGameOver) return;
    setState(prev => {
      const newInputs = [...prev.snippetInputs];
      const targetCode = CSHARP_SNIPPETS[prev.currentSnippetIndex].code;
      const currentInput = newInputs[prev.currentSnippetIndex];
      if (currentInput.length === 0) return prev;

      // Check if the character we are removing was an error
      const wasError = currentInput[currentInput.length - 1] !== targetCode[currentInput.length - 1];

      newInputs[prev.currentSnippetIndex] = currentInput.slice(0, -1);
      
      const now = Date.now();
      const newSnippetErrors = wasError ? prev.snippetErrors - 1 : prev.snippetErrors;
      const newTotalErrors = wasError ? prev.totalErrors - 1 : prev.totalErrors;
      
      // Also decrement keypress counts
      const newSnippetKeyPresses = prev.snippetKeyPresses - 1;
      const newTotalKeyPresses = prev.totalKeyPresses - 1;

      const totalTyped = newInputs.join('');
      
      // Snippet-specific progress: use current progress, don't shrink on backspace (peak)
      const currentProgress = (newInputs[prev.currentSnippetIndex].length / targetCode.length) * 100;
      const snippetProgress = Math.max(prev.progress, currentProgress);

      return {
        ...prev,
        snippetInputs: newInputs,
        snippetErrors: newSnippetErrors,
        totalErrors: newTotalErrors,
        snippetKeyPresses: newSnippetKeyPresses,
        totalKeyPresses: newTotalKeyPresses,
        wpm: calculateWPM(totalTyped, prev.startTime || now, now),
        accuracy: calculateAccuracy(newTotalKeyPresses, newTotalErrors),
        progress: snippetProgress
      };
    });
  };

  // Garbage Collection Logic - REMOVED INTERNAL TIMEOUT, USES GLOBAL RESET
  useEffect(() => {
    if (state.activeObstacle === 'GARBAGE_COLLECTION') {
      const interval = setInterval(() => {
        onBackspace();
      }, 1500);

      return () => clearInterval(interval);
    }
  }, [state.activeObstacle, state.currentSnippetIndex]);

  // Forcing re-renders for real-time effects (like blinking)
  useEffect(() => {
    if (state.activeObstacle) {
      const interval = setInterval(() => {
        setState(prev => ({ ...prev, timerTick: prev.timerTick + 1 }));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [state.activeObstacle]);

  const onType = (text: string) => {
    if (state.activeObstacle === 'DEADLOCK' || state.isGameOver || state.showSnippetResult) return;

    setState(prev => {
      const now = Date.now();
      const targetCode = CSHARP_SNIPPETS[prev.currentSnippetIndex].code;
      const currentInput = prev.snippetInputs[prev.currentSnippetIndex];
      
      let tempInput = currentInput;
      let addedErrors = 0;
      let addedKeyPresses = 0;

      for (const char of text) {
        if (tempInput.length >= targetCode.length) break;
        addedKeyPresses++;
        if (char !== targetCode[tempInput.length]) {
          addedErrors++;
        }
        tempInput += char;
      }

      const newSnippetInputs = [...prev.snippetInputs];
      newSnippetInputs[prev.currentSnippetIndex] = tempInput;

      const newTotalKeyPresses = prev.totalKeyPresses + addedKeyPresses;
      const newTotalErrors = prev.totalErrors + addedErrors;
      const newSnippetKeyPresses = prev.snippetKeyPresses + addedKeyPresses;
      const newSnippetErrors = prev.snippetErrors + addedErrors;

      const totalTyped = newSnippetInputs.join('');
      // Snippet-specific progress: allow decrementing
      const snippetProgress = (tempInput.length / targetCode.length) * 100;

      const currentStats = {
        wpm: calculateWPM(totalTyped, prev.startTime || now, now),
        accuracy: calculateAccuracy(newTotalKeyPresses, newTotalErrors),
        progress: snippetProgress
      };

      // Check Completion based on length
      if (tempInput.length === targetCode.length && currentInput.length < targetCode.length) {
        const snippetWPM = calculateWPM(tempInput, prev.snippetStartTime || now, now);
        const snippetAccuracy = calculateAccuracy(newSnippetKeyPresses, newSnippetErrors);
        const threshold = DIFFICULTY_THRESHOLDS[prev.difficulty];

        if (snippetAccuracy >= threshold) {
          const newStats = [...prev.snippetStats];
          newStats[prev.currentSnippetIndex] = {
            wpm: snippetWPM,
            accuracy: snippetAccuracy,
            errors: newSnippetErrors,
            timeTaken: (now - (prev.snippetStartTime || now)) / 1000
          };

          if (newSnippetErrors > 0) {
            setTimeout(() => setLogs(l => [...l, `[ERROR] Build completed with syntax errors for ${CSHARP_SNIPPETS[prev.currentSnippetIndex].title}.cs. Outputting results.`]), 0);
          } else {
            setTimeout(() => setLogs(l => [...l, `[SUCCESS] ${CSHARP_SNIPPETS[prev.currentSnippetIndex].title}.cs compiled successfully.`]), 0);
          }

          return {
            ...prev,
            snippetInputs: newSnippetInputs,
            snippetStats: newStats,
            showSnippetResult: true,
            totalErrors: newTotalErrors,
            totalKeyPresses: newTotalKeyPresses,
            snippetErrors: newSnippetErrors,
            snippetKeyPresses: newSnippetKeyPresses,
            ...currentStats
          };
        } else {
          setTimeout(() => setLogs(l => [
            ...l, 
            `[FATAL] Build Failed for ${CSHARP_SNIPPETS[prev.currentSnippetIndex].title}.cs: Accuracy (${snippetAccuracy}%) below threshold for ${prev.difficulty} (${threshold}%).`,
            `[HINT] Use 'Build > Rebuild Current File' or click the Solution Header to restart this file.`
          ]), 0);
        }
      }

      return {
        ...prev,
        snippetInputs: newSnippetInputs,
        startTime: prev.startTime || now,
        snippetStartTime: prev.snippetStartTime || now,
        totalErrors: newTotalErrors,
        totalKeyPresses: newTotalKeyPresses,
        snippetErrors: newSnippetErrors,
        snippetKeyPresses: newSnippetKeyPresses,
        ...currentStats
      };
    });
  };

  const closeResult = () => {
    setState(prev => {
      const isLast = prev.currentSnippetIndex === CSHARP_SNIPPETS.length - 1;
      return {
        ...prev,
        showSnippetResult: false,
        currentSnippetIndex: isLast ? prev.currentSnippetIndex : prev.currentSnippetIndex + 1,
        snippetStartTime: null,
        snippetErrors: 0,
        snippetKeyPresses: 0,
        isGameOver: prev.progress >= 99.9,
        focusTrigger: prev.focusTrigger + 1
      };
    });
  };

  const onSelectSnippet = (index: number) => {
    if (state.isGameOver || state.showSnippetResult) return;
    setState(prev => {
      const newInputs = [...prev.snippetInputs];
      if (index >= newInputs.length) return prev;
      
      newInputs[index] = ''; 
      return { 
        ...prev, 
        currentSnippetIndex: index,
        snippetInputs: newInputs,
        snippetStartTime: null,
        snippetErrors: 0,
        snippetKeyPresses: 0,
        totalErrors: 0,
        totalKeyPresses: 0,
        focusTrigger: prev.focusTrigger + 1
      };
    });
    setLogs(prev => [...prev, `[BUILD] Initializing clean build for ${CSHARP_SNIPPETS[index].title}.cs...`]);
  };

  const rebuildCurrentFile = () => {
    setState(prev => {
      const newInputs = [...prev.snippetInputs];
      newInputs[prev.currentSnippetIndex] = '';
      return {
        ...prev,
        showSnippetResult: false,
        snippetStartTime: null,
        snippetErrors: 0,
        snippetKeyPresses: 0,
        totalErrors: 0,
        totalKeyPresses: 0,
        snippetInputs: newInputs,
        focusTrigger: prev.focusTrigger + 1
      };
    });
    setLogs(prev => [...prev, `[CLEAN] ${currentSnippet.title}.cs artifacts wiped.`]);
  };

  const resetGame = () => {
    setState(initialGameState);
    setLogs(['Solution cleaned.', 'Build started at ' + new Date().toLocaleTimeString()]);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        setLogs(prev => [...prev, `[ERROR] Could not enable full screen: ${err.message}`]);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDifficulty = e.target.value as Difficulty;
    setState(prev => ({ ...prev, difficulty: newDifficulty, focusTrigger: prev.focusTrigger + 1 }));
    setLogs(prev => [...prev, `[CONFIG] Compilation protocol set to ${newDifficulty}. Accuracy threshold: ${DIFFICULTY_THRESHOLDS[newDifficulty]}%.`]);
  };

  const triggerSpecificBug = (bug: ObstacleType) => {
    if (state.isGameOver || state.activeObstacle || state.showSnippetResult) return;
    
    setState(prev => ({
      ...prev,
      activeObstacle: bug,
      obstacleEndTime: Date.now() + getBugDuration(bug, prev.difficulty),
      obstacleMetadata: bug === 'UNRESOLVED_REF' ? { clicks: 0 } : null
    }));
    setLogs(prev => [...prev, `[BUG] ${bug} detected in build process!`]);
  };

  const currentStat = state.snippetStats[state.currentSnippetIndex];
  const isCorrectSoFar = currentSnippet.code.startsWith(currentUserInput);
  const isBufferFull = currentUserInput.length >= currentSnippet.code.length;

  return (
    <div className="ide-container">
      <div className="title-bar">Code Race - C# Compilation Protocol - {currentSnippet.title}.cs</div>
      <div className="menu-bar">
        <div className="menu-item">File</div>
        <div className="menu-item" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          View
          <div className="menu-dropdown-content">
             <div onClick={toggleFullScreen}>Toggle Full Screen</div>
          </div>
        </div>
        <div className="menu-item">Edit</div>
        <div className="menu-item" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          Build
          <div className="menu-dropdown-content">
             <div onClick={rebuildCurrentFile}>Rebuild Current File</div>
             <div onClick={() => {
                const newSnippet = generateRandomSnippet();
                const existingIndex = CSHARP_SNIPPETS.findIndex(s => s.title === 'Hard Randomized Sample');
                
                if (existingIndex !== -1) {
                  CSHARP_SNIPPETS[existingIndex] = newSnippet;
                  setState(prev => ({
                    ...prev,
                    currentSnippetIndex: existingIndex,
                    focusTrigger: prev.focusTrigger + 1
                  }));
                } else {
                  CSHARP_SNIPPETS.push(newSnippet);
                  setState(prev => ({
                    ...prev,
                    currentSnippetIndex: CSHARP_SNIPPETS.length - 1,
                    snippetInputs: [...prev.snippetInputs, ''],
                    snippetStats: [...prev.snippetStats, null],
                    focusTrigger: prev.focusTrigger + 1
                  }));
                }
                setLogs(prev => [...prev, `[BUILD] Loaded dynamic snippet: ${newSnippet.title}.cs`]);
             }}>Random Snippet</div>
             <div onClick={resetGame}>Clean & Rebuild Solution</div>
          </div>
        </div>
        <div className="menu-item" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          Difficulty:
          <select 
            value={state.difficulty} 
            onChange={handleDifficultyChange}
            className="difficulty-select"
          >
            <option value="EASY">Easy (50%)</option>
            <option value="NORMAL">Normal (70%)</option>
            <option value="HARD">Hard (90%)</option>
          </select>
        </div>
        <div className="menu-item" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          Settings
          <div className="menu-dropdown-content">
             <div onClick={() => setState(prev => ({ 
               ...prev, 
               enabledObstacles: prev.enabledObstacles.length > 0 ? [] : ['DEADLOCK', 'NULL_REF', 'UNRESOLVED_REF', 'GARBAGE_COLLECTION'] 
             }))} style={{ display: 'flex', alignItems: 'center' }}>
               <span className={`checkbox-icon ${state.enabledObstacles.length > 0 ? 'checked' : ''}`}></span> {state.enabledObstacles.length > 0 ? 'Disable All Bugs' : 'Enable All Bugs'}
             </div>
             <hr style={{ border: '0', borderTop: '1px solid #2b2b2b', margin: '5px 0' }} />
             {['DEADLOCK', 'NULL_REF', 'UNRESOLVED_REF', 'GARBAGE_COLLECTION'].map(bug => (
               <div key={bug} onClick={() => toggleBug(bug as ObstacleType)} style={{ display: 'flex', alignItems: 'center' }}>
                 <span className={`checkbox-icon ${state.enabledObstacles.includes(bug as ObstacleType) ? 'checked' : ''}`}></span> {bug}
               </div>
             ))}
          </div>
        </div>
        <div className="menu-item" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          Debug
          <div className="menu-dropdown-content">
             <div onClick={() => triggerSpecificBug('DEADLOCK')}>Trigger Deadlock</div>
             <div onClick={() => triggerSpecificBug('GARBAGE_COLLECTION')}>Trigger Garbage Collection</div>
             <div onClick={() => triggerSpecificBug('NULL_REF')}>Trigger Null Reference</div>
             <div onClick={() => triggerSpecificBug('UNRESOLVED_REF')}>Trigger Unresolved Ref</div>
          </div>
        </div>
      </div>
      <div className="main-content">
        <SolutionExplorer 
          currentIndex={state.currentSnippetIndex} 
          onReset={resetGame} 
          onSelect={onSelectSnippet}
          snippetInputs={state.snippetInputs}
        />
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <IdeWindow 
            state={state} 
            targetCode={currentSnippet.code} 
            userInput={currentUserInput}
            onType={onType} 
            onBackspace={onBackspace} 
          />
          <OutputWindow logs={logs} />
        </div>
      </div>
      
      {state.showSnippetResult && currentStat && (
        <div className="result-popup-overlay">
          <div className="result-card">
            <h1 className="hb-title">Build Result for {currentSnippet.title}.cs</h1>
            
            <div className="hb-main-stat">
              <div className="hb-value">{currentStat.wpm}</div>
              <div className="hb-label">WORDS PER MINUTE</div>
            </div>

            <div className="hb-stats-row">
              <div>
                <div className="hb-sub-value">{currentStat.accuracy}%</div>
                <div className="hb-sub-label">ACCURACY</div>
              </div>
              <div>
                <div className="hb-sub-value">{currentStat.errors}</div>
                <div className="hb-sub-label">SYNTAX ERRORS</div>
              </div>
            </div>

            <div className="hb-actions">
              <button className="btn-hb-secondary" onClick={rebuildCurrentFile}>TRY AGAIN</button>
              <button className="btn-hb-primary" onClick={closeResult}>
                {state.currentSnippetIndex === CSHARP_SNIPPETS.length - 1 ? 'FINALIZE SOLUTION' : 'NEXT PROJECT'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isBufferFull && !isCorrectSoFar && !state.showSnippetResult && (
        <div className="build-error-banner" style={{ position: 'absolute', bottom: '30px', right: '20px', padding: '10px', borderRadius: '2px', zIndex: 150, fontSize: '12px', fontWeight: 'bold' }}>
          {currentUserInput.length >= currentSnippet.code.length 
            ? `❌ BUILD FAILED: Accuracy (${calculateAccuracy(state.snippetKeyPresses, state.snippetErrors)}%) below threshold (${DIFFICULTY_THRESHOLDS[state.difficulty]}%). Fix errors or Rebuild!`
            : `⚠️ SYNTAX ERRORS: Reach end to attempt build (Min: ${DIFFICULTY_THRESHOLDS[state.difficulty]}% Accuracy)`}
        </div>
      )}

      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${state.progress}%` }}></div>
      </div>
      <div className="status-bar">
        <div>Ln 1, Col {currentUserInput.length + 1}</div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span>MODE: {state.difficulty}</span>
          <span>WPM: {state.wpm}</span>
          <span>ACCURACY: {state.accuracy}%</span>
          <span>PROGRESS: {Math.floor(state.progress)}%</span>
        </div>
        <div>UTF-8 | C#</div>
      </div>

      {state.isGameOver && !state.showSnippetResult && (
        <div className="result-popup-overlay">
          <div className="result-card">
            <h1 className="hb-title" style={{ color: '#6a9955' }}>SOLUTION COMPILED SUCCESSFULLY</h1>
            
            <div className="hb-main-stat">
              <div className="hb-value" style={{ color: '#6a9955' }}>{state.wpm}</div>
              <div className="hb-label">AVERAGE WPM</div>
            </div>

            <div className="hb-stats-row">
              <div>
                <div className="hb-sub-value">{state.accuracy}%</div>
                <div className="hb-sub-label">FINAL ACCURACY</div>
              </div>
              <div>
                <div className="hb-sub-value">{state.totalErrors}</div>
                <div className="hb-sub-label">TOTAL ERRORS</div>
              </div>
            </div>

            <button className="btn-hb-primary" onClick={resetGame}>RESTART NEW SOLUTION</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
