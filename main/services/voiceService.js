const say = require('say');
const { promisify } = require('util');

class VoiceService {
  constructor() {
    this.speakAsync = promisify(say.speak);
    this.verbosityLevel = 'full'; // 'full', 'minimal', 'mute'
    this.voice = null; // Will be set based on platform
    this.speed = 1.0;
    this.pitch = 1.0;

    // Initialize voice based on platform
    this.initializeVoice();
  }

  initializeVoice() {
    // Set default voice based on platform
    if (process.platform === 'win32') {
      this.voice = 'Microsoft David Desktop';
    } else if (process.platform === 'darwin') {
      this.voice = 'Samantha';
    } else {
      this.voice = null; // Use system default
    }
  }

  setVerbosity(level) {
    if (['full', 'minimal', 'mute'].includes(level)) {
      this.verbosityLevel = level;
      return true;
    }
    return false;
  }

  setVoice(voice) {
    this.voice = voice;
  }

  setSpeed(speed) {
    this.speed = Math.max(0.5, Math.min(2.0, speed));
  }

  setPitch(pitch) {
    this.pitch = Math.max(0.5, Math.min(2.0, pitch));
  }

  async speak(text, options = {}) {
    if (this.verbosityLevel === 'mute') {
      return;
    }

    const {
      isGeminiResponse = false,
      isActionConfirmation = false,
      isChainedAction = false
    } = options;

    let finalText = text;

    // Add conversational polish based on context
    if (isGeminiResponse) {
      finalText = `Here's my take on that: ${text}`;
    } else if (isActionConfirmation) {
      if (isChainedAction) {
        finalText = `Next step: ${text}`;
      } else {
        finalText = `Sure, ${text.toLowerCase()}`;
      }
    }

    // Adjust verbosity for minimal mode
    if (this.verbosityLevel === 'minimal') {
      if (isGeminiResponse) {
        finalText = text; // Remove the conversational polish
      }
    }

    try {
      await this.speakAsync(finalText, this.voice, this.speed, (err) => {
        if (err) {
          console.error('Error speaking:', err);
        }
      });
    } catch (error) {
      console.error('Error in speech synthesis:', error);
    }
  }

  async speakChainedActions(actions) {
    for (const action of actions) {
      await this.speak(action.text, {
        isActionConfirmation: true,
        isChainedAction: true
      });
    }
  }
}

module.exports = new VoiceService(); 