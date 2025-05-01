const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

class GeminiService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not found in environment variables');
      return;
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    this.chat = this.model.startChat({
      history: [
        {
          role: 'user',
          parts: 'You are DeskGenie, a helpful AI assistant. Keep your responses concise and actionable.',
        },
        {
          role: 'model',
          parts: 'I understand. I will provide concise and actionable responses as DeskGenie.',
        },
      ],
    });
  }

  async askGemini(prompt) {
    try {
      if (!this.model) {
        throw new Error('Gemini model not initialized. Please check your API key.');
      }

      const result = await this.chat.sendMessage(prompt);
      const response = await result.response;
      return {
        success: true,
        text: response.text(),
      };
    } catch (error) {
      console.error('Error querying Gemini:', error);
      return {
        success: false,
        text: 'I apologize, but I encountered an error processing your request.',
      };
    }
  }
}

module.exports = new GeminiService(); 