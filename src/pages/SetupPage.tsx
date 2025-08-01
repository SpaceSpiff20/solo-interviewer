import { useState } from 'react';
import { MultiPageTextInput } from '@/components/MultiPageTextInput';
import { InterviewSettings } from '@/components/InterviewSettings';
import { APIKeysForm } from '@/components/APIKeysForm';
import { Button } from '@/components/ui/button';
import { InterviewData, InterviewSettings as IInterviewSettings, APIKeys } from '@/types/interview';

const textInputPages = [
  {
    id: 'jobDescription',
    title: 'Job details, please:',
    placeholder: 'Paste job description info here.',
    maxLength: 2000,
  },
  {
    id: 'resume',
    title: 'Upload Resume / CV',
    placeholder: 'Paste your resume/CV content here.',
    maxLength: 1500,
  },
  {
    id: 'coverLetter',
    title: 'Upload Cover Letter',
    placeholder: 'Paste your cover letter content here.',
    maxLength: 1000,
    optional: true,
  },
];

interface SetupPageProps {
  onStartInterview: (data: InterviewData, settings: IInterviewSettings, apiKeys: APIKeys) => void;
}

export function SetupPage({ onStartInterview }: SetupPageProps) {
  const [currentStep, setCurrentStep] = useState<'texts' | 'keys' | 'settings'>('texts');
  const [interviewData, setInterviewData] = useState<InterviewData>({
    jobDescription: '',
    resume: '',
    coverLetter: '',
  });
  const [apiKeys, setApiKeys] = useState<APIKeys>({
    deepgram: '',
    openai: '',
  });
  const [settings, setSettings] = useState<IInterviewSettings>({
    duration: 15,
    language: 'en',
    voice: 'oliver',
    allowEarlyEnd: true,
    liveFeedback: true,
    timeRemaining: true,
    postReflection: true,
  });

  const handleTextComplete = () => {
    setCurrentStep('keys');
  };

  const handleTextChange = (pageId: string, value: string) => {
    setInterviewData(prev => ({ ...prev, [pageId]: value }));
  };

  const isApiKeysValid = apiKeys.deepgram && apiKeys.openai;

  const handleStartInterview = () => {
    onStartInterview(interviewData, settings, apiKeys);
  };

  return (
    <div className="min-h-screen bg-blue-200 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with decorative flowers */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-blue-500 text-6xl">❋</div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-white border-2 border-black rounded-full"></div>
            <div className="flex flex-col gap-1">
              <div className="w-24 h-2 bg-gray-300 border border-black"></div>
              <div className="w-16 h-2 bg-gray-300 border border-black"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Text inputs or API keys */}
          <div className="lg:col-span-2">
            {currentStep === 'texts' && (
              <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000] mb-6">
                <h2 className="text-2xl font-bold mb-2">More forms for you to fill out</h2>
                <p className="text-gray-600 mb-6">Fill out the fields below so we can get a better sense of what we are dealing with.</p>
                
                <MultiPageTextInput
                  pages={textInputPages}
                  values={interviewData as unknown as Record<string, string>}
                  onChange={handleTextChange}
                  onComplete={handleTextComplete}
                />

                <div className="mt-6">
                  <p className="text-sm text-gray-600">
                    * If we are unable to extract information from the provided files we will let you know.
                  </p>
                </div>
              </div>
            )}

            {currentStep === 'keys' && (
              <APIKeysForm
                apiKeys={apiKeys}
                onChange={setApiKeys}
                className="mb-6"
              />
            )}

            {currentStep === 'keys' && (
              <div className="flex justify-center">
                <Button
                  onClick={() => setCurrentStep('settings')}
                  disabled={!isApiKeysValid}
                  className="bg-blue-500 hover:bg-blue-600 text-white border-2 border-black shadow-[4px_4px_0_0_#000]"
                >
                  Continue to Settings
                </Button>
              </div>
            )}
          </div>

          {/* Right column - Settings */}
          <div>
            {currentStep === 'settings' && (
              <InterviewSettings
                settings={settings}
                onChange={setSettings}
                onStart={handleStartInterview}
              />
            )}
          </div>
        </div>

        {/* Bottom decorative elements */}
        <div className="flex justify-between items-end mt-12">
          <div className="text-blue-500 text-4xl">❋</div>
        </div>
      </div>
    </div>
  );
}