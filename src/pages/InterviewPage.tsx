import { useState, useEffect } from 'react';
import { AudioVisualizer } from '@/components/AudioVisualizer';
import { LiveFeedback } from '@/components/LiveFeedback';
import { Button } from '@/components/ui/button';
import { useInterviewStream } from '@/hooks/useInterviewStream';
import { InterviewData, InterviewSettings, APIKeys } from '@/types/interview';

interface InterviewPageProps {
  interviewData: InterviewData;
  settings: InterviewSettings;
  apiKeys: APIKeys;
  onEndInterview: (transcripts: any[], duration: number) => void;
}

export function InterviewPage({ 
  interviewData, 
  settings, 
  apiKeys, 
  onEndInterview 
}: InterviewPageProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(settings.duration * 60);
  const [transcripts, setTranscripts] = useState<any[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isSpeechBuffering, setIsSpeechBuffering] = useState(false);
  const [liveFeedbackSuggestions, setLiveFeedbackSuggestions] = useState([
    {
      id: '1',
      title: 'Recruiter asked why you would be a good fit',
      description: 'Mention how your hobby of [blank] aligns with the companies mission.'
    },
    {
      id: '2',
      title: 'Lorem Ipsum',
      description: 'Dolor sit amet'
    }
  ]);
  const [interviewerSpeaking, setInterviewerSpeaking] = useState(false);

  const {
    isListening,
    isSpeaking,
    audioLevel,
    interviewerAudioLevel,
    startListening,
    stopListening,
    sendTranscriptToAPI
  } = useInterviewStream({
    apiKeys,
    interviewData,
    voice: settings.voice,
    onTranscript: (transcript, isFinal) => {
      // Always update the current transcript for display
      setCurrentTranscript(transcript);
      
      // Set buffering state based on whether we have a transcript
      setIsSpeechBuffering(transcript.trim().length > 0);
      
      // Only process final transcripts
      if (isFinal && transcript.trim().length > 0) {
        const newTranscript = {
          speaker: 'user',
          text: transcript,
          timestamp: new Date()
        };
        setTranscripts(prev => [...prev, newTranscript]);
        
        // Only send to API if the transcript is substantial
        if (transcript.trim().length > 3) {
          sendTranscriptToAPI(transcript, transcripts);
        }
        setCurrentTranscript('');
        setIsSpeechBuffering(false);
      }
    },
    onInterviewerSpeaking: setInterviewerSpeaking,
    onError: (error) => {
      console.error('Interview error:', error);
    }
  });

  // Timer effect
  useEffect(() => {
    if (!isPaused && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleEndInterview();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isPaused, timeRemaining]);

  // Start listening when component mounts
  useEffect(() => {
    startListening();
    return () => stopListening();
  }, []);

  const handleEndInterview = () => {
    stopListening();
    const duration = (settings.duration * 60) - timeRemaining;
    onEndInterview(transcripts, duration);
  };

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
    if (isPaused) {
      startListening();
    } else {
      stopListening();
    }
  };

  const handleFeedbackAccept = (suggestionId: string) => {
    setLiveFeedbackSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  const handleFeedbackIgnore = (suggestionId: string) => {
    setLiveFeedbackSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m, ${secs}s`;
  };

  // Extract company name and position from job description for header
  const getInterviewTitle = () => {
    // Simple extraction - in real app would use more sophisticated parsing
    const companyMatch = interviewData.jobDescription.match(/company[:\s]+([^\n,.]+)/i);
    const positionMatch = interviewData.jobDescription.match(/position[:\s]+([^\n,.]+)/i) || 
                         interviewData.jobDescription.match(/role[:\s]+([^\n,.]+)/i);
    
    const company = companyMatch?.[1]?.trim() || '[company name]';
    const position = positionMatch?.[1]?.trim() || '[position title]';
    
    return `[User's name] interview at ${company} for ${position}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-purple-200 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-4 border-black bg-white p-4 shadow-[8px_8px_0_0_#000]">
          <h1 className="text-2xl font-bold">{getInterviewTitle()}</h1>
        </div>

        {/* Time remaining */}
        {settings.timeRemaining && (
          <div className="border-4 border-black bg-white p-4 shadow-[4px_4px_0_0_#000] w-fit">
            <p className="font-bold">Time remaining: {formatTime(timeRemaining)}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Live feedback */}
          <div className="space-y-6">
            {settings.liveFeedback && (
              <LiveFeedback
                suggestions={liveFeedbackSuggestions}
                onAccept={handleFeedbackAccept}
                onIgnore={handleFeedbackIgnore}
              />
            )}
          </div>

          {/* Right columns - Audio visualizers */}
          <div className="lg:col-span-2 space-y-6">
            <AudioVisualizer
              audioLevel={interviewerAudioLevel}
              isActive={interviewerSpeaking}
              title="Interviewer live audio visualizer"
            />

            <AudioVisualizer
              audioLevel={audioLevel}
              isActive={isSpeaking && isListening}
              title="User live audio visualizer"
              isBuffering={isSpeechBuffering}
            />

            {/* Current transcript display */}
            {currentTranscript && (
              <div className="border-4 border-black bg-yellow-100 p-4 shadow-[4px_4px_0_0_#000]">
                <p className="text-sm text-gray-600 mb-1">You're saying:</p>
                <p className="font-medium">{currentTranscript}</p>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-end gap-4">
              <Button
                onClick={handlePauseToggle}
                className="bg-red-500 hover:bg-red-600 text-white border-2 border-black shadow-[4px_4px_0_0_#000]"
              >
                {isPaused ? 'Resume Interview' : 'Pause Interview'}
              </Button>
              <Button
                onClick={handleEndInterview}
                className="bg-blue-500 hover:bg-blue-600 text-white border-2 border-black shadow-[4px_4px_0_0_#000]"
              >
                End Interview
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}