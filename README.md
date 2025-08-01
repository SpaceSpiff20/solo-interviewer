# Solo Interviewer

An AI-powered mock interview application that conducts realistic job interviews using speech recognition and text-to-speech.

## Features

- **Real-time Speech Recognition**: Uses Deepgram for accurate speech-to-text conversion
- **AI Interviewer**: Powered by OpenAI GPT-4 for intelligent interview responses
- **High-Quality Voice Synthesis**: 
  - **Speechify** (Premium): Oliver voice for enhanced quality
  - **OpenAI TTS** (Standard): Multiple voice options (Alloy, Echo, Fable, Onyx, Nova, Shimmer)
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
   - Used for AI interview responses and fallback TTS
   - Get one at [OpenAI Platform](https://platform.openai.com/)

2. **Deepgram API Key** (Required)
   - Used for speech recognition
   - Get one at [Deepgram](https://deepgram.com/)

3. **Speechify API Key** (Optional)
   - Used for premium voice quality (Oliver voice)
   - Get one at [Speechify](https://speechify.com/)

### Running the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Voice Options

### Speechify Voices (Premium)
- **Oliver**: High-quality, natural-sounding voice (requires Speechify API key)

### OpenAI Voices (Standard)
- **Alloy**: Neutral, professional voice
- **Echo**: Warm, friendly voice
- **Fable**: Clear, articulate voice
- **Onyx**: Deep, authoritative voice
- **Nova**: Bright, energetic voice
- **Shimmer**: Soft, gentle voice

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

## Speechify Integration

The application now supports Speechify's premium voice synthesis for enhanced interview quality. When a Speechify API key is provided, the system will:

1. Use Speechify's Oliver voice for premium quality
2. Fall back to OpenAI TTS if Speechify is unavailable
3. Automatically select the appropriate TTS service based on voice choice

### Speechify Configuration

To use Speechify voices:
1. Sign up for a Speechify API key
2. Enter the key in the API Keys form
3. Select "Oliver (Speechify - Premium)" as your voice
4. The system will automatically use Speechify for TTS

### Voice Mapping

- **Oliver**: Uses Speechify (if API key provided) or OpenAI Alloy (fallback)
- **All other voices**: Use OpenAI TTS directly

## License

MIT License 