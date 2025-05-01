# DeskGenie - Your Personal Voice Assistant

DeskGenie is an intelligent voice assistant built with Electron and React that helps you manage your desktop tasks through natural voice commands.

## Features

- 🎤 Voice recognition using Vosk
- 🤖 Natural language processing with Google's Generative AI
- 🔄 Automatic updates via GitHub Releases
- 🔒 License management system
- 🎯 Cross-platform support (Windows, macOS, Linux)
- 🎨 Modern and intuitive user interface

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/deskgenie.git
cd deskgenie
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Building the Application

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

## Configuration

1. Update the GitHub repository information in `package.json`:
```json
"publish": {
  "provider": "github",
  "owner": "yourusername",
  "repo": "deskgenie",
  "private": false,
  "releaseType": "release"
}
```

2. Create a `.env` file in the root directory with your API keys:
```
GOOGLE_API_KEY=your_google_api_key
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

If you encounter any issues or have questions, please open an issue in the GitHub repository. 