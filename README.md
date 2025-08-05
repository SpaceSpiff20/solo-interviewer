# Solo Interviewer

An AI-powered mock interview application that conducts realistic job interviews using speech recognition and text-to-speech.

## Features

- **Real-time Speech Recognition**: Uses Deepgram for accurate speech-to-text conversion
- **AI Interviewer**: Powered by OpenAI GPT-4 for intelligent interview responses
- **High-Quality Voice Synthesis**:
  - **Speechify** : Multiple premium voice options (Oliver, Geoge, Henry, Lisa, Emily)
- **Live Audio Visualization**: Real-time audio level monitoring
- **Interview Customization**: Duration, voice selection, and feature toggles
- **Live Feedback**: Real-time suggestions during interviews

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

### API Keys Required

You'll need the following API keys:

1. **OpenAI API Key** (Required)
   - Used to generate AI interview responses
   - Get one at [OpenAI Platform](https://platform.openai.com/)

2. **Deepgram API Key** (Required)
   - Used for speech recognition
   - Get one at [Deepgram](https://deepgram.com/)

3. **Speechify API Key** (Required)
   - Used for premium voice quality
   - Get one at [Speechify](https://speechify.com/)

### Running the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Voice Options

### Speechify Voices

- **Oliver**: English
- **Geoge**: English
- **Henry**: English
- **Lisa**: English
- **Emily**: English

## Usage

1. **Setup**: Enter your API keys and interview details
2. **Configure**: Choose interview duration, voice, and features
3. **Start Interview**: Begin your mock interview
4. **Speak**: Respond to the AI interviewer's questions naturally
5. **Review**: Get feedback and save your interview session

## Technical Details

### Architecture

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + Radix UI components
- **Speech Recognition**: Deepgram WebSocket API
- **AI**: OpenAI GPT-4 for interview responses
- **TTS**: Speechify (premium) or OpenAI TTS (fallback)
- **Deployment**: Vercel

### Key Components

- `useInterviewStream`: Manages speech recognition and TTS
- `InterviewPage`: Main interview interface
- `AudioVisualizer`: Real-time audio level display
- `LiveFeedback`: Real-time interview suggestions

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

### Speechify Configuration

To use Speechify voices:

1. Sign up for a Speechify API key
2. Enter the key in the API Keys form
3. Select your preferred voice from the available options
4. The system will automatically use Speechify for TTS

## License

MIT License
