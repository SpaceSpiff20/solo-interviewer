import { useState } from 'react';
import { InterviewInfo } from './InterviewInfo';
import { APIForms } from './APIForms';
import { InterviewCustomization } from './InterviewCustomization';
import { InterviewData, InterviewSettings as IInterviewSettings, APIKeys } from '@/types/interview';

interface SetupPageProps {
  onStartInterview: (data: InterviewData, settings: IInterviewSettings, apiKeys: APIKeys) => void;
}

export function SetupPage({ onStartInterview }: SetupPageProps) {
  const [currentStep, setCurrentStep] = useState<'info' | 'api' | 'customization'>('info');
  const [interviewData, setInterviewData] = useState<InterviewData>({
    jobDescription: '',
    resume: '',
    coverLetter: '',
  });
  const [apiKeys, setApiKeys] = useState<APIKeys>({
    deepgram: '',
    openai: '',
    speechify: '',
  });
  const [settings, setSettings] = useState<IInterviewSettings>({
    duration: 18,
    language: 'en',
    voice: 'oliver',
    allowEarlyEnd: false,
    liveFeedback: false,
    timeRemaining: false,
    postReflection: false,
  });

  const handleInterviewDataChange = (data: InterviewData) => {
    setInterviewData(data);
  };

  const handleApiKeysChange = (keys: APIKeys) => {
    setApiKeys(keys);
  };

  const handleSettingsChange = (newSettings: IInterviewSettings) => {
    setSettings(newSettings);
  };

  const handleStartInterview = () => {
    onStartInterview(interviewData, settings, apiKeys);
  };

  const goToNext = () => {
    if (currentStep === 'info') {
      setCurrentStep('api');
    } else if (currentStep === 'api') {
      setCurrentStep('customization');
    }
  };

  const goToPrevious = () => {
    if (currentStep === 'api') {
      setCurrentStep('info');
    } else if (currentStep === 'customization') {
      setCurrentStep('api');
    }
  };

  return (
    <>
      {currentStep === 'info' && (
        <InterviewInfo
          interviewData={interviewData}
          onInterviewDataChange={handleInterviewDataChange}
          onNext={goToNext}
        />
      )}
      
      {currentStep === 'api' && (
        <APIForms
          apiKeys={apiKeys}
          onApiKeysChange={handleApiKeysChange}
          onNext={goToNext}
          onPrevious={goToPrevious}
        />
      )}
      
      {currentStep === 'customization' && (
        <InterviewCustomization
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onStartInterview={handleStartInterview}
          onPrevious={goToPrevious}
        />
      )}
    </>
  );
}