import { useState, useEffect, useCallback } from 'react';

export const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [status, setStatus] = useState('Idle');
  const [useVosk, setUseVosk] = useState(false);
  const [currentAction, setCurrentAction] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState(true);

  // Check if Vosk is available and get voice feedback setting
  useEffect(() => {
    const initialize = async () => {
      try {
        // Start measuring initialization time
        await window.electron.ipcRenderer.startMeasure('voice-init');
        
        const [isVoskAvailable, isVoiceEnabled] = await Promise.all([
          window.electron.ipcRenderer.invoke('start-recognition'),
          window.electron.ipcRenderer.invoke('get-voice-feedback')
        ]);
        
        setUseVosk(isVoskAvailable);
        setVoiceFeedbackEnabled(isVoiceEnabled);
        
        // End measuring initialization time
        const initTime = await window.electron.ipcRenderer.endMeasure('voice-init');
        if (initTime > 1000) {
          console.warn(`Voice initialization took ${initTime.toFixed(2)}ms`);
        }
      } catch (error) {
        console.error('Failed to initialize voice recognition:', error);
        setStatus('Error initializing voice recognition');
      }
    };
    
    initialize();

    // Listen for speech completion
    const handleSpeechComplete = () => {
      setIsSpeaking(false);
      setStatus('Idle');
    };

    window.electron.ipcRenderer.on('speech-complete', handleSpeechComplete);
    return () => {
      window.electron.ipcRenderer.removeListener('speech-complete', handleSpeechComplete);
    };
  }, []);

  const toggleVoiceFeedback = async () => {
    try {
      const newState = !voiceFeedbackEnabled;
      await window.electron.ipcRenderer.invoke('set-voice-feedback', newState);
      setVoiceFeedbackEnabled(newState);
    } catch (error) {
      console.error('Failed to toggle voice feedback:', error);
    }
  };

  const startListening = useCallback(async () => {
    try {
      await window.electron.ipcRenderer.startMeasure('start-listening');
      
      if (!useVosk) {
        setStatus('Voice recognition not available');
        return;
      }

      setIsListening(true);
      setStatus('Listening...');
      setTranscription('');
      
      const startTime = await window.electron.ipcRenderer.endMeasure('start-listening');
      window.electron.ipcRenderer.trackMetric('startListeningTime', startTime);
    } catch (error) {
      console.error('Failed to start listening:', error);
      setStatus('Error starting voice recognition');
      setIsListening(false);
    }
  }, [useVosk]);

  const stopListening = useCallback(async () => {
    try {
      await window.electron.ipcRenderer.startMeasure('stop-listening');
      
      setIsListening(false);
      setStatus('Processing...');
      
      const stopTime = await window.electron.ipcRenderer.endMeasure('stop-listening');
      window.electron.ipcRenderer.trackMetric('stopListeningTime', stopTime);
    } catch (error) {
      console.error('Failed to stop listening:', error);
      setStatus('Error stopping voice recognition');
    }
  }, []);

  const processAudio = useCallback(async (audioData) => {
    try {
      if (!isListening) return;

      await window.electron.ipcRenderer.startMeasure('process-audio');
      
      const text = await window.electron.ipcRenderer.invoke('process-audio', audioData);
      if (text) {
        setTranscription(text);
        setStatus('Processing intent...');
        
        const result = await window.electron.ipcRenderer.invoke('process-intent', text);
        setCurrentAction(result.action);
        setIsSpeaking(true);
      }
      
      const processTime = await window.electron.ipcRenderer.endMeasure('process-audio');
      window.electron.ipcRenderer.trackMetric('audioProcessingTime', processTime);
    } catch (error) {
      console.error('Error processing audio:', error);
      setStatus('Error processing audio');
    }
  }, [isListening]);

  return {
    isListening,
    transcription,
    status,
    currentAction,
    isSpeaking,
    voiceFeedbackEnabled,
    startListening,
    stopListening,
    toggleVoiceFeedback,
    processAudio
  };
}; 