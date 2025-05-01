import React, { useState } from 'react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';

function MainInterface({ licenseInfo }) {
  const {
    isListening,
    transcription,
    status,
    currentAction,
    isSpeaking,
    voiceFeedbackEnabled,
    startListening,
    stopListening,
    toggleVoiceFeedback
  } = useVoiceRecognition();

  const [chatHistory, setChatHistory] = useState([]);

  const getStatusText = () => {
    if (isSpeaking) {
      return `${currentAction} | Speaking...`;
    }
    return status;
  };

  const handleIntentResult = (result) => {
    if (result.isGeminiResponse) {
      setChatHistory(prev => [...prev, {
        type: 'user',
        text: transcription
      }, {
        type: 'assistant',
        text: result.feedback
      }]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-center text-blue-400">
            DeskGenie
          </h1>
          {licenseInfo && (
            <div className="text-sm text-gray-400">
              {licenseInfo.isTrial ? (
                <span>Trial License - {new Date(licenseInfo.expiresAt).toLocaleDateString()}</span>
              ) : (
                <span>Full License</span>
              )}
            </div>
          )}
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  isListening ? 'bg-green-500 animate-pulse' : 
                  isSpeaking ? 'bg-blue-500 animate-pulse-slow' : 
                  'bg-gray-500'
                }`} />
                <span className="text-sm text-gray-400">{getStatusText()}</span>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={voiceFeedbackEnabled}
                      onChange={toggleVoiceFeedback}
                    />
                    <div className={`block w-14 h-8 rounded-full transition-colors ${
                      voiceFeedbackEnabled ? 'bg-blue-500' : 'bg-gray-600'
                    }`} />
                    <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                      voiceFeedbackEnabled ? 'transform translate-x-6' : ''
                    }`} />
                  </div>
                  <span className="text-sm text-gray-400">Voice Feedback</span>
                </label>
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {isListening ? 'Stop' : 'Start'} Listening
                </button>
              </div>
            </div>

            {transcription && (
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-300">Transcription:</p>
                <p className="text-blue-400">{transcription}</p>
              </div>
            )}

            {currentAction && !chatHistory.length && (
              <div className="bg-gray-700 rounded-lg p-4 animate-fade-in">
                <p className="text-sm text-gray-300">Action:</p>
                <p className="text-green-400">{currentAction}</p>
              </div>
            )}

            {chatHistory.length > 0 && (
              <div className="space-y-4 mt-4">
                {chatHistory.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-200'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Try saying: "open chrome", "play music", or ask me anything!</p>
        </div>
      </div>
    </div>
  );
}

export default MainInterface; 