import React from 'react';

interface OutputWindowProps {
  logs: string[];
}

const OutputWindow: React.FC<OutputWindowProps> = ({ logs }) => {
  return (
    <div style={{ height: '150px', background: '#1e1e1e', borderTop: '1px solid #2b2b2b', padding: '10px', overflowY: 'auto' }}>
      <div style={{ fontSize: '11px', color: '#858585', marginBottom: '5px' }}>OUTPUT</div>
      <div style={{ fontFamily: 'Consolas, monospace', fontSize: '12px' }}>
        {logs.map((log, i) => (
          <div key={i} style={{ color: log.includes('error') || log.includes('[BUG]') ? '#f48771' : '#d4d4d4' }}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OutputWindow;
