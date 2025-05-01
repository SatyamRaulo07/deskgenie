import React, { useEffect } from 'react';
import { MicrophoneIcon } from '@heroicons/react/24/solid';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';

function App() {
  const {
    isListening,
    transcription,
    status,
    startListening,
    stopListening
  } = useVoiceRecognition();

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-dark-bg p-8">
      <div className="glass-card p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-8 text-neon-blue">
          Hi, I'm DeskGenie — Your Personal Voice Assistant
        </h1>
        
        <div className="flex flex-col items-center gap-6">
          <button 
            className={`mic-button ${isListening ? 'active' : ''}`}
            onClick={handleMicClick}
          >
            <MicrophoneIcon className="w-12 h-12 text-neon-blue" />
          </button>
          
          <div className="text-sm font-medium text-gray-300">
            {status}
          </div>

          {transcription && (
            <div className="mt-4 p-4 glass-card w-full text-left">
              <p className="text-gray-200">{transcription}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App; 