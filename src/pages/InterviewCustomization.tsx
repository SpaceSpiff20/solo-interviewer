import { Button } from '@/components/ui/button';
import { InterviewSettings } from '@/types/interview';

interface InterviewCustomizationProps {
  settings: InterviewSettings;
  onSettingsChange: (settings: InterviewSettings) => void;
  onStartInterview: () => void;
  onPrevious: () => void;
}

export function InterviewCustomization({ 
  settings, 
  onSettingsChange, 
  onStartInterview, 
  onPrevious 
}: InterviewCustomizationProps) {
  const handleSettingChange = (key: keyof InterviewSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-purple-200 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Section - Settings Panel */}
          <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0_0_#000]">
            <h2 className="text-2xl font-bold mb-2">Interview Customizing</h2>
            <p className="text-gray-600 mb-8">Customize your interview to meet your needs</p>

            <div className="space-y-6">
              {/* Interview Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Duration (minutes)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="2"
                    max="30"
                    value={settings.duration}
                    onChange={(e) => handleSettingChange('duration', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-lg font-semibold min-w-[2rem]">{settings.duration}</span>
                </div>
              </div>

              {/* Interviewer Voice */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select a voice
                </label>
                <select
                  value={settings.voice}
                  onChange={(e) => handleSettingChange('voice', e.target.value)}
                  className="w-full p-3 border-2 border-black rounded bg-white"
                >
                  <option value="oliver">Oliver</option>
                  <option value="george">George</option>
                  <option value="henry">Henry</option>
                  <option value="lisa">Lisa</option>
                  <option value="emily">Emily</option>
                </select>
              </div>

              {/* Interviewer Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select a language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="w-full p-3 border-2 border-black rounded bg-white"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              {/* Toggle Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Live feedback (NOT IMPLEMENTED YET)</div>
                    <div className="text-sm text-gray-600">
                      Get suggestions on what to say after prolonged silence or a bad answer.
                    </div>
                  </div>
                  <button
                    onClick={() => handleSettingChange('liveFeedback', !settings.liveFeedback)}
                    className={`w-12 h-6 rounded-full border-2 border-black transition-colors ${
                      settings.liveFeedback ? 'bg-blue-500' : 'bg-white'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white border border-black rounded-full transition-transform ${
                      settings.liveFeedback ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Post interview reflection</div>
                    <div className="text-sm text-gray-600">
                      Receive notes on your interview and have the option to save it for later study.
                    </div>
                  </div>
                  <button
                    onClick={() => handleSettingChange('postReflection', !settings.postReflection)}
                    className={`w-12 h-6 rounded-full border-2 border-black transition-colors ${
                      settings.postReflection ? 'bg-blue-500' : 'bg-white'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white border border-black rounded-full transition-transform ${
                      settings.postReflection ? 'translate-x-5' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Time Remaining</div>
                    <div className="text-sm text-gray-600">
                      Displays time remaining during interview
                    </div>
                  </div>
                  <button
                    onClick={() => handleSettingChange('timeRemaining', !settings.timeRemaining)}
                    className={`w-12 h-6 rounded-full border-2 border-black transition-colors ${
                      settings.timeRemaining ? 'bg-blue-500' : 'bg-white'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white border border-black rounded-full transition-transform ${
                      settings.timeRemaining ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Allow interview to end early</div>
                    <div className="text-sm text-gray-600">
                      If the interviewer feels they can end the interview early, they can.
                    </div>
                  </div>
                  <button
                    onClick={() => handleSettingChange('allowEarlyEnd', !settings.allowEarlyEnd)}
                    className={`w-12 h-6 rounded-full border-2 border-black transition-colors ${
                      settings.allowEarlyEnd ? 'bg-blue-500' : 'bg-white'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white border border-black rounded-full transition-transform ${
                      settings.allowEarlyEnd ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Information and Call to Action */}
          <div className="space-y-6">
            <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0_0_#000] rotate-1">
              <h1 className="text-3xl font-bold mb-4">
                Customize your interview to better help you practice.
              </h1>
              <p className="text-lg leading-relaxed mb-8">
                These settings can help make the interview seem more or less formal. They provide more guardrails for you so you don't feel as stressed in the moment. After you are done with changing the settings, click the start interview button below!
              </p>
              {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={onPrevious}
            variant="outline"
            className="border-2 border-black px-6 py-2"
          >
            &lt; Previous
          </Button>
          <Button
            onClick={onStartInterview}
            className="bg-blue-500 hover:bg-blue-600 text-white border-2 border-black px-6 py-2"
          >
            Start Interview
          </Button>
        </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 