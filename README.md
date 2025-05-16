# DeskGenie - Your Personal Voice Assistant

DeskGenie is an intelligent voice assistant built with Electron and React that helps you manage your desktop tasks through natural voice commands. It combines the power of Vosk for voice recognition and Google's Gemini AI for natural language processing to provide a seamless voice-controlled desktop experience.

## 🌟 Features

- 🎤 **Voice Recognition**: Powered by Vosk for accurate speech-to-text conversion
- 🤖 **AI-Powered Understanding**: Uses Google's Gemini AI for natural language processing
- 🔄 **Automatic Updates**: Seamless updates via GitHub Releases
- 🔒 **License Management**: Trial and full license options
- 🎯 **Cross-Platform**: Works on Windows, macOS, and Linux
- 🎨 **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- 📧 **Email Integration**: Send emails using Gmail or Outlook
- 🎙️ **Voice Feedback**: Customizable voice responses
- 🔍 **Web Search**: Quick web searches through voice commands
- ⚡ **System Control**: Control your computer with voice commands

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- Git
- Google Cloud API Key (for Gemini AI)
- Vosk Model (automatically downloaded during installation)

## 🚀 Installation

1. **Clone the repository**:
```bash
git clone https://github.com/yourusername/deskgenie.git
cd deskgenie
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment variables**:
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_google_api_key
```

4. **Start development server**:
```bash
npm run dev
```

## 🏗️ Building the Application

### Development Build
```bash
npm run build
```

### Production Build
For all platforms:
```bash
npm run build:prod
```

For specific platforms:
```bash
# Windows
npm run build:prod:win

# macOS
npm run build:prod:mac

# Linux
npm run build:prod:linux
```

## 🧪 Testing

Run the test suite:
```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# E2E tests
npm run test:e2e
```

## 📝 Available Voice Commands

- **Application Control**:
  - "Open Chrome"
  - "Launch Notepad"
  - "Start Music Player"

- **System Commands**:
  - "What time is it?"
  - "Shutdown computer"
  - "Restart computer"

- **Web Search**:
  - "Search for [query]"
  - "Look up [query]"
  - "Find [query]"

- **Email**:
  - "Send email to [recipient]"
  - "Compose new email"
  - "Check my inbox"

## 🔧 Configuration

### Voice Settings
You can customize voice feedback settings:
- Verbosity level (full, minimal, mute)
- Voice speed
- Voice pitch
- Voice selection

### License Management
- Trial License: 14-day free trial
- Full License: Unlimited access to all features

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow the ESLint configuration
- Write tests for new features
- Update documentation
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Full Documentation](https://deskgenie.app/docs)
- **Issues**: [GitHub Issues](https://github.com/yourusername/deskgenie/issues)
- **Email**: support@deskgenie.app
- **Discord**: [Join our community](https://discord.gg/deskgenie)

## 🙏 Acknowledgments

- [Vosk](https://github.com/alphacep/vosk-api) for voice recognition
- [Google Gemini AI](https://ai.google.dev/) for natural language processing
- [Electron](https://www.electronjs.org/) for the desktop framework
- [React](https://reactjs.org/) for the UI framework
- [Tailwind CSS](https://tailwindcss.com/) for styling 