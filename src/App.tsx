import { useState } from 'react';
import { LandingPage } from '@/pages/LandingPage';
import { SetupPage } from '@/pages/SetupPage';
import { InterviewPage } from '@/pages/InterviewPage';
import { InterviewReflection } from '@/components/InterviewReflection';
import { InterviewPhase, InterviewData, InterviewSettings, APIKeys, FeedbackMoment } from '@/types/interview';

function App() {
  const [currentPhase, setCurrentPhase] = useState<InterviewPhase>('landing');
  const [interviewData, setInterviewData] = useState<InterviewData>({
    jobDescription: '',
    resume: '',
    coverLetter: ''
  });
  const [settings, setSettings] = useState<InterviewSettings>({
    duration: 15,
    language: 'en',
    voice: 'oliver',
    allowEarlyEnd: true,
    liveFeedback: true,
    timeRemaining: true,
    postReflection: true
  });
  const [apiKeys, setApiKeys] = useState<APIKeys>({
    deepgram: '',
    speechify: '',
    openai: ''
  });
  const [interviewResults, setInterviewResults] = useState<{
    transcripts: any[];
    duration: number;
    summary?: string;
    feedbackMoments?: FeedbackMoment[];
  }>({
    transcripts: [],
    duration: 0
  });

  const handleLogin = (email: string) => {
    setCurrentPhase('setup');
  };

  const handleStartInterview = (data: InterviewData, interviewSettings: InterviewSettings, keys: APIKeys) => {
    setInterviewData(data);
    setSettings(interviewSettings);
    setApiKeys(keys);
    setCurrentPhase('interview');
  };

  const handleEndInterview = async (transcripts: any[], duration: number) => {
    if (settings.postReflection) {
      // Generate reflection using API
      try {
        const response = await fetch('/api/reflection', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transcripts,
            interviewData,
            duration,
            apiKeys
          })
        });

        if (response.ok) {
          const reflection = await response.json();
          setInterviewResults({
            transcripts,
            duration,
            summary: reflection.summary,
            feedbackMoments: reflection.feedbackMoments
          });
        } else {
          // Fallback if reflection API fails
          setInterviewResults({
            transcripts,
            duration,
            summary: "Interview completed successfully. Detailed analysis unavailable.",
            feedbackMoments: []
          });
        }
      } catch (error) {
        console.error('Failed to generate reflection:', error);
        setInterviewResults({
          transcripts,
          duration,
          summary: "Interview completed successfully. Detailed analysis unavailable.",
          feedbackMoments: []
        });
      }
    } else {
      setInterviewResults({ transcripts, duration });
    }
    
    setCurrentPhase('reflection');
  };

  const handleRetryMoment = (momentId: string) => {
    // In a real app, this would replay that specific moment
    console.log('Retrying moment:', momentId);
  };

  const handleStartNewInterview = () => {
    setCurrentPhase('setup');
    setInterviewResults({ transcripts: [], duration: 0 });
  };

  switch (currentPhase) {
    case 'landing':
      return <LandingPage onLogin={handleLogin} />;
    
    case 'setup':
      return <SetupPage onStartInterview={handleStartInterview} />;
    
    case 'interview':
      return (
        <InterviewPage
          interviewData={interviewData}
          settings={settings}
          apiKeys={apiKeys}
          onEndInterview={handleEndInterview}
        />
      );
    
    case 'reflection':
      return (
        <div className="min-h-screen bg-blue-200 p-6">
          <div className="max-w-4xl mx-auto">
            <InterviewReflection
              summary={interviewResults.summary || "Interview completed successfully."}
              feedbackMoments={interviewResults.feedbackMoments || []}
              onRetryMoment={handleRetryMoment}
              onStartNewInterview={handleStartNewInterview}
            />
          </div>
        </div>
      );
    
    default:
      return <LandingPage onLogin={handleLogin} />;
  }
}

export default App;