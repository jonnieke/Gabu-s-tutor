# 🎓 Gabu's Tutor - AI-Powered Learning Assistant

An intelligent tutoring application that helps learners understand any subject through multiple input methods including camera scanning, voice recording, image upload, and interactive diagram generation.

## ✨ Features

### 📱 Input Methods
1. **📷 Camera Scanning** - Real-time document and text recognition
2. **🎤 Voice Recording** - Record questions with professional audio interface
3. **🖼️ Image Upload** - Upload photos for analysis and explanation
4. ** Create Diagrams** - Generate educational diagrams with interactive quizzes
5. **📁 Audio Upload** - Upload pre-recorded audio files

### 🧠 AI-Powered Learning
- **Gemini AI Integration** - Advanced text and image analysis
- **Educational Diagram Generation** - Visual learning with interactive quizzes
- **Progress Tracking** - Monitor learning journey and achievements
- **Bookmark System** - Save important topics for later review
- **Adaptive Learning** - Personalized content based on user preferences

### 🎨 User Experience
- **Modern UI/UX** - Clean, intuitive interface with smooth animations
- **Responsive Design** - Works perfectly on desktop and mobile devices
- **Voice Recording** - Professional recording interface with visual feedback
- **Navigation** - Easy navigation with Home buttons across all screens
- **Settings Management** - Customizable learning preferences

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Google AI Studio API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jonnieke/Gabu-s-tutor.git
   cd Gabu-s-tutor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini AI
- **Audio Processing**: Web Audio API, MediaRecorder
- **Image Processing**: Canvas API, File API
- **State Management**: React Hooks
- **Build Tool**: Vite

## 📁 Project Structure

```
Gabu-s-tutor/
├── components/           # React components
│   ├── IdleScreen.tsx   # Main landing screen
│   ├── TutorResponse.tsx # AI response display
│   ├── IllustrateView.tsx # Diagram generation
│   ├── AudioRecordingModal.tsx # Voice recording
│   └── ...
├── services/            # API services
│   ├── geminiService.ts # AI integration
│   ├── illustrateService.ts # Diagram generation
│   └── ...
├── hooks/              # Custom React hooks
├── types.ts           # TypeScript type definitions
└── ...
```

## 🎯 Key Features Explained

### Voice Recording
- Professional recording interface with visual feedback
- Real-time recording indicators (pulsing, ping effects)
- Audio playback and retake functionality
- Support for multiple audio formats

### Educational Diagrams
- AI-generated educational diagrams
- Interactive quizzes based on diagram content
- Clean, label-free images for better learning
- Optimized for low bandwidth connections

### Camera Integration
- Real-time document scanning
- Text recognition and analysis
- Support for various document types
- Instant AI-powered explanations

## 🔧 Configuration

### Environment Variables
- `GEMINI_API_KEY`: Your Google AI Studio API key
- `GCS_UPLOAD_URL`: Google Cloud Storage upload URL (optional)
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name (optional)

### API Setup
1. Get your API key from [Google AI Studio](https://aistudio.google.com/)
2. Add the key to your `.env` file
3. Ensure you have the necessary permissions for image generation

## 📱 Usage

1. **Start Learning**: Choose your preferred input method
2. **Ask Questions**: Use voice, camera, or upload files
3. **Get Explanations**: Receive AI-powered, personalized responses
4. **Create Diagrams**: Generate visual learning materials
5. **Track Progress**: Monitor your learning journey
6. **Save Bookmarks**: Keep important topics for later

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy to Vercel/Netlify
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for powerful language processing
- React community for excellent documentation
- Tailwind CSS for beautiful styling
- All contributors who helped improve this project

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/jonnieke/Gabu-s-tutor/issues) page
2. Create a new issue with detailed description
3. Contact the maintainers

---

**Made with ❤️ for learners everywhere**