import { Button } from '@/components/ui/button';
import { APIKeys } from '@/types/interview';

interface APIFormsProps {
  apiKeys: APIKeys;
  onApiKeysChange: (apiKeys: APIKeys) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function APIForms({ apiKeys, onApiKeysChange, onNext, onPrevious }: APIFormsProps) {
  const isApiKeysValid = apiKeys.deepgram && apiKeys.openai && apiKeys.speechify;

  const handleApiKeyChange = (key: keyof APIKeys, value: string) => {
    onApiKeysChange({ ...apiKeys, [key]: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-purple-200 flex items-center p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Section - Information */}
          <div className="space-y-6">
            {/* Main Title */}
            <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0_0_#000] -rotate-1">
              <h1 className="text-4xl font-bold">API keys</h1>
            </div>

            {/* Information Panel */}
            <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0_0_#000] rotate-1">
              <div className="space-y-4 text-lg">
                <p>
                We use these in order to generate text, have it read out loud to you, and compiled into reflections. API keys are stored locally within your browser and not saved, meaning they will disappear after you exit or reload the page. If you don’t have them already, click the blue texts to sign up for them.
                </p>
              </div>
            </div>
          </div>

          {/* Right Section - API Key Form */}
          <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0_0_#000]">
            <h2 className="text-2xl font-bold mb-6">API Keys</h2>
            <p className="text-gray-600 mb-6">If you don't have one yet, use the links to sign up for free.</p>

            <div className="space-y-6">
              {/* Speechify API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Speechify API key:
                </label>
                <input
                  type="text"
                  placeholder="Paste API key here"
                  value={apiKeys.speechify}
                  onChange={(e) => handleApiKeyChange('speechify', e.target.value)}
                  className="w-full p-3 border-2 border-black rounded bg-white"
                />
                <a
                  href="https://www.speechify.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm mt-1 inline-block"
                >
                  Sign up here!
                </a>
              </div>

              {/* OpenAI API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI API key:
                </label>
                <input
                  type="text"
                  placeholder="Paste API key here"
                  value={apiKeys.openai}
                  onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                  className="w-full p-3 border-2 border-black rounded bg-white"
                />
                <a
                  href="https://platform.openai.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm mt-1 inline-block"
                >
                  Sign up here!
                </a>
              </div>

              {/* Deepgram API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deepgram API key:
                </label>
                <input
                  type="text"
                  placeholder="Paste API key here"
                  value={apiKeys.deepgram}
                  onChange={(e) => handleApiKeyChange('deepgram', e.target.value)}
                  className="w-full p-3 border-2 border-black rounded bg-white"
                />
                <a
                  href="https://deepgram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm mt-1 inline-block"
                >
                  Sign up here!
                </a>
              </div>
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
            onClick={onNext}
            disabled={!isApiKeysValid}
            className="bg-blue-500 hover:bg-blue-600 text-white border-2 border-black px-6 py-2"
          >
            Next &gt;
          </Button>
        </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 