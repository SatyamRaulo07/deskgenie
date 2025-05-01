const nlp = require('compromise');
const shell = require('shelljs');
const { exec } = require('child_process');
const path = require('path');
const geminiService = require('./geminiService');
const voiceService = require('./voiceService');

class IntentService {
  constructor() {
    this.isWindows = process.platform === 'win32';
    this.intents = {
      openApp: {
        patterns: ['open', 'launch', 'start'],
        apps: {
          chrome: {
            windows: 'start chrome',
            mac: 'open -a "Google Chrome"',
            feedback: 'opening Google Chrome for you'
          },
          notepad: {
            windows: 'notepad',
            mac: 'open -a TextEdit',
            feedback: 'opening Notepad for you'
          },
          music: {
            windows: 'start wmplayer',
            mac: 'open -a Music',
            feedback: 'launching the music player'
          }
        }
      },
      search: {
        patterns: ['search for', 'look up', 'find'],
        action: (query) => {
          const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
          const command = this.isWindows ? `start ${searchUrl}` : `open ${searchUrl}`;
          shell.exec(command);
          return `searching for "${query}" online`;
        }
      },
      shutdown: {
        patterns: ['shutdown', 'turn off', 'power off'],
        action: () => {
          const command = this.isWindows ? 'shutdown /s /t 60' : 'shutdown -h +1';
          shell.exec(command);
          return 'shutting down your system in 1 minute';
        }
      },
      time: {
        patterns: ['what time', 'current time', 'tell me the time'],
        action: () => {
          const now = new Date();
          const timeStr = now.toLocaleTimeString();
          return `it's ${timeStr}`;
        }
      }
    };
  }

  async recognizeIntent(text) {
    const doc = nlp(text.toLowerCase());
    
    // Check for app opening intent
    for (const [app, config] of Object.entries(this.intents.openApp.apps)) {
      if (doc.has(app)) {
        const command = this.isWindows ? config.windows : config.mac;
        shell.exec(command);
        return {
          intent: 'openApp',
          action: `Opening ${app}...`,
          feedback: config.feedback,
          isActionConfirmation: true
        };
      }
    }

    // Check for search intent
    if (doc.has(this.intents.search.patterns)) {
      const query = text.replace(/search for|look up|find/i, '').trim();
      const feedback = this.intents.search.action(query);
      return {
        intent: 'search',
        action: `Searching for "${query}"...`,
        feedback,
        isActionConfirmation: true
      };
    }

    // Check for shutdown intent
    if (doc.has(this.intents.shutdown.patterns)) {
      const feedback = this.intents.shutdown.action();
      return {
        intent: 'shutdown',
        action: 'Shutting down the system...',
        feedback,
        isActionConfirmation: true
      };
    }

    // Check for time intent
    if (doc.has(this.intents.time.patterns)) {
      const feedback = this.intents.time.action();
      return {
        intent: 'time',
        action: 'Getting current time...',
        feedback,
        isActionConfirmation: true
      };
    }

    // If no intent is recognized, use Gemini
    try {
      const geminiResponse = await geminiService.askGemini(text);
      return {
        intent: 'gemini',
        action: 'Processing your request...',
        feedback: geminiResponse.text,
        isGeminiResponse: true
      };
    } catch (error) {
      console.error('Error getting Gemini response:', error);
      return {
        intent: 'unknown',
        action: 'I did not understand that command.',
        feedback: 'I did not understand that command.',
        isActionConfirmation: true
      };
    }
  }

  speakResponse(text, callback) {
    voiceService.speak(text, (err) => {
      if (err) {
        console.error('Error speaking:', err);
      }
      if (callback) {
        callback();
      }
    });
  }
}

module.exports = new IntentService(); 