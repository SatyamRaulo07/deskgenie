import { useState, useEffect, useCallback } from 'react';
const { ipcRenderer } = window.require('electron');

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
      const [isVoskAvailable, isVoiceEnabled] = await Promise.all([
        ipcRenderer.invoke('start-recognition'),
        ipcRenderer.invoke('get-voice-feedback')
      ]);
      setUseVosk(isVoskAvailable);
      setVoiceFeedbackEnabled(isVoiceEnabled);
    };
    initialize();

    // Listen for speech completion
    const handleSpeechComplete = () => {
      setIsSpeaking(false);
      setStatus('Idle');
    };

    ipcRenderer.on('speech-complete', handleSpeechComplete);
    return () => {
      ipcRenderer.removeListener('speech-complete', handleSpeechComplete);
    };
  }, []);

  const toggleVoiceFeedback = async () => {
    const newState = !voiceFeedbackEnabled;
    await ipcRenderer.invoke('set-voice-feedback', newState);
    setVoiceFeedbackEnabled(newState);
  };

  const processIntent = async (text) => {
    if (!text) return;
    
    setStatus('Processing...');
    const result = await ipcRenderer.invoke('process-intent', text);
    setCurrentAction(result.action);
    
    if (voiceFeedbackEnabled) {
      setIsSpeaking(true);
      setStatus('Speaking...');
    } else {
      // Reset status after a delay if voice feedback is disabled
      setTimeout(() => {
        setStatus('Idle');
        setCurrentAction('');
      }, 3000);
    }
  };

  const startListening = useCallback(async () => {
    setIsListening(true);
    setStatus('Listening...');
    setTranscription('');
    setCurrentAction('');
    setIsSpeaking(false);

    if (useVosk) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);

        source.connect(processor);
        processor.connect(audioContext.destination);

        processor.onaudioprocess = async (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          const result = await ipcRenderer.invoke('process-audio', inputData);
          if (result) {
            setTranscription(result);
          }
        };

        return () => {
          stream.getTracks().forEach(track => track.stop());
          audioContext.close();
        };
      } catch (error) {
        console.error('Error accessing microphone:', error);
        setStatus('Error accessing microphone');
        setIsListening(false);
      }
    } else {
      // Fallback to Web Speech API
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setTranscription(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setStatus('Error: ' + event.error);
        setIsListening(false);
      };

      recognition.start();
      return () => recognition.stop();
    }
  }, [useVosk]);

  const stopListening = useCallback(async () => {
    setIsListening(false);
    setStatus('Processing...');
    
    // Process the final transcription
    await processIntent(transcription);
  }, [transcription]);

  return {
    isListening,
    transcription,
    status,
    currentAction,
    isSpeaking,
    voiceFeedbackEnabled,
    startListening,
    stopListening,
    toggleVoiceFeedback
  };
}; 